
export interface Channel {
  id: number;
  name: string;
  group: string;
  url: string;
  logo: string;
}

export interface PlayerStats {
  bufferLength: number;
  latency: number;
  quality: string;
  bandwidth: number;
}

export enum PlayerState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  BUFFERING = 'BUFFERING',
  ERROR = 'ERROR'
}
