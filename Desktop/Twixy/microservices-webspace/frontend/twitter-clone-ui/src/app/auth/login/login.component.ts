import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { errorMessage } from '../../core/error.util';

@Component({
  selector: 'app-login', standalone: true, imports: [FormsModule, RouterLink],
  template: `
  <div class="auth">
    <!-- Left art panel -->
    <section class="auth-art" aria-hidden="true">
      <div class="auth-dots"></div>
      <div class="auth-logo">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <path d="M6 6L22 22M22 22L38 6M22 22L6 38M22 22L38 38"
                stroke="white" stroke-width="5" stroke-linecap="round"/>
        </svg>
      </div>
      <h1>Say it in&nbsp;280.</h1>
      <p>Short posts from people you actually want to hear from.</p>
    </section>

    <!-- Right form panel -->
    <section class="auth-form">
      <form id="login-form" #f="ngForm" (ngSubmit)="submit(f.valid)" novalidate>
        <h2>Welcome back</h2>
        <p class="auth-subtitle">Sign in to your TWIXCY account.</p>

        <label>
          Email address
          <input id="login-email" type="email" name="email" [(ngModel)]="email"
                 required email placeholder="you@example.com" autocomplete="email">
        </label>

        <label>
          Password
          <input id="login-password" type="password" name="password" [(ngModel)]="password"
                 required placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                 autocomplete="current-password">
        </label>

        @if (error()) {
          <p class="error" role="alert" id="login-error">&#9888; {{ error() }}</p>
        }

        <button id="login-submit" class="btn btn-blue btn-lg" type="submit" [disabled]="busy()">
          @if (busy()) { <span class="spinner"></span>&nbsp;Signing in… }
          @else { Sign in }
        </button>

        <p class="auth-footer">
          New to TWIXCY?&nbsp;<a routerLink="/register">Create an account</a>
        </p>
      </form>
    </section>
  </div>`
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = '';
  error = signal(''); busy = signal(false);

  submit(valid: boolean | null) {
    if (!valid) { this.error.set('Please enter a valid email and password.'); return; }
    this.busy.set(true); this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: e => { this.error.set(errorMessage(e)); this.busy.set(false); }
    });
  }
}
