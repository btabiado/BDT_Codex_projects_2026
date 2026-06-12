/**
 * Runtime-friendly type documentation for the Shark Tank Intelligence Platform.
 *
 * DealStatus: "deal" | "no_deal" | "unknown"
 * BusinessStatus: "active" | "inactive" | "unknown"
 *
 * PitchRecord:
 * {
 *   id: string,
 *   season: number | null,
 *   episode: number | null,
 *   airDate?: string | null,
 *   companyName: string,
 *   description?: string | null,
 *   dealStatus: DealStatus,
 *   dealTermsRaw?: string | null,
 *   investors: string[],
 *   businessStatus: BusinessStatus,
 *   revenueRaw?: string | null,
 *   revenueAmount?: number | null,
 *   revenueDate?: string | null,
 *   sourceUrl?: string | null,
 *   industry?: string | null
 * }
 *
 * SharkMetrics:
 * {
 *   sharkName: string,
 *   totalDeals: number,
 *   activeCompanies: number,
 *   survivalRate: number | null,
 *   totalRevenue: number,
 *   averageRevenue: number | null,
 *   largestWinner?: string | null,
 *   favoriteIndustry?: string | null,
 *   alphaScore: number,
 *   dataConfidence: "high" | "medium" | "low"
 * }
 */

export {};
