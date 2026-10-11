import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TweetComposerComponent } from './tweet-composer.component';

@Component({
  selector: 'app-compose', standalone: true, imports: [TweetComposerComponent],
  template: `<header class="page-head"><h1>New post</h1></header><app-tweet-composer (posted)="router.navigate(['/home'])" />`
})
export class ComposeComponent { router = inject(Router); }
