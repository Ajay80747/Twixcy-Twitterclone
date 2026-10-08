import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TweetService } from '../core/services/tweet.service';
import { TweetStateService } from '../core/services/tweet-state.service';
import { NotificationService } from '../core/services/notification.service';
import { Tweet } from '../core/models/models';
import { errorMessage } from '../core/error.util';
import { AvatarComponent } from '../shared/avatar.component';
import { TimeAgoPipe } from '../shared/time-ago.pipe';

@Component({
  selector: 'app-tweet-card', standalone: true,
  imports: [FormsModule, RouterLink, AvatarComponent, TimeAgoPipe],
  styles: [`
    .like-pop { animation: likePop .35s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes likePop {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.4); }
      70%  { transform: scale(.9); }
      100% { transform: scale(1); }
    }
    .act-count { min-width: 18px; text-align: left; }
    .img-preview {
      width: 100%; max-height: 400px; object-fit: cover;
      border-radius: 12px; border: 1px solid var(--border);
      margin: 8px 0 10px; display: block;
    }
  `],
  template: `
  <article class="tweet" [id]="'tweet-' + t().id">
    <!-- Avatar -->
    <a [routerLink]="['/profile', t().username]" [attr.aria-label]="'View ' + t().username + ' profile'">
      <app-avatar [name]="t().name" [src]="t().profileImage" [size]="44"/>
    </a>

    <!-- Body -->
    <div class="tweet-body">
      <header class="tweet-head">
        <a class="tweet-name" [routerLink]="['/profile', t().username]">{{ t().name }}</a>
        <span class="tweet-handle">&#64;{{ t().username }}</span>
        <span class="tweet-dot">&middot;</span>
        <span class="tweet-time">{{ t().createdAt | timeAgo }}</span>
        @if (t().updatedAt !== t().createdAt) {
          <span class="tweet-dot">&middot;</span>
          <span class="tweet-time" title="edited">✏️</span>
        }
      </header>

      <!-- Edit mode -->
      @if (editing()) {
        <textarea class="edit-box" [(ngModel)]="draft" maxlength="280" rows="3"
                  [id]="'edit-' + t().id" placeholder="What's happening?"></textarea>
        <div class="row-end">
          <span class="counter" [class.over]="draft.length > 280">{{ 280 - draft.length }}</span>
          <button class="btn btn-outline btn-sm" (click)="editing.set(false)">Cancel</button>
          <button class="btn btn-blue btn-sm" [disabled]="!canSave() || saving()" (click)="save()">
            @if (saving()) { <span class="spinner" style="width:12px;height:12px;border-width:2px"></span> }
            @else { Save }
          </button>
        </div>
      } @else {
        @if (t().content) {
          <a class="content" [routerLink]="['/tweet', t().id]">{{ t().content }}</a>
        }
        @if (t().imageUrl) {
          <a [routerLink]="['/tweet', t().id]">
            <img class="img-preview" [src]="t().imageUrl" alt="Attached image" loading="lazy">
          </a>
        }
      }

      @if (error()) {
        <p class="error small" role="alert">{{ error() }}</p>
      }

      <!-- Action bar -->
      <footer class="actions">
        <!-- Like -->
        <button type="button" class="act like"
                [class.on]="t().likedByMe"
                [class.like-pop]="justLiked()"
                [disabled]="likeLoading()"
                (click)="toggleLike()"
                [attr.aria-pressed]="t().likedByMe"
                [attr.aria-label]="t().likedByMe ? 'Unlike' : 'Like'"
                [id]="'like-btn-' + t().id">
          <svg viewBox="0 0 24 24" [attr.fill]="t().likedByMe ? 'currentColor' : 'none'"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span class="act-count">{{ t().likeCount }}</span>
        </button>

        <!-- Comment (navigate to detail) -->
        <a class="act" [routerLink]="['/tweet', t().id]" aria-label="View comments"
           [id]="'comment-btn-' + t().id">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="act-count">{{ t().commentCount }}</span>
        </a>

        <!-- Share / copy link -->
        <button type="button" class="act" (click)="share()" aria-label="Copy link"
                [id]="'share-btn-' + t().id">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          @if (copied()) { <span style="font-size:.78rem;color:var(--green)">Copied!</span> }
        </button>

        <!-- Owner actions -->
        @if (mine()) {
          <button type="button" class="act" (click)="startEdit()" aria-label="Edit tweet" title="Edit"
                  [id]="'edit-btn-' + t().id">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button type="button" class="act danger" (click)="removeTweet()" aria-label="Delete tweet" title="Delete"
                  [id]="'delete-btn-' + t().id">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        }
      </footer>
    </div>
  </article>`
})
export class TweetCardComponent implements OnInit {
  @Input({ required: true }) tweet!: Tweet;
  @Output() deleted = new EventEmitter<number>();

  private auth   = inject(AuthService);
  private api    = inject(TweetService);
  private state  = inject(TweetStateService);
  private notifs = inject(NotificationService);

  editing     = signal(false);
  saving      = signal(false);
  error       = signal('');
  justLiked   = signal(false);
  copied      = signal(false);
  likeLoading = signal(false);
  draft = '';

  private storeSig: ReturnType<typeof signal<Tweet>> | null = null;

  t = computed((): Tweet => {
    if (this.storeSig) return this.storeSig();
    return this.tweet;
  });
  mine = computed(() => this.t().userId === this.auth.user()?.id);
  canSave = computed(() => (this.draft.trim().length > 0 || !!this.t().imageUrl) && this.draft.length <= 280);

  ngOnInit() {
    this.storeSig = this.state.upsert(this.tweet);
  }

  toggleLike() {
    if (this.likeLoading()) return;

    const t = this.t();
    const wasLiked = t.likedByMe;

    const optimistic: Tweet = { ...t, likedByMe: !wasLiked, likeCount: t.likeCount + (wasLiked ? -1 : 1) };
    this.state.patch(optimistic);

    if (!wasLiked) {
      this.justLiked.set(true);
      setTimeout(() => this.justLiked.set(false), 400);
    }

    this.likeLoading.set(true);
    const call = wasLiked ? this.api.unlike(t.id) : this.api.like(t.id);
    call.subscribe({
      next: updated => {
        this.state.patch(updated);
        this.likeLoading.set(false);
        this.error.set('');

        const me = this.auth.user();
        if (!wasLiked && me && me.id !== t.userId) {
          this.notifs.notifyLike(
            t.userId,
            me.firstName + ' ' + me.lastName, me.username, me.profileImage,
            t.id,
            t.content ? t.content.substring(0, 60) : '📷 Image post'
          );
        }
      },
      error: e => {
        this.state.patch(t);
        this.error.set(errorMessage(e));
        this.likeLoading.set(false);
      }
    });
  }

  startEdit() { this.draft = this.t().content ?? ''; this.editing.set(true); }

  save() {
    this.saving.set(true);
    this.api.update(this.t().id, this.draft.trim(), this.t().imageUrl).subscribe({
      next: updated => {
        this.state.patch(updated);
        this.editing.set(false);
        this.saving.set(false);
        this.error.set('');
      },
      error: e => { this.error.set(errorMessage(e)); this.saving.set(false); }
    });
  }

  removeTweet() {
    if (!confirm('Delete this post?')) return;
    this.api.delete(this.t().id).subscribe({
      next:  () => { this.state.remove(this.t().id); this.deleted.emit(this.t().id); },
      error: e  => this.error.set(errorMessage(e))
    });
  }

  share() {
    const url = window.location.origin + '/tweet/' + this.t().id;
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true); setTimeout(() => this.copied.set(false), 2000);
    }).catch(() => {});
  }
}
