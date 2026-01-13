/**
 * Benchmarking & Decision Engine Utilities
 * Contains business logic for campaign performance analysis
 */

// ============================================
// SCORING THRESHOLDS
// ============================================

/**
 * Performance comparison threshold (±15%)
 * Used to determine if a metric is significantly better or worse than historical average
 */
export const PERFORMANCE_THRESHOLD_PERCENT = 15;

/**
 * Acceptable variance for engagement metrics (±20%)
 * Cost per engagement can have more variance than impressions
 */
export const ENGAGEMENT_VARIANCE_PERCENT = 20;

/**
 * Variance tolerance for budget calculations (1%)
 * Used when checking if quarterly budgets sum to annual budget
 */
export const BUDGET_VARIANCE_TOLERANCE = 0.01;

// ============================================
// RECOMMENDATION SCORING THRESHOLDS
// ============================================

/**
 * Score >= 3.5 = Excellent Plan (Dark Green)
 * Campaign significantly outperforms benchmarks (15%+ better on multiple metrics)
 */
export const SCORE_EXCELLENT = 3.5;

/**
 * Score >= 2.75 = Good Plan (Green)
 * Campaign meets or slightly exceeds benchmarks
 */
export const SCORE_GOOD = 2.75;

/**
 * Score >= 2.0 = Review Carefully (Amber)
 * Campaign below average but not terrible - may be acceptable with justification
 */
export const SCORE_REVIEW = 2.0;

/**
 * Score < 2.0 = Consider Alternatives (Red)
 * Campaign significantly underperforms - should renegotiate or skip
 */
// Anything below SCORE_REVIEW is considered poor

/**
 * Individual metric score values
 * Higher is better
 */
export const METRIC_SCORE = {
  EXCELLENT: 4,  // 15%+ better than benchmark
  GOOD: 3,       // Matches benchmark (within 0-15%)
  FAIR: 2,       // Slightly worse (0-15% worse, or 0-20% for engagement)
  POOR: 1        // Significantly worse (>15% or >20% worse)
};

// ============================================
// RECOMMENDATION CATEGORIES
// ============================================

export const RECOMMENDATION_LEVELS = {
  EXCELLENT: {
    label: 'Excellent Plan',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100 border-emerald-300',
    icon: 'CheckCircle2'
  },
  GOOD: {
    label: 'Good Plan',
    color: 'text-green-800',
    bgColor: 'bg-green-100 border-green-300',
    icon: 'CheckCircle'
  },
  REVIEW: {
    label: 'Review Carefully',
    color: 'text-amber-800',
    bgColor: 'bg-amber-100 border-amber-300',
    icon: 'AlertTriangle'
  },
  POOR: {
    label: 'Consider Alternatives',
    color: 'text-red-800',
    bgColor: 'bg-red-100 border-red-300',
    icon: 'AlertOctagon'
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate average metric from historical campaigns
 * Guards against division by zero and empty datasets
 *
 * @param {Array} campaigns - Array of campaign objects
 * @param {string} metric - Metric to calculate ('cpm', 'cpe', 'rate', 'roas')
 * @param {string} campaignType - 'Awareness' or 'Conversion'
 * @returns {number|null} Average value or null if no data
 */
export function calculateAverageMetric(campaigns, metric, campaignType) {
  if (!campaigns || campaigns.length === 0) return null;

  const sum = campaigns.reduce((acc, campaign) => {
    const actuals = campaign.actuals;
    if (!actuals) return acc;

    // Guard against division by zero
    if (metric === 'cpm') {
      if (!actuals.impressions || actuals.impressions === 0) return acc;
      return acc + ((actuals.spend / actuals.impressions) * 1000);
    }

    if (metric === 'cpe') {
      const engagement = campaignType === 'Awareness' ? actuals.clicks : actuals.leads;
      if (!engagement || engagement === 0) return acc;
      return acc + (actuals.spend / engagement);
    }

    if (metric === 'rate') {
      if (!actuals.impressions || actuals.impressions === 0) return acc;
      const engagement = campaignType === 'Awareness' ? actuals.clicks : actuals.leads;
      return acc + ((engagement / actuals.impressions) * 100);
    }

    if (metric === 'roas') {
      if (!actuals.spend || actuals.spend === 0) return acc;
      return acc + (actuals.gp / actuals.spend);
    }

    return acc;
  }, 0);

  return sum / campaigns.length;
}

/**
 * Get recommendation based on average score
 *
 * @param {number} avgScore - Average score from all metrics
 * @returns {object} Recommendation object with label, colors, and icon
 */
export function getRecommendation(avgScore) {
  if (avgScore >= SCORE_EXCELLENT) return RECOMMENDATION_LEVELS.EXCELLENT;
  if (avgScore >= SCORE_GOOD) return RECOMMENDATION_LEVELS.GOOD;
  if (avgScore >= SCORE_REVIEW) return RECOMMENDATION_LEVELS.REVIEW;
  return RECOMMENDATION_LEVELS.POOR;
}

/**
 * Score a metric based on comparison to benchmark
 *
 * @param {number} value - Current value
 * @param {number} benchmark - Historical average
 * @param {boolean} lowerIsBetter - True for costs (CPM, CPC, CPL), false for rates (CTR, ROAS)
 * @param {boolean} isEngagement - True for engagement metrics (allows more variance)
 * @returns {number} Score (1-4)
 */
export function scoreMetric(value, benchmark, lowerIsBetter = false, isEngagement = false) {
  if (!benchmark || benchmark === 0) return METRIC_SCORE.GOOD; // No benchmark, assume good

  const percentDiff = ((value - benchmark) / benchmark) * 100;
  const threshold = isEngagement ? ENGAGEMENT_VARIANCE_PERCENT : PERFORMANCE_THRESHOLD_PERCENT;

  if (lowerIsBetter) {
    // For costs: lower is better
    if (percentDiff <= -threshold) return METRIC_SCORE.EXCELLENT;
    if (percentDiff <= 0) return METRIC_SCORE.GOOD;
    if (percentDiff <= threshold) return METRIC_SCORE.FAIR;
    return METRIC_SCORE.POOR;
  } else {
    // For rates/returns: higher is better
    if (percentDiff >= threshold) return METRIC_SCORE.EXCELLENT;
    if (percentDiff >= 0) return METRIC_SCORE.GOOD;
    if (percentDiff >= -threshold) return METRIC_SCORE.FAIR;
    return METRIC_SCORE.POOR;
  }
}
