import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../core/services/notification.service';
import { TimeAgoPipe } from './time-ago.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [RouterLink, TimeAgoPipe],
  styles: [`
    .notif-wrap { position: relative; }
    .notif-btn {
      position: relative; background: transparent; border: none; border-radius: 50%;
      width: 42px; height: 42px; padding: 0;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background .15s; color: var(--text2);
    }
    .notif-btn:hover { background: var(--hover2); color: var(--text); }
    .badge {
      position: absolute; top: 4px; right: 4px;
      background: var(--blue); color: #fff;
      font-size: .65rem; font-weight: 800;
      border-radius: 99px; min-width: 18px; height: 18px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px; line-height: 1; border: 2px solid var(--bg);
      animation: badgePop .3s ease both;
    }
    @keyframes badgePop {
      0% { transform: scale(0); }
      70% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .dropdown {
      position: absolute; top: calc(100% + 8px); right: 0; z-index: 200;
      width: 360px; max-height: 480px; overflow-y: auto;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
    }
    .dd-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 10px;
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; background: var(--surface2); z-index: 1;
    }
    .dd-head h3 { font-size: 1rem; font-weight: 800; }
    .mark-btn {
      font-size: .8rem; color: var(--blue); background: none; border: none;
      cursor: pointer; font-weight: 600; padding: 4px 8px; border-radius: 6px;
      transition: background .15s;
    }
    .mark-btn:hover { background: var(--blue-dim); }
    .notif-item {
      display: flex; gap: 12px; padding: 12px 16px;
      border-bottom: 1px solid var(--border2);
      transition: background .15s; cursor: pointer;
      text-decoration: none; color: inherit;
      align-items: flex-start;
    }
    .notif-item:hover { background: var(--hover); }
    .notif-item.unread { background: rgba(29,155,240,.05); }
    .notif-icon {
      font-size: 1.2rem; width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .notif-msg { font-size: .9rem; line-height: 1.4; }
    .notif-msg strong { font-weight: 700; }
    .notif-snippet {
      margin-top: 3px; font-size: .82rem; color: var(--text2);
      overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .notif-time { font-size: .78rem; color: var(--text3); margin-top: 2px; }
    .empty-dd { padding: 32px 20px; text-align: center; color: var(--text2); font-size: .92rem; line-height: 1.6; }
  `],
  template: `
  <div class="notif-wrap">
    <button class="notif-btn" id="notif-btn" aria-label="Notifications"
            (click)="toggle()" [attr.aria-expanded]="open()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      @if (unread() > 0) {
        <span class="badge">{{ unread() > 9 ? '9+' : unread() }}</span>
      }
    </button>

    @if (open()) {
      <div class="dropdown" role="dialog" aria-label="Notifications">
        <div class="dd-head">
          <h3>Notifications</h3>
          @if (ns.notifications().length > 0) {
            <button class="mark-btn" (click)="ns.clearAll()">Clear all</button>
          }
        </div>

        @if (ns.notifications().length === 0) {
          <p class="empty-dd">🔔 No notifications yet.<br>Likes, comments and follows will appear here.</p>
        }

        @for (n of ns.notifications(); track n.id) {
          @if (n.tweetId) {
            <a class="notif-item" [class.unread]="!n.read"
               [routerLink]="['/tweet', n.tweetId]"
               (click)="ns.markRead(n.id); open.set(false)">
              <span class="notif-icon">
                @if (n.type === 'like') { ❤️ }
                @if (n.type === 'comment') { 💬 }
                @if (n.type === 'follow') { 👥 }
              </span>
              <div style="min-width:0;flex:1">
                <p class="notif-msg"><strong>{{ n.actorName }}</strong> {{ n.message.replace(n.actorName, '').trim() }}</p>
                @if (n.tweetSnippet) { <p class="notif-snippet">{{ n.tweetSnippet }}</p> }
                <p class="notif-time">{{ n.createdAt | timeAgo }}</p>
              </div>
            </a>
          } @else {
            <div class="notif-item" [class.unread]="!n.read"
                 (click)="ns.markRead(n.id)">
              <span class="notif-icon">
                @if (n.type === 'like') { ❤️ }
                @if (n.type === 'comment') { 💬 }
                @if (n.type === 'follow') { 👥 }
              </span>
              <div style="min-width:0;flex:1">
                <p class="notif-msg"><strong>{{ n.actorName }}</strong> {{ n.message.replace(n.actorName, '').trim() }}</p>
                <p class="notif-time">{{ n.createdAt | timeAgo }}</p>
              </div>
            </div>
          }
        }
      </div>
    }
  </div>`
})
export class NotificationsComponent {
  ns = inject(NotificationService);
  open = signal(false);

  get unread() { return this.ns.unreadCount; }

  toggle() {
    this.open.update(v => !v);
    if (this.open()) this.ns.markAllRead();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (!el.closest('app-notifications')) this.open.set(false);
  }
}
