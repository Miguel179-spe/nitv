export const PLAYLIST_URL = "https://raw.githubusercontent.com/Miguel179-spe/tvlion/refs/heads/peliculas/LiveTV.m3u";

// HLS Configuration to prevent freezing
// Estas configuraciones están diseñadas para maximizar la estabilidad
export const HLS_CONFIG = {
  enableWorker: true,
  lowLatencyMode: false, // Desactivado para mayor estabilidad
  backBufferLength: 90,
  maxBufferLength: 60, // Aumentamos el buffer a 60 segundos
  maxMaxBufferLength: 120,
  maxBufferSize: 60 * 1000 * 1000, // 60MB
  maxBufferHole: 0.5,
  manifestLoadingTimeOut: 20000,
  manifestLoadingMaxRetry: 10,
  fragLoadingTimeOut: 20000,
  fragLoadingMaxRetry: 10,
  levelLoadingTimeOut: 20000,
  levelLoadingMaxRetry: 10,
  startLevel: -1, // Selección automática de calidad
  liveSyncDurationCount: 5, // Aumentar margen de sincronización para evitar cortes
  liveMaxLatencyDurationCount: 15,
  abrEwmaDefaultEstimate: 500000, // Estimación inicial conservadora
  testBandwidth: true
};