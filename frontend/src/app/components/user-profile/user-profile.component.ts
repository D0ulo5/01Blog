import { Component, inject, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { PostCardComponent } from '../post-card/post-card.component';
import { ReportModalComponent } from '../report-modal/report-modal.component';
import { ProfileDTO, PostDTO, SubscriptionStats } from '../../models';
import { pick } from '../../services/typewriter.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PostCardComponent, ReportModalComponent],
  template: `
    <div class="narrow animate-in">

      @if (loading) {
        <div class="loading-wrap">RETRIEVING NODE RECORD<span class="cursor"></span></div>
      }
      @if (error) {
        <div class="alert alert-error">! {{ error }}</div>
      }

      @if (profile && !loading) {

        <div class="profile-card terminal-panel" style="padding: 1.4rem 1.6rem">
          <div class="profile-layout">

            <div class="profile-sigil flicker" aria-hidden="true">■</div>

            <div class="profile-info">
              <h1 class="profile-name">{{ profile.username }}</h1>

              @if (!editingBio) {
                @if (profile.bio) {
                  <p class="profile-bio">{{ profile.bio }}</p>
                } @else {
                  <p class="profile-bio-empty">// no bio on file</p>
                }
              } @else {
                <div class="bio-editor">
                  <label class="field-label">BIO</label>
                  <textarea [(ngModel)]="bioInput" rows="3"
                    placeholder="write your bio..." maxlength="300"></textarea>
                  <div class="bio-footer">
                    <span class="text-mono text-dim text-xs">{{ bioInput.length }}/300</span>
                    <div class="flex gap-1">
                      <button class="btn btn-sm btn-primary" (click)="saveBio()">SAVE</button>
                      <button class="btn btn-sm" (click)="cancelBio()">CANCEL</button>
                    </div>
                  </div>
                </div>
              }

              <div class="profile-stats">
                <div class="stat">
                  <strong>{{ stats?.followers ?? 0 }}</strong>
                  <span>FOLLOWERS</span>
                </div>
                <div class="stat-sep">|</div>
                <div class="stat">
                  <strong>{{ stats?.following ?? 0 }}</strong>
                  <span>FOLLOWING</span>
                </div>
                <div class="stat-sep">|</div>
                <div class="stat">
                  <strong>{{ posts.length }}</strong>
                  <span>POSTS</span>
                </div>
              </div>

              <div class="text-mono text-dim text-xs member-since">
                NODE SINCE {{ fmtDate(profile.createdAt) }}
              </div>
            </div>

            <div class="profile-actions">
              @if (isOwn()) {
                @if (!editingBio) {
                  <button class="btn btn-sm" (click)="startEditBio()">EDIT PROFILE</button>
                }
                <span routerLink="/posts/new" class="btn btn-primary btn-sm">TRANSMIT</span>
              } @else {
                @if (isSubscribed !== null) {
                  <button class="btn btn-sm"
                    [class.btn-primary]="!isSubscribed"
                    [class.btn-danger]="isSubscribed"
                    (click)="toggleSub()">
                    {{ isSubscribed ? 'UNFOLLOW' : 'FOLLOW' }}
                  </button>
                }
                <button class="btn btn-xs btn-warn" (click)="showReport = true">REPORT</button>
              }
            </div>

          </div>
        </div>

        @if (statusLine) {
          <p class="flavor-quote">{{ statusLine }}</p>
        }

        <div class="profile-posts">
          <h2 class="section-title">TRANSMISSIONS ({{ posts.length }})</h2>

          @if (postsLoading) {
            <div class="loading-wrap" style="padding:1.5rem">FETCHING<span class="cursor"></span></div>
          }

          @if (!postsLoading && posts.length === 0) {
            <div class="empty-state">
              <p class="empty-msg">{{ isOwn() ? 'YOU HAVE NOT POSTED YET.' : 'NO POSTS FROM THIS USER.' }}</p>
            </div>
          }

          <div class="stagger">
            @for (post of posts; track post.id) {
              <app-post-card [post]="post" (deleted)="removePost($event)" (likeToggled)="updatePost($event)" />
            }
          </div>
        </div>

      }
    </div>

    @if (showReport && profile) {
      <app-report-modal [targetUserId]="profile.id" [targetUsername]="profile.username"
        (close)="showReport = false" (submitted)="showReport = false" />
    }
  `,
  styles: [`
    .profile-card   {
      margin-bottom: 0.5rem;
      border-left: 3px solid var(--border-mid) !important;
      transition: border-color var(--t-mid) !important;
    }
    .profile-card:hover { border-left-color: var(--C-dim) !important; }
    .profile-layout { display: grid; grid-template-columns: auto 1fr auto; gap: 1.6rem; align-items: start; }

    .profile-sigil {
      font-size: 4rem; color: var(--C);
      text-shadow: 0 0 24px var(--Ts), 0 0 60px var(--Ts-faint), 0 0 100px rgba(91,248,112,0.06);
      line-height: 1;
      animation: text-flicker 8s ease-in-out infinite;
    }

    .profile-name {
      font-size: 1.7rem; letter-spacing: 0.06em;
      margin-bottom: 0.5rem; text-shadow: 0 0 14px var(--Ts);
    }

    .profile-bio {
      font-family: var(--font-mono); font-size: 0.84rem; line-height: 1.65;
      color: var(--C-dim); margin-bottom: 0.8rem; white-space: pre-wrap; word-break: break-word;
    }

    .profile-bio-empty { font-family: var(--font-mono); font-size: 0.8rem; color: var(--C-dim); opacity: 0.4; margin-bottom: 0.8rem; }

    .bio-editor {
      margin-bottom: 0.8rem;
      .field-label { display: block; font-size: 0.72rem; color: var(--C-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.3rem;
        &::before { content: '$ '; color: var(--C-dim); } }
      textarea { font-size: 0.85rem; }
    }
    .bio-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.35rem; }

    .profile-stats {
      display: flex; align-items: center; gap: 0.6rem;
      margin-bottom: 0.4rem; font-family: var(--font-mono); flex-wrap: wrap;
    }
    .stat {
      display: flex; flex-direction: column; align-items: center;
      strong { font-size: 1.15rem; color: var(--C-bright); text-shadow: 0 0 6px var(--Ts); }
      span   { font-size: 0.62rem; color: var(--C-dim); letter-spacing: 0.08em; text-transform: uppercase; }
    }
    .stat-sep { color: var(--border-mid); opacity: 0.6; }

    .member-since { opacity: 0.4; margin-top: 0.3rem; }

    .profile-actions { display: flex; flex-direction: column; gap: 0.45rem; align-items: flex-end; min-width: 110px; }
    .profile-posts   { margin-top: 0.5rem; }

    @media (max-width: 560px) {
      .profile-layout { grid-template-columns: 1fr; }
      .profile-sigil  { display: none; }
      .profile-actions { align-items: flex-start; flex-direction: row; flex-wrap: wrap; }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private userSvc = inject(UserService);
  private postSvc = inject(PostService);
  private subSvc  = inject(SubscriptionService);
  private auth    = inject(AuthService);

  profile:      ProfileDTO | null      = null;
  posts:        PostDTO[]              = [];
  stats:        SubscriptionStats | null = null;
  isSubscribed: boolean | null         = null;

  loading      = true;
  postsLoading = false;
  error        = '';
  editingBio   = false;
  bioInput     = '';
  showReport   = false;
  statusLine   = '';

  isOwn = computed(() => this.auth.currentUser()?.username === this.profile?.username);

  private statusLines = [
    '"Words transmitted. Silence received."',
    '"Every post is a signal into the unknown."',
    '"The archive remembers what the mind forgets."',
    '"Write freely. Others are reading."',
    '"This node is active. Transmission quality: good."',
  ];

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username')!;
    this.statusLine = pick(this.statusLines);
    this.userSvc.getProfile(username).subscribe({
      next: p => {
        this.profile = p;
        this.loading = false;
        this.loadPosts(p.id);
        this.subSvc.getStats(p.id).subscribe(s => this.stats = s);
        if (!this.isOwn()) this.subSvc.checkStatus(p.id).subscribe(r => this.isSubscribed = r.subscribed);
      },
      error: () => { this.error = 'USER NOT FOUND.'; this.loading = false; }
    });
  }

  loadPosts(uid: number) {
    this.postsLoading = true;
    this.postSvc.getPostsByUser(uid).subscribe({
      next:  p => { this.posts = p; this.postsLoading = false; },
      error: () => this.postsLoading = false
    });
  }

  toggleSub() {
    if (!this.profile || this.isSubscribed === null) return;
    const was = this.isSubscribed;
    (was ? this.subSvc.unsubscribe(this.profile.id) : this.subSvc.subscribe(this.profile.id)).subscribe(() => {
      this.isSubscribed = !was;
      if (this.stats) this.stats = { ...this.stats, followers: this.stats.followers + (was ? -1 : 1) };
    });
  }

  startEditBio()  { this.editingBio = true; this.bioInput = this.profile?.bio ?? ''; }
  cancelBio()     { this.editingBio = false; }

  saveBio() {
    const u = this.auth.currentUser();
    if (!u) return;
    this.userSvc.updateUser(u.id, { bio: this.bioInput }).subscribe({
      next: () => {
        if (this.profile) this.profile = { ...this.profile, bio: this.bioInput };
        this.editingBio = false;
        this.auth.refreshCurrentUser().subscribe();
      }
    });
  }

  removePost(id: number) { this.posts = this.posts.filter(p => p.id !== id); }
  updatePost(p: PostDTO)  { this.posts = this.posts.map(x => x.id === p.id ? p : x); }

  fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  }
}
