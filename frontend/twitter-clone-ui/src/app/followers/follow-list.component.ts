import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FollowService } from '../core/services/follow.service';
import { UserService } from '../core/services/user.service';
import { User } from '../core/models/models';
import { errorMessage } from '../core/error.util';
import { IconComponent } from '../shared/icon.component';
import { UserRowComponent } from '../shared/user-row.component';

/** One component serves both /followers[/:id] and /following[/:id]. */
@Component({
  selector: 'app-follow-list', standalone: true, imports: [RouterLink, IconComponent, UserRowComponent],
  template: `
  <header class="page-head"><a routerLink="/profile" class="icon-link" aria-label="Back"><app-icon name="back" /></a><h1>{{ mode === 'followers' ? 'Followers' : 'Following' }}</h1></header>
  @if (error()) { <p class="error pad" role="alert">{{ error() }}</p> }
  @for (u of users(); track u.id) { <app-user-row [user]="u" /> }
  @empty { <p class="empty">{{ loaded() ? (mode === 'followers' ? 'No followers yet.' : 'Not following anyone yet.') : 'Loading...' }}</p> }`
})
export class FollowListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private follows = inject(FollowService);
  private userApi = inject(UserService);
  mode: 'followers' | 'following' = this.route.snapshot.data['mode'];
  users = signal<User[]>([]);
  loaded = signal(false);
  error = signal('');

  ngOnInit() {
    this.route.paramMap.subscribe(p => {
      const id = Number(p.get('id') ?? this.auth.user()?.id);
      const list$ = this.mode === 'followers' ? this.follows.followers(id) : this.follows.following(id);
      list$.subscribe({
        next: rows => {
          const ids = rows.map(r => (this.mode === 'followers' ? r.followerId : r.followingId));
          if (!ids.length) { this.users.set([]); this.loaded.set(true); return; }
          this.userApi.batch(ids).subscribe({
            next: u => { this.users.set(ids.map(i => u.find(x => x.id === i)).filter((x): x is User => !!x)); this.loaded.set(true); },
            error: e => this.error.set(errorMessage(e))
          });
        },
        error: e => this.error.set(errorMessage(e))
      });
    });
  }
}
