import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import Hls from 'hls.js';

@Component({
  selector: 'app-video-player',
  standalone: false,
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent implements AfterViewInit, OnDestroy, OnInit, OnChanges {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;
  @Input() src!: string;
  @Input() subtitleTracks: { src: string; label: string; lang: string }[] = [];

  hls!: Hls;
  currentTime = 0;
  duration = 0;
  isPlaying = false;
  isMuted = false;
  volume = 1;
  playbackRate = 1;
  isFullscreen = false;
  showControls = false;
  qualityLevels = [];
  currentQuality = -1;
  currentSubtitle = -1;
  autoQuality = true;
  showSettingsMenu: 'quality' | 'speed' | 'subtitle' | null = null;

  private controlsTimeout: any;
  private readonly keyboardShortcuts: { [key: string]: () => void } = {
    'ArrowRight': () => this.seek(15),
    'ArrowLeft': () => this.seek(-15),
    'ArrowUp': () => this.adjustVolume(0.05),
    'ArrowDown': () => this.adjustVolume(-0.05),
    ' ': this.togglePlay.bind(this),
    'k': this.togglePlay.bind(this),
    'K': this.togglePlay.bind(this),
    'f': this.toggleFullscreen.bind(this),
    'F': this.toggleFullscreen.bind(this),
    'm': this.toggleMute.bind(this),
    'M': this.toggleMute.bind(this)
  };

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.setupHls();
  }

  ngAfterViewInit() {
    this.setupEventListeners();
    this.setupHlsQualitySwitching();

    document.addEventListener('fullscreenchange', this.fullscreenListener);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['src']) {
      this.reinitializePlayer();
    }
  }

  private setupHls() {
    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        autoStartLoad: true,
        capLevelToPlayerSize: true,
        abrEwmaDefaultEstimate: 1e6 // Initial bandwidth estimate
      });

      this.hls.attachMedia(this.videoElement.nativeElement);
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls.loadSource(this.src);
      });

      this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        this.qualityLevels = data.levels;
        this.updateQualityMenu();
      });

      this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        this.currentQuality = data.level;
      });
    }
  }

  private setupHlsQualitySwitching() {
    this.hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
      const bandwidth = this.hls.bandwidthEstimate;
      this.autoAdjustQuality(bandwidth);
    });
  }

  private autoAdjustQuality(bandwidth: number) {
    if (!this.autoQuality) return;

    const levels = this.qualityLevels
      .filter(level => level.bitrate <= bandwidth)
      .sort((a, b) => b.bitrate - a.bitrate);

    if (levels.length > 0) {
      this.hls.nextLevel = levels[0].height;
    }
  }

  private setupEventListeners() {
    const video = this.videoElement.nativeElement;
    
    video.addEventListener('timeupdate', () => {
      this.currentTime = video.currentTime;
      this.duration = video.duration;
    });

    video.addEventListener('play', () => this.isPlaying = true);
    video.addEventListener('pause', () => this.isPlaying = false);
    video.addEventListener('volumechange', () => {
      this.isMuted = video.muted;
      this.volume = video.volume;
    });
  }

  togglePlay() {
    if (this.isPlaying) {
      this.videoElement.nativeElement.pause();
    } else {
      this.videoElement.nativeElement.play();
    }
  }

  seek(seconds: number) {
    this.videoElement.nativeElement.currentTime += seconds;
  }

  adjustVolume(change: number) {
    const newVolume = Math.min(Math.max(this.volume + change, 0), 1);
    this.setVolume(newVolume);
  }

  toggleMute() {
    this.videoElement.nativeElement.muted = !this.isMuted;
  }

  setVolume(volume: number) {
    this.videoElement.nativeElement.volume = volume;
    this.videoElement.nativeElement.muted = false;
  }

  setPlaybackSpeed(speed: number) {
    this.videoElement.nativeElement.playbackRate = speed;
    this.playbackRate = speed;
  }

  toggleFullscreen() {
    if (!this.isFullscreen) {
      const elem = this.videoContainer.nativeElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    // Không cần set isFullscreen ở đây vì sẽ được handle bởi fullscreenListener
    // this.isFullscreen = !this.isFullscreen;
  }

  setQuality(level: number) {
    this.autoQuality = level === -1;
    if (level === -1) {
      this.hls.nextLevel = -1;
    } else {
      this.hls.nextLevel = level;
    }
    this.showSettingsMenu = null;
  }

  setSubtitle(index: number) {
    this.currentSubtitle = index;
    const tracks = this.videoElement.nativeElement.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = i === index ? 'showing' : 'hidden';
    }
    this.showSettingsMenu = null;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.showControls) {
      const action = this.keyboardShortcuts[event.key];
      if (action) {
        action();
        event.preventDefault();
      }
    }
  }

  showControlsTemporarily() {
    this.showControls = true;
    clearTimeout(this.controlsTimeout);
    this.controlsTimeout = setTimeout(() => {
      this.showControls = false;
    }, 3000);
  }

  private updateQualityMenu() {
    this.qualityLevels = this.qualityLevels.sort((a, b) => b.height - a.height);
  }

  private reinitializePlayer() {
    if (this.hls) {
      this.hls.destroy();
    }
    this.setupHls();
  }

  fullscreenListener = () => {
    this.isFullscreen = !!document.fullscreenElement;
  };

  ngOnDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
    document.removeEventListener('fullscreenchange', this.fullscreenListener);
  }
}
