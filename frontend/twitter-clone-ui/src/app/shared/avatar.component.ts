import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar', standalone: true,
  template: `@if (src) {
      <img class="avatar" [src]="src" [alt]="name" [style.width.px]="size" [style.height.px]="size" (error)="src = null">
    } @else {
      <span class="avatar" [style.width.px]="size" [style.height.px]="size" [style.font-size.px]="size * 0.4" [style.background]="color">{{ initials }}</span>
    }`
})
export class AvatarComponent {
  @Input() name = '';
  @Input() src?: string | null;
  @Input() size = 44;
  get initials() { return this.name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?'; }
  get color() {
    let h = 0;
    for (const c of this.name) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `hsl(${h} 45% 38%)`;
  }
}
