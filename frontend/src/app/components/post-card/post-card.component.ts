import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostDTO } from '../../models';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { MediaPlayerComponent } from '../media-player/media-player.component';
import { ReportModalComponent } from '../report-modal/report-modal.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [RouterLink, CommonModule, MediaPlayerComponent, ReportModalComponent],
  template: `
    <article class="post-card">

      <header class="card-head">
        <div class="post-meta">
          <a [routerLink]="['/profile', post.username]" class="author-link">■ {{ post.username }}</a>
          <span class="meta-dot"></span>
          <span class="post-date">{{ fmtDate(post.createdAt) }}</span>
          @if (post.updatedAt !== post.createdAt) {
            <span class="edited-tag">edited</span>
          }
        </div>

        <!-- Owner-only actions stay top-right -->
        @if (isOwner()) {
          <div class="card-actions">
            <span [routerLink]="['/posts', post.id, 'edit']" class="btn btn-xs">EDIT</span>
            <button class="btn btn-xs btn-danger" (click)="onDelete()">DELETE</button>
          </div>
        }
      </header>

      <h2 class="post-title">
        <a [routerLink]="['/posts', post.id]">{{ post.title }}</a>
      </h2>

      <p class="post-preview">{{ preview }}</p>

      @if (post.mediaUrl && post.mediaType) {
        <app-media-player [mediaUrl]="post.mediaUrl" [mediaType]="post.mediaType" [alt]="post.title" />
      }

      <footer class="card-foot">
        <div class="foot-left">
          <button class="like-btn" [class.liked]="post.likedByCurrentUser"
            (click)="toggleLike()" [disabled]="!isLoggedIn()">
            <span class="heart">{{ post.likedByCurrentUser ? '♥' : '♡' }}</span>
            <span class="like-count">{{ post.likeCount }}</span>
          </button>
          <a [routerLink]="['/posts', post.id]" class="comment-link">
            # <span>{{ post.commentCount }}</span>
          </a>    
        </div>
        <button [routerLink]="['/posts', post.id]" class="btn btn-sm read-btn">READ</button>
      </footer>

    </article>

    @if (showReport) {
      <app-report-modal
        [targetUserId]="post.userId" [targetUsername]="post.username" [postId]="post.id"
        (close)="showReport = false" (submitted)="showReport = false" />
    }
  `,
  styles: [`
    .card-head {
      display: flex; justify-content: space-between; align-items: flex-start;
      gap: 0.6rem; margin-bottom: 0.65rem; flex-wrap: wrap;
    }
    .post-meta { display: flex; align-items: center; gap: 0.45em; flex-wrap: wrap; }

    .author-link {
      font-family: var(--font-mono); font-size: 0.78rem; color: var(--C-dim); letter-spacing: 0.04em;
      transition: color var(--t-fast), text-shadow var(--t-fast);
      &::after { display: none; } &:hover { color: var(--C-bright); text-shadow: 0 0 8px var(--Ts-faint); }
    }

    .meta-dot { width: 3px; height: 3px; background: var(--border-mid); display: inline-block; vertical-align: middle; flex-shrink: 0; }

    .post-date  { font-family: var(--font-mono); font-size: 0.68rem; color: var(--C-dim); opacity: 0.5; letter-spacing: 0.04em; }
    .edited-tag { font-family: var(--font-mono); font-size: 0.62rem; color: var(--C-dim); opacity: 0.4; font-style: italic; }

    .card-actions { display: flex; gap: 0.3rem; align-items: center; flex-shrink: 0; }

    .post-title {
      font-size: 1.3rem; line-height: 1.2; margin-bottom: 0.55rem; letter-spacing: 0.02em;
      a {
        color: var(--C-bright); text-shadow: 0 0 8px var(--Ts-faint);
        transition: color var(--t-fast), text-shadow var(--t-fast);
        &::after { display: none; }
        &:hover  { color: #fff; text-shadow: 0 0 18px var(--Ts-bright), 0 0 40px var(--Ts-faint); }
      }
    }

    .post-preview {
      font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.7;
      color: var(--C-dim); opacity: 0.72; margin-bottom: 0.8rem; word-break: break-word;
      -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
      mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
    }

    .card-foot {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 0.65rem; border-top: 1px solid var(--border-dim); flex-wrap: wrap; gap: 0.5rem;
    }
    .foot-left { display: flex; align-items: center; gap: 0.9rem; }

    .like-btn {
      display: flex; align-items: center; gap: 0.3em;
      font-family: var(--font-main); font-size: 0.92rem;
      background: transparent; border: none; color: var(--C-dim);
      cursor: pointer; letter-spacing: 0.04em; padding: 0;
      transition: color var(--t-fast), text-shadow var(--t-fast);
      .heart { transition: transform 0.15s var(--ease); font-size: 1.05em; }
      .like-count { font-family: var(--font-mono); font-size: 0.8em; opacity: 0.8; }
      &:hover:not(:disabled) { color: var(--C); .heart { transform: scale(1.25); } }
      &.liked { color: var(--like); text-shadow: 0 0 10px var(--like-glow); .heart { transform: scale(1.1); } }
      &:disabled { opacity: 0.25; cursor: default; }
    }

    .comment-link {
      font-family: var(--font-mono); font-size: 0.78rem; color: var(--C-dim);
      opacity: 0.55; letter-spacing: 0.04em;
      transition: opacity var(--t-fast), color var(--t-fast);
      &::after { display: none; } &:hover { opacity: 0.9; color: var(--C); }
    }

    /* Report sits in footer — low opacity until hover so it doesn't grab attention */
    .report-btn {
      opacity: 0.25;
      transition: opacity var(--t-fast);
      &:hover { opacity: 1; }
    }

    .read-btn { font-size: 0.82rem; }
  `]
})
export class PostCardComponent {
  @Input()  post!: PostDTO;
  @Output() deleted     = new EventEmitter<number>();
  @Output() likeToggled = new EventEmitter<PostDTO>();

  private postSvc = inject(PostService);
  private auth    = inject(AuthService);

  isLoggedIn = this.auth.isLoggedIn;
  isOwner    = computed(() => this.auth.currentUser()?.id === this.post?.userId);
  showReport = false;

  get preview(): string {
    const t = this.post.content.replace(/\n+/g, ' ');
    return t.length > 200 ? t.slice(0, 200) + '…' : t;
  }

  toggleLike() {
    const was = this.post.likedByCurrentUser;
    (was ? this.postSvc.unlikePost(this.post.id) : this.postSvc.likePost(this.post.id)).subscribe(() => {
      this.post = { ...this.post, likedByCurrentUser: !was, likeCount: this.post.likeCount + (was ? -1 : 1) };
      this.likeToggled.emit(this.post);
    });
  }

  onDelete() {
    if (!confirm('PERMANENTLY DELETE THIS POST?')) return;
    this.postSvc.deletePost(this.post.id).subscribe({ next: () => this.deleted.emit(this.post.id) });
  }

  fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  }
}
