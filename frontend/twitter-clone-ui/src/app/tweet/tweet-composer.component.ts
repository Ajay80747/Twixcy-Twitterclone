import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { TweetService } from '../core/services/tweet.service';
import { TweetStateService } from '../core/services/tweet-state.service';
import { Tweet } from '../core/models/models';
import { errorMessage } from '../core/error.util';
import { AvatarComponent } from '../shared/avatar.component';

const MAX_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

@Component({
  selector: 'app-tweet-composer', standalone: true, imports: [FormsModule, AvatarComponent],
  styles: [`
    .preview-wrap {
      position: relative; margin: 8px 0;
      border-radius: 12px; overflow: hidden;
      border: 1px solid var(--border);
      max-height: 300px;
    }
    .preview-wrap img {
      width: 100%; max-height: 300px; object-fit: cover;
      display: block;
    }
    .remove-img {
      position: absolute; top: 8px; right: 8px;
      background: rgba(0,0,0,.7); border: none; border-radius: 50%;
      width: 30px; height: 30px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 1rem; transition: background .15s;
    }
    .remove-img:hover { background: rgba(0,0,0,.9); }
    .upload-progress {
      height: 3px; background: var(--border); border-radius: 99px; margin: 4px 0;
    }
    .upload-progress-bar {
      height: 100%; background: var(--blue); border-radius: 99px;
      width: 100%; animation: pulse 1s ease infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; } 50% { opacity: .5; }
    }
    .char-ring {
      position: relative; width: 24px; height: 24px; flex-shrink: 0;
    }
    .char-ring svg { transform: rotate(-90deg); }
  `],
  template: `
  <section class="composer" id="tweet-composer">
    <!-- User avatar -->
    @if (auth.user(); as me) {
      <app-avatar [name]="me.firstName + ' ' + me.lastName" [src]="me.profileImage" [size]="44"/>
    }

    <div class="composer-main">
      <textarea id="tweet-content" [(ngModel)]="content" name="content"
                rows="3" placeholder="What's happening?!"
                aria-label="Compose post" maxlength="280"
                (input)="onInput()"></textarea>

      <!-- Image preview -->
      @if (previewUrl()) {
        <div class="preview-wrap">
          <img [src]="previewUrl()!" alt="Image preview" loading="lazy">
          <button type="button" class="remove-img" (click)="removeImage()" aria-label="Remove image" title="Remove image">
            ✕
          </button>
        </div>
      }

      <!-- Upload progress -->
      @if (uploading()) {
        <div class="upload-progress">
          <div class="upload-progress-bar"></div>
        </div>
        <p class="muted small" style="text-align:center;padding:2px 0">Uploading image…</p>
      }

      @if (error()) {
        <p class="error small" role="alert">&#9888; {{ error() }}</p>
      }

      <div class="composer-foot">
        <!-- Media / tools -->
        <div class="composer-tools">
          <!-- File picker (hidden) -->
          <input type="file" id="image-picker" accept="image/jpeg,image/png,image/webp,image/gif"
                 style="display:none" (change)="onFileSelected($event)">
          <!-- Image button -->
          <button type="button" class="btn-icon" (click)="triggerFilePicker()"
                  [disabled]="uploading() || !!previewUrl()"
                  title="Add image from computer" aria-label="Add image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
        </div>

        <!-- Character counter -->
        <span class="counter"
              [class.warn]="remaining <= 20 && remaining >= 0"
              [class.over]="remaining < 0">{{ remaining }}</span>

        <!-- Post button -->
        <button id="post-submit" class="btn btn-blue"
                [disabled]="!valid || busy()" (click)="post()">
          @if (busy()) { <span class="spinner"></span> }
          @else { Post }
        </button>
      </div>
    </div>
  </section>`
})
export class TweetComposerComponent {
  @Output() posted = new EventEmitter<Tweet>();
  auth     = inject(AuthService);
  private api   = inject(TweetService);
  private state = inject(TweetStateService);

  content   = '';
  imageUrl  = '';            // the URL returned by the upload endpoint
  previewUrl = signal<string | null>(null); // local blob URL for preview
  uploading  = signal(false);
  busy       = signal(false);
  error      = signal('');

  get remaining() { return 280 - this.content.length; }

  /** Valid if: (has text OR has uploaded image) AND within char limit */
  get valid() {
    const hasText  = this.content.trim().length > 0;
    const hasImage = !!this.imageUrl;
    return (hasText || hasImage) && this.remaining >= 0;
  }

  onInput() { this.error.set(''); }

  triggerFilePicker() {
    (document.getElementById('image-picker') as HTMLInputElement)?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    input.value = ''; // reset so same file can be re-selected

    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      this.error.set('Unsupported image format. Allowed: JPG, PNG, WEBP, GIF.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      this.error.set(`Image size is too large. Maximum allowed size is ${MAX_MB} MB.`);
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = e => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    this.uploading.set(true);
    this.error.set('');
    this.api.uploadImage(file).subscribe({
      next: res => {
        this.imageUrl = res.url;
        this.uploading.set(false);
      },
      error: e => {
        this.imageUrl = '';
        this.previewUrl.set(null);
        this.uploading.set(false);
        this.error.set(errorMessage(e));
      }
    });
  }

  removeImage() {
    this.imageUrl = '';
    this.previewUrl.set(null);
    this.error.set('');
  }

  post() {
    if (!this.valid || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api.create(this.content.trim() || '', this.imageUrl || undefined).subscribe({
      next: t => {
        this.state.upsert(t);
        this.content = '';
        this.imageUrl = '';
        this.previewUrl.set(null);
        this.busy.set(false);
        this.posted.emit(t);
      },
      error: e => {
        this.error.set(errorMessage(e));
        this.busy.set(false);
      }
    });
  }
}
