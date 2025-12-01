export type MaterialStatus = 'uploading' | 'parsing' | 'ready' | 'error' | 'applying';

export interface AnimationMaterial {
  id: string;
  file: File;
  name: string;
  size: number; // in bytes
  type: string;
  url: string; // Blob URL
  status: MaterialStatus;
  uploadProgress: number; // 0-100
  thumbnail?: string;
  duration?: number; // in seconds
  errorMessage?: string;
}

export type PlaybackSpeed = 0.5 | 1.0 | 2.0;

export interface PreviewSettings {
  playbackRate: PlaybackSpeed;
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
}