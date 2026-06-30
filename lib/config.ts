// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================
// Use Next.js API proxy to avoid CORS issues
// ============================================================================

export const CONFIG = {
  API_BASE_URL: '/api/proxy',
  ENABLE_MOCK_DATA: false,
  // Simulated network latency (ms) used only while ENABLE_MOCK_DATA is true
  MOCK_DELAY: 800,
} as const
