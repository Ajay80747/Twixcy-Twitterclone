import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

export interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow';
  actorName: string;
  actorUsername: string;
  actorImage?: string | null;
  tweetId?: number;
  tweetSnippet?: string;
  message: string;
  read: boolean;
  createdAt: Date;
  targetUserId: number;
}

const STORAGE_KEY = 'twixcy.notifications.v1';
let nextId = 1;

function loadAll(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Omit<Notification, 'createdAt'> & { createdAt: string }>;
    return parsed.map(n => ({ ...n, createdAt: new Date(n.createdAt) }));
  } catch {
    return [];
  }
}

function persistAll(list: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private auth = inject(AuthService);
  private _all = signal<Notification[]>(loadAll());

  readonly notifications = computed(() => {
    const me = this.auth.user()?.id;
    if (me == null) return [];
    return this._all().filter(n => n.targetUserId === me);
  });

  readonly unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  notifyLike(targetUserId: number,
             actorName: string, actorUsername: string, actorImage: string | null | undefined,
             tweetId: number, tweetSnippet: string) {
    const me = this.auth.user()?.id;
    if (me != null && targetUserId === me) return;
    this.add(targetUserId, {
      type: 'like',
      actorName, actorUsername, actorImage,
      tweetId, tweetSnippet,
      message: `${actorName} liked your post`,
    });
  }

  notifyComment(targetUserId: number,
                actorName: string, actorUsername: string, actorImage: string | null | undefined,
                tweetId: number, tweetSnippet: string) {
    const me = this.auth.user()?.id;
    if (me != null && targetUserId === me) return;
    this.add(targetUserId, {
      type: 'comment',
      actorName, actorUsername, actorImage,
      tweetId, tweetSnippet,
      message: `${actorName} replied to your post`,
    });
  }

  notifyFollow(targetUserId: number,
               actorName: string, actorUsername: string, actorImage: string | null | undefined) {
    const me = this.auth.user()?.id;
    if (me != null && targetUserId === me) return;
    this.add(targetUserId, {
      type: 'follow',
      actorName, actorUsername, actorImage,
      message: `${actorName} started following you`,
    });
  }

  markAllRead() {
    const me = this.auth.user()?.id;
    if (me == null) return;
    this._all.update(list => {
      const updated = list.map(n => n.targetUserId === me ? { ...n, read: true } : n);
      persistAll(updated);
      return updated;
    });
  }

  markRead(id: number) {
    this._all.update(list => {
      const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
      persistAll(updated);
      return updated;
    });
  }

  remove(id: number) {
    this._all.update(list => {
      const updated = list.filter(n => n.id !== id);
      persistAll(updated);
      return updated;
    });
  }

  clearAll() {
    const me = this.auth.user()?.id;
    this._all.update(list => {
      const updated = me == null ? list : list.filter(n => n.targetUserId !== me);
      persistAll(updated);
      return updated;
    });
  }

  private add(targetUserId: number, partial: Omit<Notification, 'id' | 'read' | 'createdAt' | 'targetUserId'>) {
    this._all.update(list => {
      const startId = Math.max(nextId, ...list.map(n => n.id).concat(0)) + 1;
      const n: Notification = {
        ...partial, id: startId, read: false, createdAt: new Date(), targetUserId
      };
      nextId = startId + 1;
      const updated = [n, ...list].slice(0, 100);
      persistAll(updated);
      return updated;
    });
  }
}
