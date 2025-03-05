// src/app/shared/components/video-player/video-player.component.ts
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { BaseComponent } from '../base/base-component';
import Hls from 'hls.js';

export interface Subtitle {
  src: string;
  label: string;
  srclang: string;
  default?: boolean;
}

export interface PlaybackQuality {
  label: string;
  height: number;
  bitrate: number;
}

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html'
})
export class VideoPlayerComponent extends BaseComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;
  
  @Input() src!: string;
  @Input() poster?: string;
  @Input() autoplay: boolean = false;
  @Input() muted: boolean = false;
  @Input() loop: boolean = false;
  @Input() subtitles: Subtitle[] = [];
  @Input() title?: string;
  @Input() startTime: number = 0;
  
  // Player state
  hls: Hls | null = null;
  isPlaying: boolean = false;
  isMuted: boolean = false;
  volume: number = 1;
  currentTime: number = 0;
  duration: number = 0;
  bufferedPercent: number = 0;
  isFullscreen: boolean = false;
  showControls: boolean = true;
  isLoading: boolean = true;
  
  // Quality settings
  qualityLevels: PlaybackQuality[] = [];
  currentQuality: number = -1; // -1 means auto
  
  // Subtitle settings
  currentSubtitle: number = -1; // -1 means off
  
  // Playback settings
  playbackRates: number[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  currentPlaybackRate: number = 1;
  
  // UI controls
  activeSettingsMenu: 'quality' | 'playbackRate' | 'subtitles' | null = null;
  controlsTimeout: any;
  
  ngAfterViewInit(): void {
    const video = this.videoElement.nativeElement;
    this.isMuted = this.muted;
    video.muted = this.muted;
    
    this.initPlayer();
    this.addEventListeners();
    
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && !changes['src'].firstChange) {
      this.resetPlayer();
      this.initPlayer();
    }
  }
  
  private initPlayer(): void {
    if (!this.src) return;
    
    const video = this.videoElement.nativeElement;
    
    // Reset player state
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.isLoading = true;
    this.currentQuality = -1;
    
    // Check if HLS format
    if (this.src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        this.setupHls();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = this.src;
      }
    } else {
      // Regular video
      video.src = this.src;
    }
    
    if (this.startTime > 0) {
      video.currentTime = this.startTime;
    }
    
    if (this.autoplay) {
      this.play();
    }
  }
  
  private setupHls(): void {
    if (this.hls) {
      this.hls.destroy();
    }
    
    const video = this.videoElement.nativeElement;
    
    this.hls = new Hls({
      enableWorker: true,
      autoStartLoad: true,
      capLevelToPlayerSize: true,
      abrEwmaDefaultEstimate: 1e6 // Initial bandwidth estimate
    });
    
    this.hls.attachMedia(video);
    
    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      this.hls?.loadSource(this.src);
    });
    
    this.hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      this.qualityLevels = data.levels.map(level => ({
        label: `${level.height}p`,
        height: level.height,
        bitrate: level.bitrate
      }));
      
      // Sort quality levels from highest to lowest
      this.qualityLevels.sort((a, b) => b.height - a.height);
      
      // Set auto quality by default
      this.hls!.startLevel = -1;
      
      if (this.autoplay) {
        this.play();
      }
    });
    
    this.hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // Try to recover network error
            console.log('Fatal network error encountered, try to recover');
            this.hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('Fatal media error encountered, try to recover');
            this.hls?.recoverMediaError();
            break;
          default:
            // Cannot recover
            this.hls?.destroy();
            break;
        }
      }
    });
  }
  
  private addEventListeners(): void {
    const video = this.videoElement.nativeElement;
    
    video.addEventListener('play', () => {
      this.isPlaying = true;
    });
    
    video.addEventListener('pause', () => {
      this.isPlaying = false;
    });
    
    video.addEventListener('timeupdate', () => {
      this.currentTime = video.currentTime;
    });
    
    video.addEventListener('durationchange', () => {
      this.duration = video.duration;
    });
    
    video.addEventListener('volumechange', () => {
      this.isMuted = video.muted;
      this.volume = video.volume;
    });
    
    video.addEventListener('loadstart', () => {
      this.isLoading = true;
    });
    
    video.addEventListener('canplay', () => {
      this.isLoading = false;
    });
    
    video.addEventListener('waiting', () => {
      this.isLoading = true;
    });
    
    video.addEventListener('progress', () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        this.bufferedPercent = (bufferedEnd / video.duration) * 100;
      }
    });
    
    video.addEventListener('ratechange', () => {
      this.currentPlaybackRate = video.playbackRate;
    });
  }
  
  // Media controls
  play(): void {
    const video = this.videoElement.nativeElement;
    if (video.paused) {
      video.play().catch((error) => {
        console.error('Error attempting to play:', error);
      });
    }
  }
  
  pause(): void {
    const video = this.videoElement.nativeElement;
    if (!video.paused) {
      video.pause();
    }
  }
  
  togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
  
  seek(time: number): void {
    const video = this.videoElement.nativeElement;
    video.currentTime = time;
  }
  
  setVolume(value: number): void {
    const video = this.videoElement.nativeElement;
    video.volume = Math.max(0, Math.min(1, value));
    if (value > 0 && video.muted) {
      video.muted = false;
    }
  }
  
  toggleMute(): void {
    const video = this.videoElement.nativeElement;
    video.muted = !video.muted;
  }
  
  setPlaybackRate(rate: number): void {
    const video = this.videoElement.nativeElement;
    video.playbackRate = rate;
    this.activeSettingsMenu = null;
  }
  
  setQuality(index: number): void {
    if (!this.hls) return;
    
    this.currentQuality = index;
    this.hls.currentLevel = index;
    this.activeSettingsMenu = null;
  }
  
  setSubtitle(index: number): void {
    this.currentSubtitle = index;
    const tracks = this.videoElement.nativeElement.textTracks;
    
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = i === index ? 'showing' : 'hidden';
    }
    
    this.activeSettingsMenu = null;
  }
  
  // UI controls
  toggleFullscreen(): void {
    const container = this.videoContainer.nativeElement;
    
    if (!this.isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
  
  onProgressBarClick(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    this.seek(position * this.duration);
  }
  
  toggleSettingsMenu(menu: 'quality' | 'playbackRate' | 'subtitles'): void {
    this.activeSettingsMenu = this.activeSettingsMenu === menu ? null : menu;
  }
  
  showControlsTemporarily(): void {
    this.showControls = true;
    clearTimeout(this.controlsTimeout);
    
    if (this.isPlaying) {
      this.controlsTimeout = setTimeout(() => {
        this.showControls = false;
      }, 3000);
    }
  }
  
  // Format time display (e.g., 1:23:45)
  formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  }
  
  // Event handlers
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only handle keyboard shortcuts when player is in focus
    if (!this.videoContainer.nativeElement.contains(document.activeElement)) {
      return;
    }
    
    switch (event.code) {
      case 'Space':
        this.togglePlay();
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.seek(Math.max(0, this.currentTime - 10));
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.seek(Math.min(this.duration, this.currentTime + 10));
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.setVolume(Math.min(1, this.volume + 0.1));
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.setVolume(Math.max(0, this.volume - 0.1));
        event.preventDefault();
        break;
      case 'KeyM':
        this.toggleMute();
        event.preventDefault();
        break;
      case 'KeyF':
        this.toggleFullscreen();
        event.preventDefault();
        break;
    }
  }
  
  fullscreenChangeHandler = (): void => {
    this.isFullscreen = document.fullscreenElement === this.videoContainer.nativeElement;
  };
  
  // Reset and cleanup
  resetPlayer(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    
    this.qualityLevels = [];
    this.currentQuality = -1;
    this.activeSettingsMenu = null;
  }
  
  ngOnDestroy(): void {
    super.ngOnDestroy();
    
    this.resetPlayer();
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
    clearTimeout(this.controlsTimeout);
  }
}