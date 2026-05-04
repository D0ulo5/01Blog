import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { ReportService } from '../../services/report.service';
import { UserAdminDTO, PostDTO, ReportDTO } from '../../models';
import { CrtDialogService } from '../../services/crt-dialog.service';

type Tab = 'users' | 'posts' | 'reports';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatTooltipModule],
  template: `
    <div class="animate-in">

      <div class="admin-head mb-3">
        <div class="text-warn text-mono text-xs mb-1">! RESTRICTED — ADMIN CONSOLE</div>
        <h1 class="section-title" style="color:var(--warn)">ADMIN DASHBOARD</h1>

        <div class="stat-cards">
          <div class="stat-card">
            <span class="stat-num">{{ users.length }}</span>
            <span class="text-dim text-xs text-mono">USERS</span>
          </div>
          <div class="stat-card" [class.accent-warn]="bannedCount > 0">
            <span class="stat-num" [class.text-warn]="bannedCount > 0">{{ bannedCount }}</span>
            <span class="text-dim text-xs text-mono">BANNED</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ posts.length }}</span>
            <span class="text-dim text-xs text-mono">POSTS</span>
          </div>
          <div class="stat-card" [class.accent-error]="pendingReports > 0">
            <span class="stat-num" [class.text-error]="pendingReports > 0">{{ pendingReports }}</span>
            <span class="text-dim text-xs text-mono">PENDING</span>
          </div>
        </div>
      </div>

      @if (flash) { <div class="alert alert-success mb-2">&#10003; {{ flash }}</div> }
      @if (err)   { <div class="alert alert-error mb-2">! {{ err }}</div> }

      <div class="tabs">
        <button class="tab-btn" [class.active]="tab === 'users'" (click)="tab = 'users'">
          USERS ({{ users.length }})
        </button>
        <button class="tab-btn" [class.active]="tab === 'posts'" (click)="setTab('posts')">
          POSTS ({{ posts.length }})
        </button>
        <button class="tab-btn" [class.active]="tab === 'reports'" (click)="setTab('reports')">
          REPORTS
          @if (pendingReports > 0) { <span class="tab-badge">{{ pendingReports }}</span> }
        </button>
      </div>

      <!-- ===== USERS ===== -->
      @if (tab === 'users') {
        @if (loadingUsers) { <div class="loading-wrap">LOADING USERS<span class="cursor"></span></div> }

        @if (!loadingUsers) {
          <div class="search-row mb-2">
            <span class="search-prompt text-mono text-dim">$</span>
            <input type="search" [(ngModel)]="userSearch" placeholder="filter by username or email..." (input)="filterUsers()" />
          </div>

          <div class="admin-table">
            <div class="table-head users-cols">
              <span>#</span><span>USERNAME</span><span>EMAIL</span><span>ROLE</span><span>STATUS</span><span>JOINED</span><span>ACTIONS</span>
            </div>
            @for (u of filteredUsers; track u.id) {
              <div class="table-row users-cols" [class.row-banned]="u.banned">
                <span class="text-mono text-dim text-xs">#{{ u.id }}</span>
                <span class="text-mono">{{ u.username }}</span>
                <span class="text-mono text-dim text-xs">{{ u.email }}</span>
                <span class="tag" [class.tag-warn]="u.role === 'ADMIN'">{{ u.role }}</span>
                <span class="text-mono text-xs" [class.text-error]="u.banned" [class.text-bright]="!u.banned">
                  {{ u.banned ? 'BANNED' : 'ACTIVE' }}
                </span>
                <span class="text-mono text-dim text-xs">{{ fmtDate(u.createdAt) }}</span>
                <div class="row-actions">
                  @if (u.banned) {
                    <button class="btn btn-xs btn-primary" (click)="unbanUser(u)" matTooltip="Lift ban" matTooltipPosition="above">UNBAN</button>
                  } @else {
                    <button class="btn btn-xs btn-danger" (click)="banUser(u)" matTooltip="Ban user" matTooltipPosition="above">BAN</button>
                  }
                  <button class="btn btn-xs btn-danger" (click)="deleteUser(u)" matTooltip="Delete user and all data" matTooltipPosition="above">DELETE</button>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- ===== POSTS ===== -->
      @if (tab === 'posts') {
        @if (loadingPosts) { <div class="loading-wrap">LOADING POSTS<span class="cursor"></span></div> }

        @if (!loadingPosts) {
          <div class="search-row mb-2">
            <span class="search-prompt text-mono text-dim">$</span>
            <input type="search" [(ngModel)]="postSearch" placeholder="filter by title or author..." (input)="filterPosts()" />
          </div>

          <div class="admin-table">
            <div class="table-head posts-cols">
              <span>#</span><span>AUTHOR</span><span>TITLE</span><span>♥</span><span>#</span><span>DATE</span><span>VIS</span><span>ACTIONS</span>
            </div>
            @for (p of filteredPosts; track p.id) {
              <div class="table-row posts-cols" [class.row-hidden]="p.hidden">
                <span class="text-mono text-dim text-xs">#{{ p.id }}</span>
                <span class="text-mono text-xs">{{ p.username }}</span>
                <span class="text-mono text-sm cell-clip">{{ trunc(p.title, 48) }}</span>
                <span class="text-mono text-dim text-xs">{{ p.likeCount }}</span>
                <span class="text-mono text-dim text-xs">{{ p.commentCount }}</span>
                <span class="text-mono text-dim text-xs">{{ fmtDate(p.createdAt) }}</span>
                <span class="text-mono text-xs" [class.text-warn]="p.hidden" [class.text-bright]="!p.hidden">{{ p.hidden ? 'HIDDEN' : 'LIVE' }}</span>
                <div class="row-actions">
                  <span [routerLink]="['/posts', p.id]" class="btn btn-xs" matTooltip="View post" matTooltipPosition="above">VIEW</span>
                  @if (p.hidden) {
                    <button type="button" class="btn btn-xs btn-primary" (click)="unhidePost(p)" matTooltip="Restore post visibility" matTooltipPosition="above">UNHIDE</button>
                  } @else {
                    <button type="button" class="btn btn-xs btn-warn" (click)="hidePost(p)" matTooltip="Hide from public feed" matTooltipPosition="above">HIDE</button>
                  }
                  <button type="button" class="btn btn-xs btn-danger" (click)="adminDeletePost(p)" matTooltip="Permanently delete post" matTooltipPosition="above">DELETE</button>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- ===== REPORTS ===== -->
      @if (tab === 'reports') {
        @if (loadingReports) { <div class="loading-wrap">LOADING REPORTS<span class="cursor"></span></div> }

        @if (!loadingReports) {
          <div class="filter-row mb-2">
            @for (s of reportStatuses; track s) {
              <button class="btn btn-sm" [class.btn-primary]="reportFilter === s" (click)="setReportFilter(s)">{{ s }}</button>
            }
          </div>

          @if (filteredReports.length === 0) {
            <div class="empty-state"><p class="empty-msg">NO REPORTS MATCHING "{{ reportFilter }}"</p></div>
          }

          <div class="admin-table">
            <div class="table-head reports-cols">
              <span>#</span><span>REPORTER</span><span>REPORTED</span><span>POST</span><span>REASON</span><span>STATUS</span><span>DATE</span><span>ACTIONS</span>
            </div>
            @for (r of filteredReports; track r.id) {
              <div class="table-row reports-cols" [class]="'status-' + r.status.toLowerCase()">
                <span class="text-mono text-dim text-xs">#{{ r.id }}</span>
                <span class="text-mono text-xs">{{ r.reporterUsername }}</span>
                <span class="text-mono text-xs">{{ r.reportedUsername }}</span>
                <span class="text-mono text-dim text-xs">
                  @if (r.reportedPostId) { <a [routerLink]="['/posts', r.reportedPostId]" style="border-bottom:none">#{{ r.reportedPostId }}</a> }
                  @else { — }
                </span>
                <span class="text-mono text-xs cell-clip" [title]="r.reason">{{ trunc(r.reason, 55) }}</span>
                <span class="tag" [class]="statusTagClass(r.status)">{{ r.status }}</span>
                <span class="text-mono text-dim text-xs">{{ fmtDate(r.createdAt) }}</span>
                <div class="row-actions">
                  @if (r.status === 'PENDING') {
                    <button class="btn btn-xs btn-primary" (click)="resolveReport(r, 'RESOLVED')">RESOLVE</button>
                  }
                  <button class="btn btn-xs btn-danger" (click)="deleteReport(r)">DELETE</button>
                </div>
              </div>
            }
          </div>
        }
      }

    </div>
  `,
  styles: [`
    .stat-cards {
      display: flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 0.8rem; margin-bottom: 0.5rem;
    }
    .stat-card {
      border-top: 1px solid var(--border-dim);
      padding: 0.7rem 1.2rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.15rem;
      min-width: 90px;
      transition: border-color var(--t-mid);
      &.accent-warn  { border-color: var(--warn); }
      &.accent-error { border-color: var(--error); }
    }
    .stat-num {
      font-size: 1.8rem; color: var(--C-bright);
      text-shadow: 0 0 8px var(--Ts); line-height: 1;
    }

    .search-row {
      display: flex; align-items: center; gap: 0.5rem;
      .search-prompt { flex-shrink: 0; font-size: 0.9rem; }
    }
    .filter-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .admin-table { overflow-x: auto; }

    .table-head, .table-row {
      display: grid; gap: 0.5rem;
      padding: 0.5rem 0.7rem;
      align-items: center;
      border-bottom: 1px solid var(--border-dim);
    }

    .table-head {
      font-family: var(--font-mono); font-size: 0.65rem; color: var(--C-dim);
      text-transform: uppercase; letter-spacing: 0.08em;
      background: rgba(91,248,112,0.02);
    }

    .table-row {
      transition: background var(--t-fast);
      &:hover    { background: rgba(91,248,112,0.02); }
      &.row-banned { opacity: 0.55; border-left: 2px solid var(--error); }
    }

    .users-cols   { grid-template-columns: 40px 130px 170px 65px 65px 80px 1fr; }
    .posts-cols   { grid-template-columns: 40px 100px 1fr 45px 45px 75px 60px 140px; }
    .reports-cols { grid-template-columns: 40px 95px 95px 50px 1fr 80px 75px 130px; }

    .row-actions { display: flex; gap: 0.35rem; flex-wrap: wrap; }
    .cell-clip   { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .row-hidden { opacity: 0.45; border-left: 2px solid var(--warn); }

    .btn-warn {
      border-color: var(--warn);
      color: var(--warn);
      &:hover { background: rgba(255,200,0,0.08); }
    }

    .status-resolved  { opacity: 0.7; }

    @media (max-width: 900px) {
      .table-head { display: none; }
      .users-cols, .posts-cols, .reports-cols { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdminComponent implements OnInit {
  private userSvc   = inject(UserService);
  private postSvc   = inject(PostService);
  private reportSvc = inject(ReportService);
  private dialog    = inject(CrtDialogService);

  tab: Tab = 'users';

  users:          UserAdminDTO[] = [];
  filteredUsers:  UserAdminDTO[] = [];
  posts:          PostDTO[]      = [];
  filteredPosts:  PostDTO[]      = [];
  reports:        ReportDTO[]    = [];
  filteredReports: ReportDTO[]   = [];

  loadingUsers   = true;
  loadingPosts   = false;
  loadingReports = false;
  postsLoaded    = false;
  reportsLoaded  = false;

  userSearch    = '';
  postSearch    = '';
  reportFilter  = 'ALL';
  reportStatuses = ['ALL', 'PENDING', 'RESOLVED'];

  flash = '';
  err   = '';

  get bannedCount()    { return this.users.filter(u => u.banned).length; }
  get pendingReports() { return this.reports.filter(r => r.status === 'PENDING').length; }

  ngOnInit() {
    this.userSvc.getAllUsers().subscribe({
      next:  u => { this.users = u; this.filteredUsers = u; this.loadingUsers = false; },
      error: e => { this.err = e.error?.message ?? 'FAILED TO LOAD USERS.'; this.loadingUsers = false; }
    });
    this.reportSvc.getAllReports().subscribe({ next: r => this.reports = r });
  }

  setTab(t: Tab) {
    this.tab = t;
    if (t === 'posts'   && !this.postsLoaded)   this.loadPosts();
    if (t === 'reports' && !this.reportsLoaded) this.loadReports();
  }

  loadPosts() {
    this.loadingPosts = true;
    this.postSvc.getAllPosts().subscribe({
      next: p => { this.posts = p; this.filteredPosts = p; this.loadingPosts = false; this.postsLoaded = true; },
      error: () => this.loadingPosts = false
    });
  }

  loadReports() {
    this.loadingReports = true;
    this.reportSvc.getAllReports().subscribe({
      next: r => { this.reports = r; this.filteredReports = r; this.loadingReports = false; this.reportsLoaded = true; },
      error: () => this.loadingReports = false
    });
  }

  filterUsers() {
    const q = this.userSearch.toLowerCase();
    this.filteredUsers = q
      ? this.users.filter(u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      : [...this.users];
  }

  filterPosts() {
    const q = this.postSearch.toLowerCase();
    this.filteredPosts = q
      ? this.posts.filter(p => p.title.toLowerCase().includes(q) || p.username.toLowerCase().includes(q))
      : [...this.posts];
  }

  setReportFilter(s: string) {
    this.reportFilter   = s;
    this.filteredReports = s === 'ALL' ? [...this.reports] : this.reports.filter(r => r.status === s);
  }

  banUser(u: UserAdminDTO) {
    this.dialog.confirm(`BAN USER "${u.username}"?`, 'BAN', 'CANCEL').subscribe(ok => {
      if (!ok) return;
      this.userSvc.banUser(u.id).subscribe({
        next: () => { this.users = this.users.map(x => x.id === u.id ? { ...x, banned: true } : x); this.filterUsers(); this.ok(`BANNED ${u.username}.`); },
        error: e => this.setErr(e)
      });
    });
  }

  unbanUser(u: UserAdminDTO) {
    this.dialog.confirm(`UNBAN USER "${u.username}"?`, 'UNBAN', 'CANCEL').subscribe(ok => {
      if (!ok) return;
      this.userSvc.unbanUser(u.id).subscribe({
        next: () => { this.users = this.users.map(x => x.id === u.id ? { ...x, banned: false } : x); this.filterUsers(); this.ok(`UNBANNED ${u.username}.`); },
        error: e => this.setErr(e)
      });
    });
  }

  deleteUser(u: UserAdminDTO) {
    this.dialog.confirm(`DELETE USER "${u.username}" AND ALL THEIR DATA?`, 'DELETE', 'CANCEL').subscribe(ok => {
      if (!ok) return;
      this.userSvc.deleteUser(u.id).subscribe({
        next: () => { this.users = this.users.filter(x => x.id !== u.id); this.filterUsers(); this.ok(`DELETED ${u.username}.`); },
        error: e => this.setErr(e)
      });
    });
  }

  adminDeletePost(p: PostDTO) {
    this.dialog.confirm(`DELETE POST #${p.id} BY ${p.username}?`, 'DELETE', 'CANCEL').subscribe(ok => {
      if (!ok) return;
      this.postSvc.adminDeletePost(p.id).subscribe({
        next: () => { this.posts = this.posts.filter(x => x.id !== p.id); this.filterPosts(); this.ok('POST DELETED.'); },
        error: e => this.setErr(e)
      });
    });
  }

  hidePost(p: PostDTO) {
    this.dialog.confirm(`HIDE POST #${p.id} FROM PUBLIC VIEW?`, 'HIDE', 'CANCEL').subscribe(ok => {
      if (!ok) return;
      this.postSvc.hidePost(p.id).subscribe({
        next: updated => { this.posts = this.posts.map(x => x.id === p.id ? updated : x); this.filterPosts(); this.ok(`POST #${p.id} HIDDEN.`); },
        error: e => this.setErr(e)
      });
    });
  }

  unhidePost(p: PostDTO) {
    this.dialog.confirm(`RESTORE POST #${p.id} TO PUBLIC VIEW?`, 'UNHIDE', 'CANCEL').subscribe(ok => {
      if (!ok) return;
      this.postSvc.unhidePost(p.id).subscribe({
        next: updated => { this.posts = this.posts.map(x => x.id === p.id ? updated : x); this.filterPosts(); this.ok(`POST #${p.id} VISIBLE.`); },
        error: e => this.setErr(e)
      });
    });
  }

  resolveReport(r: ReportDTO, status: string) {
    this.dialog.confirm(`RESOLVE REPORT #${r.id} AS "${status}"?`, 'RESOLVE', 'CANCEL').subscribe(ok => {
      if (!ok) return;
      this.reportSvc.updateStatus(r.id, status).subscribe({
        next: updated => {
          this.reports = this.reports.map(x => x.id === r.id ? updated : x);
          this.setReportFilter(this.reportFilter);
          this.ok(`REPORT #${r.id} > ${status}.`);
        },
      error: e => this.setErr(e)
      });
    });
  }

  deleteReport(r: ReportDTO) {
    this.dialog.confirm(`DELETE REPORT #${r.id}?`, 'DELETE', 'CANCEL').subscribe(ok => {
      if (!ok) return;
      this.reportSvc.deleteReport(r.id).subscribe({
        next: () => { this.reports = this.reports.filter(x => x.id !== r.id); this.setReportFilter(this.reportFilter); this.ok('REPORT DELETED.'); },
        error: e => this.setErr(e)
      });
    });
  }

  statusTagClass(s: string): string {
    return ({ PENDING: 'tag-warn', RESOLVED: 'tag-ok', REVIEWED: 'tag-info' } as Record<string, string>)[s] ?? '';
  }

  trunc(s: string, n: number) { return s.length > n ? s.slice(0, n) + '...' : s; }

  fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).toUpperCase();
  }

  private ok(msg: string)      { this.flash = msg; this.err = ''; setTimeout(() => this.flash = '', 3000); }
  private setErr(e: unknown)   { this.err = (e as { error?: { message?: string } }).error?.message ?? 'OPERATION FAILED.'; }
}
