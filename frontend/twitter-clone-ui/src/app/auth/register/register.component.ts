import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { errorMessage } from '../../core/error.util';

@Component({
  selector: 'app-register', standalone: true, imports: [FormsModule, RouterLink],
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
      <h1>Join the conversation today.</h1>
      <p>Share your thoughts in 280 characters or less.</p>
    </section>

    <!-- Right form panel -->
    <section class="auth-form">
      <form id="register-form" #f="ngForm" (ngSubmit)="submit(f.valid)" novalidate>
        <h2>Create your account</h2>
        <p class="auth-subtitle">It's free and only takes a minute.</p>

        <div class="two">
          <label>
            First name
            <input id="reg-firstname" name="firstName" [(ngModel)]="m.firstName"
                   required maxlength="50" placeholder="Jane">
          </label>
          <label>
            Last name
            <input id="reg-lastname" name="lastName" [(ngModel)]="m.lastName"
                   required maxlength="50" placeholder="Doe">
          </label>
        </div>

        <label>
          Username
          <input id="reg-username" name="username" [(ngModel)]="m.username"
                 required minlength="3" maxlength="30"
                 pattern="[A-Za-z0-9_]+" placeholder="janedoe_123"
                 autocomplete="username">
        </label>

        <label>
          Email address
          <input id="reg-email" type="email" name="email" [(ngModel)]="m.email"
                 required email placeholder="jane@example.com" autocomplete="email">
        </label>

        <label>
          Password&nbsp;<span class="muted small">(min. 6 characters)</span>
          <input id="reg-password" type="password" name="password" [(ngModel)]="m.password"
                 required minlength="6" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                 autocomplete="new-password">
        </label>

        @if (error()) {
          <p class="error" role="alert" id="reg-error">&#9888; {{ error() }}</p>
        }

        <button id="reg-submit" class="btn btn-blue btn-lg" type="submit" [disabled]="busy()">
          @if (busy()) { <span class="spinner"></span>&nbsp;Creating account… }
          @else { Create account }
        </button>

        <p class="auth-footer">
          Already have an account?&nbsp;<a routerLink="/login">Sign in</a>
        </p>
      </form>
    </section>
  </div>`
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  m = { firstName: '', lastName: '', username: '', email: '', password: '' };
  error = signal(''); busy = signal(false);

  submit(valid: boolean | null) {
    if (!valid) {
      this.error.set('Please fill in all fields correctly. Username: letters, digits & underscores only.');
      return;
    }
    this.busy.set(true); this.error.set('');
    this.auth.register(this.m).subscribe({
      next: () => this.auth.login(this.m.email, this.m.password).subscribe({
        next: () => this.router.navigate(['/home']),
        error: () => this.router.navigate(['/login'])
      }),
      error: e => { this.error.set(errorMessage(e)); this.busy.set(false); }
    });
  }
}
