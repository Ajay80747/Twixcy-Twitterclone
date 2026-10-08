import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { FollowService } from '../core/services/follow.service';
import { NotificationService } from '../core/services/notification.service';
import { User } from '../core/models/models';
import { AvatarComponent } from './avatar.component';

@Component({
  selector: 'app-user-row', standalone: true, imports: [RouterLink, AvatarComponent],
  template: `
    <div class="user-row">
      <a class="who" [routerLink]="['/profile', user.username]">
        <app-avatar [name]="user.firstName + ' ' + user.lastName" [src]="user.profileImage" [size]="42" />
        <div class="who-text"><strong>{{ user.firstName }} {{ user.lastName }}</strong><span class="muted">&#64;{{ user.username }}</span></div>
      </a>
      @if (!isSelf) {
        <button class="btn btn-sm" [class.btn-ghost]="following()" [disabled]="busy()" (click)="toggle()">
          {{ following() ? 'Following' : 'Follow' }}
        </button>
      }
    </div>`
})
export class UserRowComponent implements OnInit {
  @Input({ required: true }) user!: User;
  private follows = inject(FollowService);
  private auth = inject(AuthService);
  private notifs = inject(NotificationService);
  following = signal(false);
  busy = signal(false);

  get isSelf() { return this.user.id === this.auth.user()?.id; }

  ngOnInit() {
    if (!this.isSelf) this.follows.status(this.user.id).subscribe({ next: s => this.following.set(s.following), error: () => {} });
  }

  toggle() {
    this.busy.set(true);
    const wasFollowing = this.following();
    const call: Observable<unknown> = wasFollowing ? this.follows.unfollow(this.user.id) : this.follows.follow(this.user.id);
    call.subscribe({
      next: () => {
        this.following.update(v => !v);
        this.busy.set(false);
        if (!wasFollowing) {
          const me = this.auth.user();
          if (me && me.id !== this.user.id) {
            this.notifs.notifyFollow(
              this.user.id,
              me.firstName + ' ' + me.lastName, me.username, me.profileImage
            );
          }
        }
      },
      error: () => this.busy.set(false)
    });
  }
}
