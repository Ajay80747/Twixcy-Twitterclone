import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../core/services/user.service';
import { errorMessage } from '../core/error.util';
import { AvatarComponent } from '../shared/avatar.component';

@Component({
  selector: 'app-edit-profile', standalone: true, imports: [FormsModule, RouterLink, AvatarComponent],
  styles: [`
    .preview-banner {
      height: 200px; border-radius: 16px; margin-bottom: 14px;
      background: linear-gradient(135deg, var(--banner1) 0%, var(--banner2) 40%, var(--banner3) 100%);
      position: relative; overflow: hidden;
      border: 1px solid var(--border);
      cursor: pointer;
      transition: filter .15s, transform .15s;
    }
    .preview-banner:hover { filter: brightness(1.06); }
    .preview-banner img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .preview-banner::after {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse at 70% 50%, rgba(29,155,240,.25) 0%, transparent 60%),
        linear-gradient(to bottom, transparent 60%, rgba(0,0,0,.45) 100%);
      pointer-events: none;
    }
    .preview-banner:hover .banner-edit-hint { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    .banner-edit-hint {
      position: absolute; left: 50%; top: 50%;
      transform: translate(-50%, -46%) scale(.96);
      display: inline-flex; flex-direction: column; align-items: center; gap: 6px;
      color: white; font-weight: 700; font-size: .92rem; opacity: .85;
      padding: 12px 22px; border-radius: 14px;
      background: rgba(0,0,0,.38); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,.18);
      transition: opacity .2s, transform .2s;
      pointer-events: none;
      white-space: nowrap;
    }
    .upload-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .profile-preview {
      width: 88px; height: 88px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1d9bf0 0%, #7dd3fc 100%);
      overflow: hidden; border: 3px solid var(--bg);
      cursor: pointer; position: relative;
      transition: filter .15s;
    }
    .profile-preview:hover { filter: brightness(1.08); }
    .profile-preview:hover .avatar-edit-hint { opacity: 1; }
    .profile-preview img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-edit-hint {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,.5);
      color: white; opacity: 0; transition: opacity .15s;
      border-radius: 50%;
    }
    .file-btn {
      display: inline-flex; align-items: center; gap: 8px;
      border: 1.5px solid var(--border); color: var(--text);
      border-radius: 999px; padding: 8px 16px;
      font-weight: 700; background: transparent; cursor: pointer;
      transition: background .15s, border-color .15s;
      font-size: .9rem;
    }
    .file-btn:hover:not(:disabled) { background: var(--hover); border-color: var(--text2); }
    .file-btn:disabled { opacity: .38; cursor: not-allowed; }
    .remove-btn {
      background: transparent; color: #f4212e; border: none;
      font-weight: 700; font-size: .88rem; cursor: pointer; padding: 6px 10px;
      border-radius: 6px; transition: background .15s;
    }
    .remove-btn:hover { background: rgba(244,33,46,.12); }
    .mini-spinner {
      width: 14px; height: 14px; border: 2px solid var(--border);
      border-top-color: var(--blue); border-radius: 50%;
      animation: spin .6s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .field-hint { font-size: .8rem; color: var(--text3); margin-top: 4px; }
  `],
  template: `
  <header class="page-head">
    <button class="btn-icon" (click)="router.navigate(['/profile'])" aria-label="Back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="20" height="20">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
    </button>
    <h1 style="font-size:1.2rem">Edit profile</h1>
    <div style="margin-left:auto">
      <button class="btn btn-sm" (click)="save()" [disabled]="busy()">
        @if (busy()) { <span class="spinner" style="width:12px;height:12px;border-width:2px"></span> }
        @else { Save }
      </button>
    </div>
  </header>

  <div class="form-card">
    <!-- Banner preview + upload -->
    <label style="margin-bottom:8px">Cover photo</label>
    <div class="preview-banner" (click)="pickBanner.click()" role="button"
         [attr.aria-label]="banner() ? 'Click to change cover photo' : 'Click to upload cover photo'" tabindex="0">
      @if (banner()) { <img [src]="banner()" alt="Banner preview"> }
      <div class="banner-edit-hint">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <span>{{ banner() ? 'Change cover photo' : 'Add a cover photo' }}</span>
      </div>
    </div>
    <div class="upload-row">
      <button class="file-btn" type="button" [disabled]="uploadingBanner()" (click)="$event.stopPropagation(); pickBanner.click()">
        @if (uploadingBanner()) { <span class="mini-spinner"></span> Uploading… }
        @else {
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {{ banner() ? 'Change cover' : 'Upload cover' }}
        }
      </button>
      <input type="file" #pickBanner hidden accept="image/*" (change)="onBannerFile($event)">
      @if (banner()) { <button class="remove-btn" type="button" (click)="removeBanner()">Remove</button> }
      <span class="field-hint">JPG, PNG, WEBP or GIF. Up to 5 MB. Landscape images look best.</span>
    </div>

    <!-- Profile image + upload -->
    <div class="upload-row">
      <div class="profile-preview" (click)="pickPic.click()" role="button"
           [attr.aria-label]="profileImage() ? 'Click to change profile photo' : 'Click to upload profile photo'" tabindex="0">
        @if (profileImage()) {
          <img [src]="profileImage()" alt="Profile preview">
        } @else {
          <app-avatar [name]="m.firstName + ' ' + m.lastName" [size]="82" style="border-radius:50%"/>
        }
        <div class="avatar-edit-hint" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
      </div>
      <div>
        <button class="file-btn" type="button" [disabled]="uploadingPic()" (click)="$event.stopPropagation(); pickPic.click()">
          @if (uploadingPic()) { <span class="mini-spinner"></span> Uploading… }
          @else {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ profileImage() ? 'Change photo' : 'Upload photo' }}
          }
        </button>
        <input type="file" #pickPic hidden accept="image/*" (change)="onPicFile($event)">
        @if (profileImage()) {
          <button class="remove-btn" type="button" style="margin-left:8px" (click)="removePic()">Remove</button>
        }
        <p class="field-hint" style="margin:4px 0 0">Square images work best as profile pictures.</p>
      </div>
    </div>

    <div class="two">
      <label>First name<input name="firstName" [(ngModel)]="m.firstName" required maxlength="50"></label>
      <label>Last name<input name="lastName" [(ngModel)]="m.lastName" required maxlength="50"></label>
    </div>
    <label>Bio ({{ 160 - (m.bio?.length ?? 0) }} left)
      <textarea name="bio" [(ngModel)]="m.bio" maxlength="160" rows="3"
                placeholder="Tell people a little about yourself…"></textarea>
    </label>

    @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
    <div class="row-end">
      <a class="btn btn-ghost" routerLink="/profile">Cancel</a>
      <button class="btn" type="button" (click)="save()" [disabled]="busy()">
        @if (busy()) { <span class="spinner" style="width:12px;height:12px;border-width:2px"></span> }
        @else { Save changes }
      </button>
    </div>
  </div>`
})
export class EditProfileComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly users = inject(UserService);
  readonly router = inject(Router);

  m = { firstName: '', lastName: '', bio: '' as string | '' | null };
  profileImage = signal<string>('');
  banner = signal<string>('');
  error = signal('');
  busy = signal(false);
  uploadingPic = signal(false);
  uploadingBanner = signal(false);

  ngOnInit() {
    this.users.me().subscribe(u => {
      this.m = { firstName: u.firstName, lastName: u.lastName, bio: u.bio ?? '' };
      this.profileImage.set(u.profileImage ?? '');
      this.banner.set(u.bannerImage ?? '');
    });
  }

  onPicFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploadingPic.set(true);
    this.error.set('');
    this.users.uploadProfileImage(file).subscribe({
      next: r => { this.profileImage.set(r.url); this.uploadingPic.set(false); },
      error: err => { this.error.set(errorMessage(err)); this.uploadingPic.set(false); }
    });
  }

  onBannerFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploadingBanner.set(true);
    this.error.set('');
    this.users.uploadBannerImage(file).subscribe({
      next: r => { this.banner.set(r.url); this.uploadingBanner.set(false); },
      error: err => { this.error.set(errorMessage(err)); this.uploadingBanner.set(false); }
    });
  }

  removePic() { this.profileImage.set(''); }
  removeBanner() { this.banner.set(''); }

  save() {
    const me = this.auth.user();
    if (!me) { this.error.set('You must be logged in.'); return; }
    if (!this.m.firstName.trim() || !this.m.lastName.trim()) {
      this.error.set('First and last name are required.'); return;
    }
    this.busy.set(true); this.error.set('');
    this.users.update(me.id, {
      firstName: this.m.firstName.trim(),
      lastName: this.m.lastName.trim(),
      bio: this.m.bio?.trim() ?? null,
      profileImage: this.profileImage() || null,
      bannerImage: this.banner() || null,
    }).subscribe({
      next: u => {
        this.auth.setUser({ ...me, ...u });
        this.router.navigate(['/profile']);
      },
      error: e => { this.error.set(errorMessage(e)); this.busy.set(false); }
    });
  }
}
