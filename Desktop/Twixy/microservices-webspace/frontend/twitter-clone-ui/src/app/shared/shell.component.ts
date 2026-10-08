import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AvatarComponent } from './avatar.component';
import { SuggestionsComponent } from './suggestions.component';
import { NotificationsComponent } from './notifications.component';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-shell', standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AvatarComponent, SuggestionsComponent, NotificationsComponent],
  template: `
  <div class="layout">
    <!-- ── Left sidebar ── -->
    <aside class="rail">
      <!-- Logo -->
      <a class="brand" routerLink="/home" aria-label="TWIXCY home" title="Home">
        <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
          <path d="M6 6L22 22M22 22L38 6M22 22L6 38M22 22L38 38"
                stroke="#1d9bf0" stroke-width="5" stroke-linecap="round"/>
        </svg>
        <span class="brand-text">TWIXCY</span>
      </a>

      <!-- Nav links -->
      <nav class="nav" aria-label="Main navigation">
        <a routerLink="/home" routerLinkActive="active" id="nav-home">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.1L1 11h3v11h6v-7h4v7h6V11h3L12 2.1z"/>
          </svg>
          <span>Home</span>
        </a>
        <a routerLink="/search" routerLinkActive="active" id="nav-search">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>Search</span>
        </a>
        <!-- Notifications bell in nav -->
        <div class="nav-notif-row" id="nav-notifications">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span>Notifications</span>
          <app-notifications/>
        </div>
        <a routerLink="/followers" routerLinkActive="active" id="nav-followers">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Followers</span>
        </a>
        <a routerLink="/following" routerLinkActive="active" id="nav-following">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>Following</span>
        </a>
        <a routerLink="/profile" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" id="nav-profile">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Profile</span>
        </a>
        <button type="button" class="nav-btn" id="nav-theme" (click)="theme.toggle()"
                [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
                [title]="theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
          @if (theme.theme() === 'dark') {
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          } @else {
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          }
          <span>{{ theme.theme() === 'dark' ? 'Light mode' : 'Dark mode' }}</span>
        </button>
        <button type="button" class="nav-btn" id="nav-logout" (click)="auth.logout()">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Log out</span>
        </button>
      </nav>

      <!-- Post button -->
      <a class="post-btn" routerLink="/tweet" id="post-btn" aria-label="New post">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Post</span>
      </a>

      <!-- Me chip -->
      @if (auth.user(); as me) {
        <a class="me-chip" routerLink="/profile" id="me-chip" title="Your profile">
          <app-avatar [name]="me.firstName + ' ' + me.lastName"
                      [src]="me.profileImage" [size]="40"/>
          <div class="who-text">
            <strong>{{ me.firstName }} {{ me.lastName }}</strong>
            <span class="muted small">&#64;{{ me.username }}</span>
          </div>
          <svg class="me-more" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="19" cy="12" r="2"/>
          </svg>
        </a>
      }
    </aside>

    <!-- ── Feed / main ── -->
    <main class="feed"><router-outlet/></main>

    <!-- ── Right sidebar ── -->
    <aside class="side"><app-suggestions/></aside>
  </div>`
})
export class ShellComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
}
