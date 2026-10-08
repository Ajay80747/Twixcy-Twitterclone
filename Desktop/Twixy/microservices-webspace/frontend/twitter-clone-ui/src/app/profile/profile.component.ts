import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { FollowService } from '../core/services/follow.service';
import { TweetService } from '../core/services/tweet.service';
import { TweetStateService } from '../core/services/tweet-state.service';
import { UserService } from '../core/services/user.service';
import { NotificationService } from '../core/services/notification.service';
import { Follow, FollowCount, Tweet, User } from '../core/models/models';
import { errorMessage } from '../core/error.util';
import { AvatarComponent } from '../shared/avatar.component';
import { TweetCardComponent } from '../tweet/tweet-card.component';
import { UserRowComponent } from '../shared/user-row.component';

type ProfileTab = 'tweets' | 'followers' | 'following';

@Component({
  selector: 'app-profile', standalone: true,
  imports: [RouterLink, AvatarComponent, TweetCardComponent, UserRowComponent],
  template: `
  @if (user(); as u) {
    <!-- Page header -->
    <header class="page-head">
      <button class="btn-icon" (click)="goBack()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="20" height="20">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
      </button>
      <div>
        <h1>{{ u.firstName }} {{ u.lastName }}</h1>
        <span class="page-head-sub">{{ tweetCount() }} posts</span>
      </div>
    </header>

    <!-- Banner + Profile card wrapped so the overlap blends seamlessly -->
    <section class="profile-wrap">
      <!-- Banner -->
      @if (u.bannerImage) {
        <div class="banner banner-custom" [style.background-image]="'url(' + u.bannerImage + ')'"></div>
      } @else {
        <div class="banner">
          <div class="banner-pattern"></div>
          <div class="banner-accent"></div>
        </div>
      }

      <!-- Profile card -->
      <section class="profile-card">
        <div class="profile-top">
          <div class="avatar-ring">
            <app-avatar [name]="u.firstName + ' ' + u.lastName" [src]="u.profileImage" [size]="96" />
          </div>
          <div class="profile-actions">
            @if (mine()) {
              <a class="btn btn-outline" routerLink="/edit-profile" id="edit-profile-btn">Edit profile</a>
            } @else {
              <button class="btn" id="follow-toggle-btn"
                [class.btn-outline]="following()"
                [class.btn-blue]="!following()"
                [disabled]="busy()"
                (click)="toggleFollow()">
                @if (busy()) { <span class="spinner" style="width:14px;height:14px;border-width:2px"></span> }
                @else { {{ following() ? 'Unfollow' : 'Follow' }} }
              </button>
              @if (followedBy()) {
                <span class="follows-you-badge">Follows you</span>
              }
            }
          </div>
        </div>

        <h2 class="profile-name">{{ u.firstName }} {{ u.lastName }}</h2>
        <p class="profile-handle">&#64;{{ u.username }}</p>
        @if (u.bio) { <p class="bio">{{ u.bio }}</p> }

        <!-- Stats row -->
        <div class="stats">
          <button class="stat-btn" [class.active]="tab() === 'following'" (click)="setTab('following')">
            <b>{{ counts().following }}</b> Following
          </button>
          <button class="stat-btn" [class.active]="tab() === 'followers'" (click)="setTab('followers')">
            <b>{{ counts().followers }}</b> Followers
          </button>
          <span class="stat-item"><b>{{ tweetCount() }}</b> Tweets</span>
        </div>
      </section>
    </section>

    @if (error()) { <p class="error pad" role="alert">{{ error() }}</p> }

    <!-- Tab navigation -->
    <div class="tabs-row" role="tablist">
      <button class="tab-btn" role="tab" [class.active]="tab() === 'tweets'"
        [attr.aria-selected]="tab() === 'tweets'" (click)="setTab('tweets')">Tweets</button>
      <button class="tab-btn" role="tab" [class.active]="tab() === 'followers'"
        [attr.aria-selected]="tab() === 'followers'" (click)="setTab('followers')">
        Followers
        @if (counts().followers > 0) { <span class="tab-count">{{ counts().followers }}</span> }
      </button>
      <button class="tab-btn" role="tab" [class.active]="tab() === 'following'"
        [attr.aria-selected]="tab() === 'following'" (click)="setTab('following')">
        Following
        @if (counts().following > 0) { <span class="tab-count">{{ counts().following }}</span> }
      </button>
    </div>

    <!-- Tweets tab -->
    @if (tab() === 'tweets') {
      @if (tweetsLoading()) {
        <div style="display:flex;align-items:center;gap:12px;padding:24px 20px;">
          <span class="spinner"></span><span class="muted">Loading tweets…</span>
        </div>
      }
      @for (t of tweets(); track t.id) {
        <app-tweet-card [tweet]="t" (deleted)="remove($event)" />
      }
      @if (!tweetsLoading() && tweets().length === 0) {
        <p class="empty">{{ mine() ? "You haven't posted yet. Share what's on your mind!" : u.firstName + " hasn't posted yet." }}</p>
      }
    }

    <!-- Followers tab -->
    @if (tab() === 'followers') {
      @if (listLoading()) {
        <div style="display:flex;align-items:center;gap:12px;padding:24px 20px;">
          <span class="spinner"></span><span class="muted">Loading followers…</span>
        </div>
      }
      @for (fu of followUsers(); track fu.id) {
        <app-user-row [user]="fu" />
      }
      @if (!listLoading() && followUsers().length === 0) {
        <p class="empty">{{ mine() ? "You don't have any followers yet." : u.firstName + " has no followers yet." }}</p>
      }
    }

    <!-- Following tab -->
    @if (tab() === 'following') {
      @if (listLoading()) {
        <div style="display:flex;align-items:center;gap:12px;padding:24px 20px;">
          <span class="spinner"></span><span class="muted">Loading following…</span>
        </div>
      }
      @for (fu of followUsers(); track fu.id) {
        <app-user-row [user]="fu" />
      }
      @if (!listLoading() && followUsers().length === 0) {
        <p class="empty">{{ mine() ? "You're not following anyone yet. Discover people to follow!" : u.firstName + " isn't following anyone yet." }}</p>
      }
    }
  } @else if (error()) {
    <p class="error pad">{{ error() }}</p>
  } @else {
    <div style="display:flex;align-items:center;gap:12px;padding:24px 20px;">
      <span class="spinner"></span><span class="muted">Loading profile…</span>
    </div>
  }`
})
export class ProfileComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private auth    = inject(AuthService);
  private users   = inject(UserService);
  private tweetApi= inject(TweetService);
  private follows = inject(FollowService);
  private tweetState = inject(TweetStateService);
  private notifs  = inject(NotificationService);

  user        = signal<User | null>(null);
  tweets      = signal<Tweet[]>([]);
  followUsers = signal<User[]>([]);
  counts      = signal<FollowCount>({ followers: 0, following: 0 });
  following   = signal(false);
  followedBy  = signal(false);
  busy        = signal(false);
  error       = signal('');
  tab         = signal<ProfileTab>('tweets');
  tweetsLoading = signal(false);
  listLoading   = signal(false);

  tweetCount = computed(() => this.tweets().length);
  mine = computed(() => this.user()?.id === this.auth.user()?.id);

  ngOnInit() {
    this.route.paramMap.subscribe(p => this.load(p.get('username')));
  }

  setTab(t: ProfileTab) {
    this.tab.set(t);
    const u = this.user();
    if (!u) return;
    if (t === 'followers') this.loadFollowers(u.id);
    else if (t === 'following') this.loadFollowing(u.id);
  }

  private load(username: string | null) {
    this.user.set(null); this.error.set(''); this.tab.set('tweets');
    this.tweets.set([]); this.followUsers.set([]);
    const src$ = username ? this.users.byUsername(username) : this.users.me();
    src$.subscribe({
      next: u => {
        this.user.set(u);
        this.refreshCounts(u.id);
        this.loadTweets(u.id);
        if (u.id !== this.auth.user()?.id) {
          this.follows.status(u.id).subscribe(s => {
            this.following.set(s.following);
            this.followedBy.set(s.followedBy);
          });
        }
      },
      error: e => this.error.set(errorMessage(e))
    });
  }

  private loadTweets(userId: number) {
    this.tweetsLoading.set(true);
    this.tweetApi.byUser(userId).subscribe({
      next:  t => { this.tweetState.loadMany(t); this.tweets.set(t); this.tweetsLoading.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.tweetsLoading.set(false); }
    });
  }

  private loadFollowers(userId: number) {
    this.listLoading.set(true); this.followUsers.set([]);
    this.follows.followers(userId).subscribe({
      next: rows => this.hydrateUsers(rows.map(r => r.followerId)),
      error: e => { this.error.set(errorMessage(e)); this.listLoading.set(false); }
    });
  }

  private loadFollowing(userId: number) {
    this.listLoading.set(true); this.followUsers.set([]);
    this.follows.following(userId).subscribe({
      next: rows => this.hydrateUsers(rows.map(r => r.followingId)),
      error: e => { this.error.set(errorMessage(e)); this.listLoading.set(false); }
    });
  }

  private hydrateUsers(ids: number[]) {
    if (!ids.length) { this.listLoading.set(false); return; }
    this.users.batch(ids).subscribe({
      next:  list => { this.followUsers.set(ids.map(i => list.find(x => x.id === i)!).filter(Boolean)); this.listLoading.set(false); },
      error: e    => { this.error.set(errorMessage(e)); this.listLoading.set(false); }
    });
  }

  private refreshCounts(id: number) {
    this.follows.counts(id).subscribe(c => this.counts.set(c));
  }

  toggleFollow() {
    const u = this.user(); if (!u) return;
    this.busy.set(true);
    const wasFollowing = this.following();
    const call = (wasFollowing ? this.follows.unfollow(u.id) : this.follows.follow(u.id)) as Observable<unknown>;
    call.subscribe({
      next:  () => {
        this.following.update(v => !v);
        this.busy.set(false);
        this.refreshCounts(u.id);
        // Notify the target user when they receive a new follower
        if (!wasFollowing) {
          const me = this.auth.user();
          if (me && me.id !== u.id) {
            this.notifs.notifyFollow(
              u.id,
              me.firstName + ' ' + me.lastName, me.username, me.profileImage
            );
          }
        }
      },
      error: e  => { this.error.set(errorMessage(e)); this.busy.set(false); }
    });
  }

  remove(id: number) { this.tweetState.remove(id); this.tweets.update(list => list.filter(t => t.id !== id)); }
  goBack() { history.back(); }
}
