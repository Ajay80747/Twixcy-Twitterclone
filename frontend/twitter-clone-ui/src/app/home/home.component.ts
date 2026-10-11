import { Component, OnInit, inject, signal } from '@angular/core';
import { TweetService } from '../core/services/tweet.service';
import { TweetStateService } from '../core/services/tweet-state.service';
import { Tweet } from '../core/models/models';
import { errorMessage } from '../core/error.util';
import { TweetCardComponent } from '../tweet/tweet-card.component';
import { TweetComposerComponent } from '../tweet/tweet-composer.component';

@Component({
  selector: 'app-home', standalone: true, imports: [TweetCardComponent, TweetComposerComponent],
  template: `
  <header class="page-head" role="banner">
    <h1>Home</h1>
  </header>

  <!-- Tab bar -->
  <div class="tabs-row" role="tablist" aria-label="Feed tabs">
    <button id="tab-foryou" class="tab-btn" role="tab"
      [class.active]="tab() === 'explore'"
      [attr.aria-selected]="tab() === 'explore'"
      (click)="select('explore')">For you</button>
    <button id="tab-following" class="tab-btn" role="tab"
      [class.active]="tab() === 'feed'"
      [attr.aria-selected]="tab() === 'feed'"
      (click)="select('feed')">Following</button>
  </div>

  <!-- Composer -->
  <app-tweet-composer (posted)="onPosted($event)"/>

  <!-- Feed -->
  @if (error()) {
    <div class="server-error-banner" role="alert">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ error() }}</span>
      <button class="btn btn-sm btn-outline" style="margin-left:auto" (click)="load()">Retry</button>
    </div>
  }
  @if (loading()) {
    <div style="display:flex;align-items:center;gap:12px;padding:24px 20px;">
      <span class="spinner"></span>
      <span class="muted">Loading your feed…</span>
    </div>
  }
  @for (t of tweets(); track t.id) {
    <app-tweet-card [tweet]="t" (deleted)="remove($event)"/>
  }
  @if (!loading() && tweets().length === 0 && !error()) {
    <p class="empty">
      {{ tab() === 'feed'
          ? '🙈 Nothing from people you follow yet. Try "For you" or search for people to follow.'
          : '✨ No posts yet — be the first to write something!' }}
    </p>
  }`
})
export class HomeComponent implements OnInit {
  private api   = inject(TweetService);
  private state = inject(TweetStateService);

  tab     = signal<'explore' | 'feed'>('explore');
  tweets  = signal<Tweet[]>([]);
  loading = signal(false);
  error   = signal('');

  ngOnInit() { this.load(); }
  select(tab: 'explore' | 'feed') { this.tab.set(tab); this.load(); }

  load() {
    this.loading.set(true); this.error.set('');
    (this.tab() === 'feed' ? this.api.feed() : this.api.explore()).subscribe({
      next: tweets => {
        this.state.loadMany(tweets);
        this.tweets.set(tweets);
        this.loading.set(false);
      },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); }
    });
  }

  onPosted(t: Tweet) {
    this.state.upsert(t);
    this.tweets.update(list => [t, ...list]);
  }

  remove(id: number) {
    this.state.remove(id);
    this.tweets.update(list => list.filter(t => t.id !== id));
  }
}
