function normalized(value, max) {
  if (!max || max <= 0) return 0;
  return Math.max(0, Math.min(1, value / max));
}

export function calculateAlphaScores(baseMetrics) {
  const maxRevenue = Math.max(0, ...baseMetrics.map((metric) => metric.attributedRevenue ?? metric.totalRevenue));
  const maxDeals = Math.max(0, ...baseMetrics.map((metric) => metric.totalDeals));
  return baseMetrics.map((metric) => {
    const revenueScore = normalized(metric.attributedRevenue ?? metric.totalRevenue, maxRevenue);
    const survivalScore = metric.survivalRate ?? 0;
    const dealSuccessScore = metric.dealSuccessRate ?? 0;
    const dealVolumeScore = normalized(metric.totalDeals, maxDeals);
    const alphaScore = Math.round(
      100 * (revenueScore * 0.4 + survivalScore * 0.3 + dealSuccessScore * 0.2 + dealVolumeScore * 0.1)
    );
    return {
      ...metric,
      alphaScore,
      dataConfidence: metric.revenueCoverage >= 0.66 ? "high" : metric.revenueCoverage >= 0.33 ? "medium" : "low"
    };
  });
}
