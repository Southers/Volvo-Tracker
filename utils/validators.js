/**
 * Input Validation & Sanitization Utilities
 * Prevents malicious data from entering the system
 */

// NOTE: For browser environments, load DOMPurify via CDN in HTML:
// <script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>

/**
 * Sanitize string input - remove HTML and dangerous characters
 * Uses DOMPurify if available, falls back to basic sanitization
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';

  // Use DOMPurify if available (loaded via CDN)
  if (typeof window !== 'undefined' && window.DOMPurify) {
    return window.DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // Strip all HTML tags
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true // Keep text content
    }).trim().slice(0, 500);
  }

  // Fallback: Basic sanitization
  const withoutHtml = input.replace(/<[^>]*>/g, '');
  const withoutScripts = withoutHtml.replace(/javascript:/gi, '');
  const withoutEvents = withoutScripts.replace(/on\w+\s*=/gi, '');

  return withoutEvents.trim().slice(0, 500);
}

/**
 * Validate campaign data before saving
 */
export function validateCampaign(data) {
  const errors = {};

  // Name validation
  if (!data.name || data.name.trim().length < 3) {
    errors.name = "Campaign name must be at least 3 characters";
  }
  if (data.name && data.name.length > 200) {
    errors.name = "Campaign name must be less than 200 characters";
  }

  // Month validation (YYYY-MM format)
  if (!data.month || !/^\d{4}-\d{2}$/.test(data.month)) {
    errors.month = "Invalid month format. Use YYYY-MM";
  }

  // Type validation
  if (!['Conversion', 'Awareness'].includes(data.type)) {
    errors.type = "Type must be either 'Conversion' or 'Awareness'";
  }

  // Provider validation
  const validProviders = ['Carwow', 'Autotrader', 'Leasing.com', 'WhatCar?', 'PistonHeads', 'AutoExpress'];
  if (!validProviders.includes(data.provider)) {
    errors.provider = "Invalid provider";
  }

  // Plan validation
  if (data.plan) {
    if (typeof data.plan.spend !== 'number' || data.plan.spend < 0) {
      errors.spend = "Spend must be a positive number";
    }
    if (data.plan.spend > 1000000) {
      errors.spend = "Spend cannot exceed £1,000,000 per campaign";
    }
    if (typeof data.plan.impressions !== 'number' || data.plan.impressions < 0) {
      errors.impressions = "Impressions must be a positive number";
    }
    if (data.plan.impressions > 100000000) {
      errors.impressions = "Impressions seem unrealistically high";
    }
    if (data.type === 'Awareness' && (typeof data.plan.clicks !== 'number' || data.plan.clicks < 0)) {
      errors.clicks = "Clicks must be a positive number for Awareness campaigns";
    }
    if (data.type === 'Conversion' && (typeof data.plan.leads !== 'number' || data.plan.leads < 0)) {
      errors.leads = "Leads must be a positive number for Conversion campaigns";
    }
  }

  // Actuals validation (if provided)
  if (data.actuals) {
    if (typeof data.actuals.spend !== 'number' || data.actuals.spend < 0) {
      errors.actualSpend = "Actual spend must be a positive number";
    }
    if (typeof data.actuals.impressions !== 'number' || data.actuals.impressions < 0) {
      errors.actualImpressions = "Actual impressions must be a positive number";
    }
    if (data.type === 'Conversion') {
      if (typeof data.actuals.sales !== 'number' || data.actuals.sales < 0) {
        errors.sales = "Sales must be a positive number";
      }
      if (typeof data.actuals.gp !== 'number' || data.actuals.gp < 0) {
        errors.gp = "Gross profit must be a positive number";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate config data
 */
export function validateConfig(data) {
  const errors = {};

  if (!data.fiscalLabel || data.fiscalLabel.trim().length < 2) {
    errors.fiscalLabel = "Fiscal label is required";
  }

  if (typeof data.annualBudget !== 'number' || data.annualBudget <= 0) {
    errors.annualBudget = "Annual budget must be a positive number";
  }
  if (data.annualBudget > 10000000) {
    errors.annualBudget = "Annual budget cannot exceed £10,000,000";
  }

  const quarters = ['q1', 'q2', 'q3', 'q4'];
  quarters.forEach(q => {
    if (typeof data[q] !== 'number' || data[q] < 0) {
      errors[q] = `${q.toUpperCase()} budget must be a positive number`;
    }
  });

  // Check if quarters sum to annual budget (allow 1% variance)
  // Guard against division by zero
  if (data.annualBudget > 0) {
    const quarterSum = data.q1 + data.q2 + data.q3 + data.q4;
    const variance = Math.abs(quarterSum - data.annualBudget) / data.annualBudget;
    if (variance > 0.01) {
      errors.quarters = "Quarterly budgets should sum to annual budget";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize campaign data before saving
 */
export function sanitizeCampaign(data) {
  return {
    ...data,
    name: sanitizeString(data.name),
    provider: sanitizeString(data.provider),
    type: sanitizeString(data.type),
    month: sanitizeString(data.month)
  };
}

/**
 * Validate email format (RFC 5322 compliant)
 * More robust than basic regex
 */
export function isValidEmail(email) {
  // RFC 5322 compliant email regex (simplified but accurate)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Check if email is from allowed domain
 * Uses optional chaining to prevent null pointer errors
 */
export function isAllowedDomain(email) {
  if (!email || typeof email !== 'string') return false;

  const allowedDomains = ['volvocars.com', 'volvo.com'];
  const domain = email.split('@')[1]?.toLowerCase();

  return domain ? allowedDomains.includes(domain) : false;
}
