import { Injectable, signal, computed, Signal } from '@angular/core';
import { Tweet } from '../models/models';

export type TweetSignal = Signal<Tweet>;

@Injectable({ providedIn: 'root' })
export class TweetStateService {
  private store = new Map<number, ReturnType<typeof signal<Tweet>>>();

  loadMany(tweets: Tweet[]): Tweet[] {
    for (const t of tweets) this.upsert(t);
    return tweets;
  }

  upsert(t: Tweet): ReturnType<typeof signal<Tweet>> {
    const existing = this.store.get(t.id);
    if (existing) {
      existing.set(t);
      return existing;
    }
    const s = signal<Tweet>(t);
    this.store.set(t.id, s);
    return s;
  }

  patch(t: Tweet): void {
    const existing = this.store.get(t.id);
    if (existing) {
      existing.set(t);
    } else {
      this.store.set(t.id, signal<Tweet>(t));
    }
  }

  remove(id: number): void {
    this.store.delete(id);
  }

  /** Get the raw signal for a tweet (or null if not in store). Use in templates as: store.signal(id)?.() ?? fallback */
  signal(id: number): ReturnType<typeof signal<Tweet>> | null {
    return this.store.get(id) ?? null;
  }

  /** @deprecated Use signal(id) instead — returns the same thing. */
  get(id: number): ReturnType<typeof signal<Tweet>> | null {
    return this.signal(id);
  }

  incrementCommentCount(tweetId: number): void {
    const s = this.store.get(tweetId);
    if (s) {
      const t = s();
      s.set({ ...t, commentCount: t.commentCount + 1 });
    }
  }

  decrementCommentCount(tweetId: number): void {
    const s = this.store.get(tweetId);
    if (s) {
      const t = s();
      s.set({ ...t, commentCount: Math.max(0, t.commentCount - 1) });
    }
  }
}
