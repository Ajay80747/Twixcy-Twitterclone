import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, of, switchMap, catchError } from 'rxjs';
import { UserService } from '../core/services/user.service';
import { User } from '../core/models/models';
import { IconComponent } from '../shared/icon.component';
import { UserRowComponent } from '../shared/user-row.component';

@Component({
  selector: 'app-search', standalone: true, imports: [FormsModule, IconComponent, UserRowComponent],
  template: `
  <header class="page-head"><h1>Search</h1></header>
  <div class="search-box"><app-icon name="search" /><input type="search" [ngModel]="keyword" (ngModelChange)="onType($event)" placeholder="Search people by name or username" aria-label="Search users"></div>
  @for (u of results(); track u.id) { <app-user-row [user]="u" /> }
  @empty { <p class="empty">{{ searched() ? 'No people match that search.' : 'Type to find people on TWIXCY.' }}</p> }`
})
export class SearchComponent implements OnDestroy {
  private users = inject(UserService);
  private input$ = new Subject<string>();
  keyword = '';
  results = signal<User[]>([]);
  searched = signal(false);
  private sub: Subscription = this.input$.pipe(
    debounceTime(300), distinctUntilChanged(),
    switchMap(k => { this.searched.set(k.trim().length > 0); return k.trim() ? this.users.search(k.trim()).pipe(catchError(() => of([]))) : of([]); })
  ).subscribe(r => this.results.set(r));

  onType(value: string) { this.keyword = value; this.input$.next(value); }
  ngOnDestroy() { this.sub.unsubscribe(); }
}
