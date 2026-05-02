import { Component, Input, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-media-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (mediaType === 'IMAGE') {
      <div class="mp-image-wrap" (click)="toggleExpanded()">
        <img [src]="mediaUrl" [alt]="alt" loading="lazy" [class.expanded]="expanded" />
        <div class="img-overlay">
          <span class="img-hint text-mono text-xs">{{ expanded ? 'CLICK TO COLLAPSE' : 'CLICK TO EXPAND' }}</span>
        </div>
      </div>
    }

    @if (mediaType === 'VIDEO') {
      <div class="mp-video-wrap" (mouseenter)="hovered = true" (mouseleave)="hovered = false">
        <video
          #videoEl
          [src]="mediaUrl"
          preload="metadata"
          (timeupdate)="onTimeUpdate()"
          (loadedmetadata)="onMetadata()"
          (ended)="onEnded()"
          (click)="togglePlay()"
        ></video>

        <!-- Scanline overlay on video -->
        <div class="vid-scanlines"></div>

        <!-- Big play button in center when paused -->
        @if (!isPlaying) {
          <div class="vid-play-center" (click)="togglePlay()">
            <span class="play-icon">&#9654;</span>
          </div>
        }

        <div class="vid-controls" [class.visible]="hovered || !isPlaying">
          <div class="vid-progress" (click)="seek($event)" #progressBar>
            <div class="vid-bar-fill" [style.width.%]="progress">
              <div class="vid-scrubber"></div>
            </div>
          </div>

          <div class="vid-bottom">
            <div class="vid-left">
              <h1 class="video-btn" (click)="togglePlay()">
                {{ isPlaying ? 'PAUSE' : 'PLAY' }}
              </h1>
              <span class="vid-time">{{ currentTimeStr }} / {{ durationStr }}</span>
            </div>
            <div class="vid-right">
              <h1 class="video-btn" (click)="toggleMute()">
                {{ isMuted ? 'UNMUTE' : 'MUTE' }}
              </h1>
              <input type="range" min="0" max="1" step="0.05"
                [value]="volume" (input)="setVolume($event)" class="vol-slider" />
              <h1 class="video-btn" (click)="toggleFullscreen()">FULL</h1>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ——— IMAGE ——— */
    .mp-image-wrap {
      position: relative;
      overflow: hidden;
      background: #000;
      cursor: zoom-in;
      margin-bottom: 0.8rem;

      img {
        width: 100%;
        display: block;
        max-height: 380px;
        object-fit: cover;
        filter: saturate(0.25) brightness(0.82) contrast(1.05);
        transition: filter 0.5s ease, max-height 0.4s var(--ease), transform 0.3s var(--ease);
      }

      img.expanded {
        max-height: 700px;
        object-fit: contain;
        filter: saturate(0.55) brightness(0.95);
        cursor: zoom-out;
      }

      /* Scanline overlay */
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          to bottom,
          transparent 0px,
          transparent 2px,
          rgba(0,0,0,0.18) 2px,
          rgba(0,0,0,0.18) 4px
        );
        pointer-events: none;
        z-index: 1;
        transition: opacity 0.4s;
      }

      &:hover::before { opacity: 0.5; }
      &:hover img:not(.expanded) {
        filter: saturate(0.5) brightness(0.92) contrast(1.05);
        transform: scale(1.01);
      }
    }

    .img-overlay {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 0.4rem 0.7rem;
      background: linear-gradient(transparent, rgba(0,6,0,0.7));
      display: flex;
      justify-content: flex-end;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 2;
    }
    .mp-image-wrap:hover .img-overlay { opacity: 1; }
    .img-hint { color: var(--C-dim); opacity: 0.7; letter-spacing: 0.08em; }

    /* ——— VIDEO ——— */
    .mp-video-wrap {
      position: relative;
      background: #000;
      margin-bottom: 0.8rem;
      overflow: hidden;

      video {
        width: 100%;
        display: block;
        max-height: 480px;
        object-fit: contain;
        cursor: pointer;
        filter: saturate(0.35) brightness(0.85);
        transition: filter 0.3s ease;
      }

      &:hover video { filter: saturate(0.55) brightness(0.95); }
    }

    .vid-scanlines {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 3px,
        rgba(0,0,0,0.12) 3px,
        rgba(0,0,0,0.12) 4px
      );
      pointer-events: none;
      z-index: 1;
    }

    .vid-play-center {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
      cursor: pointer;
      background: rgba(0,0,0,0.15);
      transition: background 0.2s;

      &:hover { background: rgba(0,0,0,0.25); }
    }
    .play-icon {
      font-size: 2.5rem;
      color: var(--C);
      text-shadow: 0 0 24px var(--Ts), 0 0 48px var(--Ts);
      opacity: 0.85;
      transition: transform 0.15s, opacity 0.15s;
      line-height: 1;
    }
    .vid-play-center:hover .play-icon { transform: scale(1.12); opacity: 1; }

    /* Controls bar */
    .vid-controls {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      background: linear-gradient(transparent, rgba(0,8,0,0.95));
      padding: 1.2rem 0.8rem 0.55rem;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 4;
    }
    .vid-controls.visible { opacity: 1; }

    .vid-progress {
      width: 100%;
      height: 3px;
      background: rgba(91,248,112,0.15);
      cursor: pointer;
      margin-bottom: 0.45rem;
      position: relative;
      transition: height 0.15s;

      &:hover { height: 5px; }
    }

    .vid-bar-fill {
      height: 100%;
      background: var(--C);
      box-shadow: 0 0 8px var(--Ts);
      position: relative;
      transition: width 0.1s linear;
    }

    .vid-scrubber {
      position: absolute;
      right: -4px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      background: var(--C-bright);
      box-shadow: 0 0 10px var(--Ts-bright);
      opacity: 0;
      transition: opacity 0.15s;
    }
    .vid-progress:hover .vid-scrubber { opacity: 1; }

    .vid-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }
    .vid-left, .vid-right { display: flex; align-items: center; gap: 0.5rem; }

    .vid-time {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--C-dim);
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    .vol-slider {
      width: 60px;
      height: 2px;
      background: rgba(91,248,112,0.2);
      -webkit-appearance: none;
      border-radius: 0;
      cursor: pointer;
      border: none;
      outline: none;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 8px; height: 8px;
        background: var(--C);
        box-shadow: 0 0 6px var(--Ts);
      }
      &::-moz-range-thumb {
        width: 8px; height: 8px;
        background: var(--C);
        border: none;
        box-shadow: 0 0 6px var(--Ts);
      }
    }
  `]
})
export class MediaPlayerComponent implements OnDestroy {
  @Input() mediaUrl!:  string;
  @Input() mediaType!: 'IMAGE' | 'VIDEO';
  @Input() alt = '';

  @ViewChild('videoEl') videoEl?: ElementRef<HTMLVideoElement>;

  isPlaying = false;
  isMuted   = false;
  volume    = 0.8;
  progress  = 0;
  hovered   = false;
  expanded  = false;

  currentTimeStr = '0:00';
  durationStr    = '0:00';

  toggleExpanded() { this.expanded = !this.expanded; }

  togglePlay() {
    const v = this.videoEl?.nativeElement;
    if (!v) return;
    if (this.isPlaying) { v.pause(); this.isPlaying = false; }
    else                { v.play();  this.isPlaying = true; }
  }

  onEnded() { this.isPlaying = false; }

  toggleMute() {
    const v = this.videoEl?.nativeElement;
    if (!v) return;
    v.muted = !v.muted;
    this.isMuted = v.muted;
  }

  setVolume(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.volume = val;
    if (this.videoEl?.nativeElement) this.videoEl.nativeElement.volume = val;
  }

  seek(e: MouseEvent) {
    const v = this.videoEl?.nativeElement;
    if (!v?.duration) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  }

  onTimeUpdate() {
    const v = this.videoEl?.nativeElement;
    if (!v?.duration) return;
    this.progress = (v.currentTime / v.duration) * 100;
    this.currentTimeStr = this.fmt(v.currentTime);
  }

  onMetadata() {
    const v = this.videoEl?.nativeElement;
    if (v) this.durationStr = this.fmt(v.duration);
  }

  toggleFullscreen() {
    const el = this.videoEl?.nativeElement;
    if (!el) return;
    document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();
  }

  private fmt(s: number): string {
    if (!isFinite(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  }

  ngOnDestroy() { this.videoEl?.nativeElement?.pause(); }
}
