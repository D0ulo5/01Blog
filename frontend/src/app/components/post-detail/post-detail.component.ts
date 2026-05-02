import { Component, inject, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { PostDTO, CommentDTO } from '../../models';
import { MediaPlayerComponent } from '../media-player/media-player.component';
import { ReportModalComponent } from '../report-modal/report-modal.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MediaPlayerComponent, ReportModalComponent],
  template: `
    <div class="narrow animate-in">

      @if (loading) {
        <div class="loading-wrap">DECODING TRANSMISSION<span class="cursor"></span></div>
      }
      @if (error) {
        <div class="alert alert-error">! {{ error }}</div>
      }

      @if (post && !loading) {

        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a routerLink="/explore">EXPLORE</a>
          <span class="crumb-sep">/</span>
          <a [routerLink]="['/profile', post.username]">■ {{ post.username }}</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-id">#{{ post.id }}</span>
        </nav>

        <!-- Post header -->
        <div class="post-header">

          <div class="post-byline">
            <a [routerLink]="['/profile', post.username]" class="byline-author">■ {{ post.username }}</a>
            <span class="byline-dot"></span>
            <span class="byline-date">{{ fmtDate(post.createdAt) }}</span>
            @if (post.updatedAt !== post.createdAt) {
              <span class="byline-edited">edited</span>
            }
            <div class="post-actions">
              @if (isOwner()) {
                <span [routerLink]="['/posts', post.id, 'edit']" class="btn btn-sm">EDIT</span>
                <button class="btn btn-sm btn-danger" (click)="deletePost()">DELETE</button>
              } @else {
                <button class="btn btn-xs btn-warn" (click)="showReport = true">REPORT</button>
              }
            </div>
          </div>

          <h1 class="post-title">{{ post.title }}</h1>
        </div>

        <!-- Media -->
        @if (post.mediaUrl && post.mediaType) {
          <app-media-player [mediaUrl]="post.mediaUrl" [mediaType]="post.mediaType" [alt]="post.title" />
        }

        <!-- Body -->
        <div class="post-body">
          <p class="post-content">{{ post.content }}</p>
        </div>

        <!-- Engage bar -->
        <div class="engage-bar">
          <button class="engage-like" [class.liked]="post.likedByCurrentUser" (click)="toggleLike()">
            <span class="like-heart">{{ post.likedByCurrentUser ? '♥' : '♡' }}</span>
            <span class="like-label">{{ post.likeCount }} {{ post.likedByCurrentUser ? 'LIKED' : 'LIKE' }}</span>
          </button>
          <span class="engage-comments"># {{ post.commentCount }} {{ post.commentCount === 1 ? 'COMMENT' : 'COMMENTS' }}</span>
          <span class="engage-spacer"></span>
          <span class="engage-tx">TX-{{ post.id | number:'6.0-0' }}</span>
        </div>

        <!-- Comments -->
        <section class="comments-section">
          <h2 class="section-title">COMMENTS ({{ comments.length }})</h2>

          <!-- Comment form -->
          @if (isLoggedIn()) {
            <div class="comment-form">
              <div class="form-group">
                <label class="field-label">YOUR RESPONSE</label>
                <textarea [(ngModel)]="newComment"
                  placeholder="add to the signal..."
                  rows="3" maxlength="2000"></textarea>
              </div>
              <div class="form-foot">
                <span class="char-count">{{ newComment.length }}/2000</span>
                <button class="btn btn-primary btn-sm" (click)="addComment()"
                  [disabled]="!newComment.trim() || submitting">
                  @if (submitting) { POSTING<span class="cursor"></span> }
                  @else { POST COMMENT }
                </button>
              </div>
            </div>
          }

          @if (loadingComments) {
            <div class="loading-wrap" style="padding:1.5rem 0">LOADING<span class="cursor"></span></div>
          }

          @if (!loadingComments && comments.length === 0) {
            <p class="no-comments">NO COMMENTS YET — BE THE FIRST TO RESPOND.</p>
          }

          <div class="comment-list stagger">
            @for (c of comments; track c.id) {
              <div class="comment-card">
                <div class="comment-gutter">
                  <span class="comment-sigil">■</span>
                </div>
                <div class="comment-body-wrap">
                  <div class="comment-meta">
                    <a [routerLink]="['/profile', c.username]" class="comment-author">{{ c.username }}</a>
                    <span class="comment-dot"></span>
                    <span class="comment-time">{{ relTime(c.createdAt) }}</span>
                    <div class="comment-actions">
                      @if (canEdit(c))   { <button class="btn btn-xs" (click)="startEdit(c)">EDIT</button> }
                      @if (canDelete(c)) { <button class="btn btn-xs btn-danger" (click)="deleteComment(c.id)">DELETE</button> }
                    </div>
                  </div>

                  @if (editingId === c.id) {
                    <div class="form-group" style="margin:0.5rem 0 0">
                      <textarea [(ngModel)]="editContent" rows="3" maxlength="2000"></textarea>
                    </div>
                    <div class="flex gap-1 mt-1">
                      <button class="btn btn-sm btn-primary" (click)="saveEdit(c.id)">SAVE</button>
                      <button class="btn btn-sm" (click)="cancelEdit()">CANCEL</button>
                    </div>
                  } @else {
                    <p class="comment-text">{{ c.content }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </section>

      }
    </div>

    @if (showReport && post) {
      <app-report-modal [targetUserId]="post.userId" [targetUsername]="post.username" [postId]="post.id"
        (close)="showReport = false" (submitted)="showReport = false" />
    }
  `,
  styles: [`
    /* Breadcrumb */
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.4em;
      margin-bottom: 1.4rem;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.06em;

      a {
        color: var(--C-dim);
        opacity: 0.6;
        &::after { display: none; }
        &:hover { opacity: 1; color: var(--C); }
      }
    }
    .crumb-sep { color: var(--border-mid); opacity: 0.5; }
    .crumb-id  { color: var(--C-dim); opacity: 0.4; }

    /* Post header */
    .post-header {
      border-left: 3px solid var(--border-mid);
      padding: 0 0 1rem 1.2rem;
      margin-bottom: 1.2rem;
      transition: border-color var(--t-mid);
      &:hover { border-left-color: var(--C-dim); }
    }

    .post-byline {
      display: flex;
      align-items: center;
      gap: 0.5em;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }

    .byline-author {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--C-dim);
      letter-spacing: 0.04em;
      &::after { display: none; }
      &:hover  { color: var(--C-bright); }
    }

    .byline-dot {
      width: 3px; height: 3px;
      background: var(--border-mid);
      display: inline-block;
      flex-shrink: 0;
    }

    .byline-date {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--C-dim);
      opacity: 0.45;
      letter-spacing: 0.04em;
    }

    .byline-edited {
      font-family: var(--font-mono);
      font-size: 0.62rem;
      color: var(--C-dim);
      opacity: 0.35;
      font-style: italic;
    }

    .post-actions {
      margin-left: auto;
      display: flex;
      gap: 0.4rem;
      align-items: center;
    }

    .post-title {
      font-size: 2rem;
      line-height: 1.15;
      letter-spacing: 0.03em;
      color: var(--C-bright);
      text-shadow: 0 0 20px var(--Ts-faint), 0 0 60px rgba(91,248,112,0.06);
    }

    /* Body */
    .post-body {
      background: var(--Bg-card);
      border-top: 1px solid var(--border-dim);
      padding: 1.4rem;
      margin-bottom: 0;
    }

    .post-content {
      font-family: var(--font-mono);
      font-size: 0.88rem;
      line-height: 1.85;
      color: var(--C);
      opacity: 0.85;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Engage bar */
    .engage-bar {
      display: flex;
      align-items: center;
      gap: 1.4rem;
      padding: 0.7rem 1.4rem;
      background: var(--Bg-card2);
      border-top: 1px solid var(--border-dim);
      border-bottom: 1px solid var(--border-dim);
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .engage-like {
      display: flex;
      align-items: center;
      gap: 0.4em;
      background: transparent;
      border: none;
      cursor: pointer;
      font-family: var(--font-main);
      font-size: 1rem;
      color: var(--C-dim);
      letter-spacing: 0.06em;
      padding: 0;
      transition: color var(--t-fast), text-shadow var(--t-fast);

      .like-heart  { font-size: 1.1em; transition: transform 0.15s var(--ease); }
      .like-label  { font-size: 0.9em; font-family: var(--font-mono); }

      &:hover { color: var(--C); .like-heart { transform: scale(1.3); } }
      &.liked {
        color: var(--like);
        text-shadow: 0 0 12px var(--like-glow);
        .like-heart { transform: scale(1.12); }
      }
    }

    .engage-comments {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--C-dim);
      opacity: 0.55;
      letter-spacing: 0.04em;
    }

    .engage-spacer { flex: 1; }

    .engage-tx {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--C-dim);
      opacity: 0.25;
      letter-spacing: 0.1em;
    }

    /* Comments section */
    .comments-section { }

    .comment-form {
      background: var(--Bg-card);
      border-top: 1px solid var(--border-dim);
      padding: 1rem 1.2rem;
      margin-bottom: 1rem;
      .field-label {
        display: block;
        font-size: 0.75rem;
        color: var(--C-dim);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        margin-bottom: 0.4rem;
        &::before { content: '$ '; color: var(--C-dim); }
      }
    }

    .form-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.45rem;
    }

    .char-count {
      font-family: var(--font-mono);
      font-size: 0.66rem;
      color: var(--C-dim);
      opacity: 0.4;
    }

    .no-comments {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--C-dim);
      opacity: 0.4;
      padding: 1rem 0;
      letter-spacing: 0.04em;
    }

    /* Comment card — gutter + body layout */
    .comment-list { display: flex; flex-direction: column; gap: 0; }

    .comment-card {
      display: flex;
      gap: 0.9rem;
      padding: 0.9rem 0;
      border-bottom: 1px solid var(--border-dim);
      animation: fade-in-up 0.2s var(--ease) both;
      transition: background var(--t-fast);

      &:hover { background: rgba(91,248,112,0.015); }
      &:last-child { border-bottom: none; }
    }

    .comment-gutter {
      flex-shrink: 0;
      width: 1.4rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 0.05rem;
    }

    .comment-sigil {
      font-size: 0.6rem;
      color: var(--C-dim);
      opacity: 0.4;
    }

    .comment-body-wrap { flex: 1; min-width: 0; }

    .comment-meta {
      display: flex;
      align-items: center;
      gap: 0.45em;
      margin-bottom: 0.45rem;
      flex-wrap: wrap;
    }

    .comment-author {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--C-dim);
      letter-spacing: 0.04em;
      font-weight: 600;
      &::after { display: none; }
      &:hover  { color: var(--C-bright); }
    }

    .comment-dot {
      width: 2px; height: 2px;
      background: var(--border-mid);
      display: inline-block;
      flex-shrink: 0;
    }

    .comment-time {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--C-dim);
      opacity: 0.4;
    }

    .comment-actions {
      margin-left: auto;
      display: flex;
      gap: 0.3rem;
    }

    .comment-text {
      font-family: var(--font-mono);
      font-size: 0.84rem;
      line-height: 1.7;
      color: var(--C);
      opacity: 0.78;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .isLoggedIn { /* utility */ }
  `]
})
export class PostDetailComponent implements OnInit {
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private postSvc    = inject(PostService);
  private commentSvc = inject(CommentService);
  private auth       = inject(AuthService);

  post:     PostDTO | null = null;
  comments: CommentDTO[]  = [];

  loading         = true;
  loadingComments = false;
  error           = '';
  newComment      = '';
  submitting      = false;
  editingId:      number | null = null;
  editContent     = '';
  showReport      = false;

  isOwner    = computed(() => this.auth.currentUser()?.id === this.post?.userId);
  isLoggedIn = this.auth.isLoggedIn;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.postSvc.getPostById(id).subscribe({
      next:  p  => { this.post = p; this.loading = false; this.loadComments(id); },
      error: () => { this.error = 'TRANSMISSION NOT FOUND.'; this.loading = false; }
    });
  }

  loadComments(postId: number) {
    this.loadingComments = true;
    this.commentSvc.getComments(postId).subscribe({
      next:  c  => { this.comments = c; this.loadingComments = false; },
      error: () => { this.loadingComments = false; }
    });
  }

  toggleLike() {
    if (!this.post) return;
    const was = this.post.likedByCurrentUser;
    (was ? this.postSvc.unlikePost(this.post.id) : this.postSvc.likePost(this.post.id)).subscribe(() => {
      this.post = { ...this.post!, likedByCurrentUser: !was, likeCount: this.post!.likeCount + (was ? -1 : 1) };
    });
  }

  addComment() {
    if (!this.post || !this.newComment.trim()) return;
    this.submitting = true;
    this.commentSvc.addComment(this.post.id, this.newComment.trim()).subscribe({
      next: c => {
        this.comments   = [c, ...this.comments];
        this.post       = { ...this.post!, commentCount: this.post!.commentCount + 1 };
        this.newComment = '';
        this.submitting = false;
      },
      error: () => { this.submitting = false; }
    });
  }

  canEdit(c: CommentDTO)   { return this.auth.currentUser()?.id === c.userId; }
  canDelete(c: CommentDTO) {
    const u = this.auth.currentUser();
    return u?.id === c.userId || u?.role === 'ADMIN';
  }

  startEdit(c: CommentDTO) { this.editingId = c.id; this.editContent = c.content; }
  cancelEdit()             { this.editingId = null; this.editContent = ''; }

  saveEdit(id: number) {
    if (!this.editContent.trim()) return;
    this.commentSvc.updateComment(id, this.editContent.trim()).subscribe({
      next: c => { this.comments = this.comments.map(x => x.id === id ? c : x); this.cancelEdit(); }
    });
  }

  deleteComment(id: number) {
    this.commentSvc.deleteComment(id).subscribe(() => {
      this.comments = this.comments.filter(c => c.id !== id);
      if (this.post) this.post = { ...this.post, commentCount: this.post.commentCount - 1 };
    });
  }

  deletePost() {
    if (!this.post || !confirm('PERMANENTLY DELETE THIS TRANSMISSION?')) return;
    this.postSvc.deletePost(this.post.id).subscribe({ next: () => this.router.navigate(['/explore']) });
  }

  fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
  }

  relTime(iso: string): string {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase();
  }
}
