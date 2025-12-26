
export const PLAYLIST_URL = "https://raw.githubusercontent.com/Miguel179-spe/tvlion/refs/heads/peliculas/LiveTV.m3u";

// HLS Configuration to prevent freezing
// These settings balance latency and stability
export const HLS_CONFIG = {
  enableWorker: true,
  lowLatencyMode: false, // Set to false for better stability on unstable networks
  backBufferLength: 60,
  maxBufferLength: 30, // How many seconds of video to buffer ahead
  maxMaxBufferLength: 600,
  maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer size
  maxBufferHole: 0.5,
  manifestLoadingTimeOut: 10000,
  manifestLoadingMaxRetry: 5,
  fragLoadingTimeOut: 10000,
  fragLoadingMaxRetry: 5,
  startLevel: -1, // Auto quality selection based on bandwidth
  liveSyncDurationCount: 3, // Synchronize with the live edge
  liveMaxLatencyDurationCount: 10,
};
