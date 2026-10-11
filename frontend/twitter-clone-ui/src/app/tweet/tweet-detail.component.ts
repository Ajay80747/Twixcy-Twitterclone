import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TweetService } from '../core/services/tweet.service';
import { TweetStateService } from '../core/services/tweet-state.service';
import { NotificationService } from '../core/services/notification.service';
import { Tweet, TweetComment } from '../core/models/models';
import { errorMessage } from '../core/error.util';
import { AvatarComponent } from '../shared/avatar.component';
import { TimeAgoPipe } from '../shared/time-ago.pipe';
import { TweetCardComponent } from './tweet-card.component';

@Component({
  selector: 'app-tweet-detail', standalone: true,
  imports: [FormsModule, RouterLink, AvatarComponent, TimeAgoPipe, TweetCardComponent],
  styles: [`
    .reply-composer {
      display: flex; gap: 12px; padding: 14px 16px;
      border-bottom: 1px solid var(--border); align-items: flex-start;
    }
    .reply-input {
      flex: 1; border: none; background: none; outline: none;
      font-size: 1rem; resize: none; color: var(--text);
      line-height: 1.5; min-height: 48px; width: 100%;
    }
    .reply-input::placeholder { color: var(--text2); }
    .reply-footer {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border2);
    }
    .replies-header {
      padding: 12px 16px 4px;
      font-size: .9rem; color: var(--text2); font-weight: 600;
      border-bottom: 1px solid var(--border);
    }
    .comment-article {
      display: flex; gap: 12px; padding: 14px 16px;
      border-bottom: 1px solid var(--border); transition: background .15s;
    }
    .comment-article:hover { background: var(--hover); }
    .comment-content {
      white-space: pre-wrap; overflow-wrap: anywhere;
      font-size: .98rem; line-height: 1.55; color: var(--text);
      margin: 4px 0 6px;
    }
  `],
  template: `
  <!-- Header -->
  <header class="page-head">
    <button class="btn-icon" (click)="goBack()" aria-label="Back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="20" height="20">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
    </button>
    <h1>Post</h1>
  </header>

  @if (loading()) {
    <div style="display:flex;align-items:center;gap:12px;padding:24px 20px;">
      <span class="spinner"></span><span class="muted">Loading post…</span>
    </div>
  }

  @if (tweet(); as t) {
    <!-- The tweet itself via TweetCard -->
    <app-tweet-card [tweet]="t" (deleted)="onDeleted()" />

    <!-- Replies count header -->
    <div class="replies-header">
      {{ comments().length }} {{ comments().length === 1 ? 'reply' : 'replies' }}
    </div>

    <!-- Reply composer -->
    <section class="reply-composer" id="comment-composer">
      @if (auth.user(); as me) {
        <app-avatar [name]="me.firstName + ' ' + me.lastName" [src]="me.profileImage" [size]="38"/>
      }
      <div style="flex:1;min-width:0">
        <textarea id="comment-input" class="reply-input" [(ngModel)]="text" rows="2" maxlength="280"
                  placeholder="Post your reply…" aria-label="Comment text"></textarea>
        <div class="reply-footer">
          <span class="counter" [class.warn]="280 - text.length <= 20" [class.over]="text.length > 280">
            {{ 280 - text.length }}
          </span>
          <button class="btn btn-blue btn-sm" id="comment-submit"
                  [disabled]="!text.trim() || posting()" (click)="addComment()">
            @if (posting()) { <span class="spinner" style="width:12px;height:12px;border-width:2px"></span> }
            @else { Reply }
          </button>
        </div>
      </div>
    </section>

    @if (error()) { <p class="error pad" role="alert">{{ error() }}</p> }

    <!-- Comments list -->
    @for (c of comments(); track c.id) {
      <article class="comment-article" [id]="'comment-' + c.id">
        <a [routerLink]="['/profile', c.username]">
          <app-avatar [name]="c.name" [src]="c.profileImage" [size]="38" />
        </a>
        <div class="tweet-body">
          <header class="tweet-head">
            <a class="tweet-name" [routerLink]="['/profile', c.username]">{{ c.name }}</a>
            <span class="tweet-handle">&#64;{{ c.username }}</span>
            <span class="tweet-dot">&middot;</span>
            <span class="tweet-time">{{ c.createdAt | timeAgo }}</span>
          </header>

          <!-- Edit comment -->
          @if (editingCommentId() === c.id) {
            <textarea class="edit-box" [(ngModel)]="editDraft" maxlength="280" rows="2"
                      [id]="'edit-comment-' + c.id"></textarea>
            <div class="row-end">
              <span class="counter" [class.over]="editDraft.length > 280">{{ 280 - editDraft.length }}</span>
              <button class="btn btn-outline btn-sm" (click)="editingCommentId.set(null)">Cancel</button>
              <button class="btn btn-blue btn-sm" [disabled]="!editDraft.trim()" (click)="saveComment(c)">Save</button>
            </div>
          } @else {
            <p class="comment-content">{{ c.content }}</p>
          }

          <!-- Comment actions (own comments) -->
          @if (c.userId === auth.user()?.id) {
            <footer class="actions">
              <button type="button" class="act" (click)="startEditComment(c)" aria-label="Edit comment"
                      [id]="'edit-comment-btn-' + c.id">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button type="button" class="act danger" (click)="deleteComment(c)" aria-label="Delete comment"
                      [id]="'delete-comment-btn-' + c.id">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </footer>
          }
        </div>
      </article>
    }

    @if (comments().length === 0 && !loading()) {
      <p class="empty">No replies yet. Be the first to reply! 💬</p>
    }
  } @else if (error()) {
    <p class="error pad">{{ error() }}</p>
  }`
})
export class TweetDetailComponent implements OnInit {
  auth    = inject(AuthService);
  private api    = inject(TweetService);
  private tweetState = inject(TweetStateService);
  private notifs = inject(NotificationService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  tweet    = signal<Tweet | null>(null);
  comments = signal<TweetComment[]>([]);
  error    = signal('');
  loading  = signal(false);
  posting  = signal(false);
  text     = '';
  editDraft = '';
  editingCommentId = signal<number | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(p => {
      const id = Number(p.get('id'));
      this.loading.set(true); this.error.set('');
      this.api.get(id).subscribe({
        next: t => {
          this.tweetState.upsert(t);
          this.tweet.set(t);
          this.loading.set(false);
        },
        error: e => { this.error.set(errorMessage(e)); this.loading.set(false); }
      });
      this.api.listComments(id).subscribe({ next: c => this.comments.set(c), error: () => {} });
    });
  }

  addComment() {
    const t = this.tweet(); if (!t || !this.text.trim() || this.posting()) return;
    this.posting.set(true);
    this.api.addComment(t.id, this.text.trim()).subscribe({
      next: c => {
        this.comments.update(list => [...list, c]);
        // Update comment count globally so all pages see it
        this.tweetState.incrementCommentCount(t.id);
        const stored = this.tweetState.get(t.id);
        if (stored) this.tweet.set(stored());

        // Notify tweet owner (if not self-replying)
        const me = this.auth.user();
        if (me && me.id !== t.userId) {
          this.notifs.notifyComment(
            t.userId,
            me.firstName + ' ' + me.lastName, me.username, me.profileImage,
            t.id,
            t.content ? t.content.substring(0, 60) : '📷 Image post'
          );
        }

        this.text = '';
        this.error.set('');
        this.posting.set(false);
      },
      error: e => { this.error.set(errorMessage(e)); this.posting.set(false); }
    });
  }

  startEditComment(c: TweetComment) { this.editDraft = c.content; this.editingCommentId.set(c.id); }

  saveComment(c: TweetComment) {
    if (!this.editDraft.trim()) return;
    this.api.updateComment(c.id, this.editDraft.trim()).subscribe({
      next: updated => {
        this.comments.update(list => list.map(x => x.id === c.id ? updated : x));
        this.editingCommentId.set(null);
      },
      error: e => this.error.set(errorMessage(e))
    });
  }

  deleteComment(c: TweetComment) {
    if (!confirm('Delete this reply?')) return;
    this.api.deleteComment(c.id).subscribe({
      next: () => {
        this.comments.update(list => list.filter(x => x.id !== c.id));
        const t = this.tweet();
        if (t) {
          this.tweetState.decrementCommentCount(t.id);
          const stored = this.tweetState.get(t.id);
          if (stored) this.tweet.set(stored());
        }
      },
      error: e => this.error.set(errorMessage(e))
    });
  }

  onDeleted() { this.router.navigate(['/home']); }
  goBack() { history.back(); }
}
