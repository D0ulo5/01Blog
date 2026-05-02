import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { interval, Subscription, of } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="nav-root">
      <div class="nav-inner terminal-container">

        <a routerLink="/" class="nav-logo flicker">
          [TERMINAL<span class="logo-sep">::</span>BLOG]
        </a>

        <div class="nav-links">
          @if (isLoggedIn()) {
            <a routerLink="/feed"          routerLinkActive="active" class="nav-link">FEED</a>
            <a routerLink="/explore"       routerLinkActive="active" class="nav-link">EXPLORE</a>
            <a routerLink="/posts/new"     routerLinkActive="active" class="nav-link">TRANSMIT</a>
            <a routerLink="/notifications" routerLinkActive="active" class="nav-link nav-notif">
              ALERTS
              @if (unreadCount > 0) {
                <span class="notif-pip">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              }
            </a>
            @if (isAdmin()) {
              <a routerLink="/admin" routerLinkActive="active" class="nav-link nav-admin">ADMIN</a>
            }
          }
        </div>

        <div class="nav-end">
          @if (isLoggedIn()) {
            <a [routerLink]="['/profile', username()]" class="nav-user">
              <span class="user-sigil">■</span>{{ username() }}
            </a>
            <button class="nav-logout btn btn-sm" (click)="logout()">LOGOUT</button>
          } @else {
            <span routerLink="/login"    class="btn btn-sm">LOGIN</span>
            <span routerLink="/register" class="btn btn-primary btn-sm">REGISTER</span>
          }
        </div>

      </div>
    </nav>
  `,
  styles: [`
    .nav-root {
      position: sticky; top: 0; z-index: 200;
      background: rgba(1,8,2,0.97);
      border-bottom: 1px solid var(--border-dim);
      backdrop-filter: blur(10px);
      box-shadow: 0 1px 0 rgba(91,248,112,0.04), 0 4px 24px -4px rgba(0,0,0,0.6);
    }
    .nav-inner { display: flex; align-items: center; height: 52px; gap: 0.4rem; }

    .nav-logo {
      font-family: var(--font-main); font-size: 1.1rem;
      color: var(--C-bright); text-shadow: 0 0 10px var(--Ts-faint);
      letter-spacing: 0.06em; white-space: nowrap; flex-shrink: 0;
      display: flex; align-items: center; gap: 0.4em;
      padding-right: 1rem; border-right: 1px solid var(--border-dim); margin-right: 0.4rem;
      transition: color var(--t-fast), text-shadow var(--t-fast);
      &::after { display: none; }
      &:hover  { color: #fff; text-shadow: 0 0 20px var(--Ts-bright); }
    }
    .logo-mark { font-size: 0.75em; color: var(--C); text-shadow: 0 0 12px var(--Ts); }
    .logo-sep  { color: var(--C-dim); opacity: 0.5; }

    .nav-links {
      display: flex; flex: 1; overflow-x: auto; scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .nav-link {
      font-family: var(--font-main); font-size: 0.9rem;
      color: var(--C-dim); padding: 0 0.85em; height: 52px;
      white-space: nowrap; letter-spacing: 0.08em;
      display: inline-flex; align-items: center; gap: 0.35em;
      position: relative; bottom: 0;
      transition: color var(--t-fast);
      
      &:hover { color: var(--C); background: rgba(255,255,255,0.05); }
      &.active { color: var(--C-bright); text-shadow: 0 0 10px var(--Ts-faint); background: rgba(255,255,255,0.1); }
    }

    .nav-admin {
      color: rgba(255,208,0,0.4);
      &:hover { color: var(--warn); }
      &.active { color: var(--warn); text-shadow: 0 0 8px var(--warn-glow); &::after { background: var(--warn); box-shadow: 0 0 8px var(--warn-glow); } }
    }

    .notif-pip {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 14px; height: 14px; background: var(--C); color: var(--Bg-dark);
      font-family: var(--font-mono); font-size: 0.55rem; font-weight: 700;
      padding: 0 3px; line-height: 1;
      animation: pulse-badge 2.5s ease-in-out infinite;
    }

    .nav-end {
      display: flex; align-items: center; gap: 0.5rem;
      margin-left: auto; flex-shrink: 0;
      padding-left: 0.8rem; border-left: 1px solid var(--border-dim);
    }

    .nav-user {
      font-family: var(--font-mono); font-size: 0.75rem; color: var(--C-dim);
      letter-spacing: 0.04em; display: flex; align-items: center; gap: 0.35em;
      white-space: nowrap; transition: color var(--t-fast);
      &::after { display: none; } &:hover { color: var(--C-bright); }
    }
    .user-sigil { font-size: 0.65em; opacity: 0.7; }

    @media (max-width: 680px) {
      .nav-link { padding: 0 0.55em; font-size: 0.82rem; }
      .nav-logo { font-size: 0.9rem; padding-right: 0.6rem; }
      .nav-user { display: none; }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private auth     = inject(AuthService);
  private notifSvc = inject(NotificationService);
  private pollSub?: Subscription;

  isLoggedIn  = this.auth.isLoggedIn;
  isAdmin     = this.auth.isAdmin;
  username    = computed(() => this.auth.currentUser()?.username ?? '');
  unreadCount = 0;

  ngOnInit() {
    if (!this.isLoggedIn()) return;
    this.pollSub = interval(30_000).pipe(
      startWith(0),
      switchMap(() => this.notifSvc.getUnreadCount().pipe(
        catchError(() => of({ count: 0 }))   // never kill the poll on error
      ))
    ).subscribe(r => this.unreadCount = r.count);
  }

  ngOnDestroy() { this.pollSub?.unsubscribe(); }
  logout()      { this.auth.logout(); }
}
