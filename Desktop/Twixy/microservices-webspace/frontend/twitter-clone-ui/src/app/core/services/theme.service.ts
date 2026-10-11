import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'dark' | 'light';
const STORAGE_KEY = 'twixcy.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.readInitial());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.body.setAttribute('data-theme', t);
      try { localStorage.setItem(STORAGE_KEY, t); } catch {}
      document.documentElement.style.colorScheme = t;
    });
  }

  toggle() {
    this.theme.update(t => (t === 'dark' ? 'light' : 'dark'));
  }

  set(t: Theme) {
    this.theme.set(t);
  }

  private readInitial(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    const prefersLight =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }
}
