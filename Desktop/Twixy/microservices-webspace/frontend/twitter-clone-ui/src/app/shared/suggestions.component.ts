import { Component, OnInit, inject, signal } from '@angular/core';
import { UserService } from '../core/services/user.service';
import { User } from '../core/models/models';
import { UserRowComponent } from './user-row.component';

@Component({
  selector: 'app-suggestions', standalone: true, imports: [UserRowComponent],
  template: `
    <!-- Search bar -->
    <div class="side-search">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input id="side-search" type="search" placeholder="Search TWIXCY" aria-label="Search">
    </div>

    <!-- Who to follow -->
    <section class="panel" aria-labelledby="wtf-heading">
      <h3 class="panel-title" id="wtf-heading">Who to follow</h3>
      @for (u of users(); track u.id) {
        <app-user-row [user]="u"/>
      }
      @empty {
        <p class="muted small" style="padding:8px 0">
          No suggestions yet. Come back soon!
        </p>
      }
    </section>

    <!-- Trending -->
    <section class="panel" aria-labelledby="trends-heading">
      <h3 class="panel-title" id="trends-heading">Trending</h3>

      <div class="panel-item">
        <div>
          <p class="panel-tag">Technology · Trending</p>
          <strong>#SpringBoot</strong>
          <p class="panel-val">4,821 posts</p>
        </div>
      </div>
      <div class="panel-item">
        <div>
          <p class="panel-tag">Engineering · Trending</p>
          <strong>#Microservices</strong>
          <p class="panel-val">2,340 posts</p>
        </div>
      </div>
      <div class="panel-item">
        <div>
          <p class="panel-tag">Frontend</p>
          <strong>#Angular19</strong>
          <p class="panel-val">1,057 posts</p>
        </div>
      </div>
      <div class="panel-item">
        <div>
          <p class="panel-tag">Data</p>
          <strong>#MySQL</strong>
          <p class="panel-val">987 posts</p>
        </div>
      </div>
    </section>

    <!-- Footer links -->
    <p style="font-size:.78rem;color:var(--text3);padding:0 4px;line-height:1.8;">
      Terms &nbsp;·&nbsp; Privacy &nbsp;·&nbsp; Cookies &nbsp;·&nbsp;
      Accessibility &nbsp;·&nbsp; Ads info<br>
      &copy; 2026 TWIXCY · Built with &#9829;
    </p>`
})
export class SuggestionsComponent implements OnInit {
  private users$ = inject(UserService);
  users = signal<User[]>([]);
  ngOnInit() {
    this.users$.suggestions().subscribe({ next: u => this.users.set(u), error: () => {} });
  }
}
