import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../services/notification.service';
import { NotificationDTO } from '../../models';
import { pick } from '../../services/typewriter.service';
import { CrtDialogService } from '../../services/crt-dialog.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  template: `
    <div class="narrow animate-in">

      <div class="page-head">
        <div class="text-mono text-dim text-xs mb-1">INCOMING — SYSTEM ALERTS</div>
        <div class="flex justify-between items-center">
          <h1 class="section-title">NOTIFICATIONS</h1>
          <div class="flex gap-1">
            @if (hasUnread) {
              <button class="btn btn-primary btn-sm" (click)="markAllRead()">MARK ALL READ</button>
            }
            @if (notifications.length > 0) {
              <button class="btn btn-sm btn-danger" (click)="clearAll()" matTooltip="Delete all notifications" matTooltipPosition="below">CLEAR ALL</button>
            }
          </div>
        </div>
        @if (statusLine) { <p class="flavor-quote">{{ statusLine }}</p> }
      </div>

      @if (loading) {
        <div class="loading-wrap">SCANNING INCOMING CHANNEL<span class="cursor"></span></div>
      }

      @if (error) {
        <div class="empty-state">
          <p class="empty-msg">CHANNEL UNAVAILABLE.</p>
          <p class="text-dim text-mono text-sm">Could not reach the notification service. Try again later.</p>
        </div>
      }

      @if (!loading && !error && notifications.length === 0) {
        <div class="empty-state">
          <p class="empty-msg">NO INCOMING SIGNALS.</p>
          <p class="text-dim text-mono text-sm">All systems nominal. No alerts queued.</p>
        </div>
      }

      <div class="stagger">
        @for (n of notifications; track n.id) {
          <div class="notif-item terminal-card" [class.unread]="!n.read"
            (click)="markRead(n)" role="button" tabindex="0"
            (keydown.enter)="markRead(n)">

            <div class="notif-dot" [class.dot-active]="!n.read"></div>

            <div class="notif-body">
              <p class="notif-msg">{{ n.message }}</p>
              <span class="text-mono text-dim text-xs">{{ relTime(n.createdAt) }}</span>
            </div>

            <button class="btn btn-icon dismiss-btn" (click)="dismiss($event, n.id)"
              title="Dismiss" aria-label="Dismiss">&#x2715;</button>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .page-head { margin-bottom: 1.2rem; }

    .notif-item {
      display: flex; align-items: flex-start; gap: 0.8rem;
      cursor: pointer; padding: 0.85rem 1rem;
      transition: background var(--t-mid);
      &.unread { border-left: 2px solid var(--C); background: rgba(91,248,112,0.03); }
      &:hover  { background: var(--Bg-hover); }
    }

    .notif-dot {
      flex-shrink: 0; width: 5px; height: 5px; margin-top: 0.6em;
      background: var(--border-dim);
      &.dot-active { background: var(--C); box-shadow: 0 0 8px var(--Ts); animation: blink 2.2s ease-in-out infinite; }
    }

    .notif-body { flex: 1; min-width: 0; }
    .notif-msg  { font-size: 0.95rem; line-height: 1.4; margin-bottom: 0.2rem; word-break: break-word; }

    .dismiss-btn {
      opacity: 0.3; font-size: 0.75rem; flex-shrink: 0;
      transition: opacity var(--t-fast), color var(--t-fast);
      &:hover { opacity: 1; color: var(--error); }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  private svc    = inject(NotificationService);
  private dialog = inject(CrtDialogService);

  notifications: NotificationDTO[] = [];
  loading    = true;
  error      = false;
  statusLine = '';

  get hasUnread() { return this.notifications.some(n => !n.read); }

  ngOnInit() {
    this.statusLine = pick([
      '"Silence is also a kind of message."',
      '"Every notification is someone reaching out."',
      '"Check your signals. Stay connected."',
      '"The network hums. You are not alone."',
    ]);
    this.svc.getAll().subscribe({
      next:  n => { this.notifications = n; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  markRead(n: NotificationDTO) {
    if (n.read) return;
    this.svc.markAsRead(n.id).subscribe(() => {
      this.notifications = this.notifications.map(x => x.id === n.id ? { ...x, read: true } : x);
    });
  }

  markAllRead() {
    this.svc.markAllAsRead().subscribe(() => {
      this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    });
  }

  dismiss(e: MouseEvent, id: number) {
    e.stopPropagation();
    this.svc.delete(id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
    });
  }

  clearAll() {
    this.dialog.confirm('DELETE ALL NOTIFICATIONS?', 'DELETE', 'CANCEL').subscribe(ok => {
      if (!ok) return;
      this.svc.deleteAll().subscribe(() => { this.notifications = []; });
    });
  }

  relTime(iso: string): string {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  }
}
