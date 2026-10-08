import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ShellComponent } from './shared/shell.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './profile/edit-profile.component';
import { SearchComponent } from './users/search.component';
import { FollowListComponent } from './followers/follow-list.component';
import { ComposeComponent } from './tweet/compose.component';
import { TweetDetailComponent } from './tweet/tweet-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: '', component: ShellComponent, canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/:username', component: ProfileComponent },
      { path: 'edit-profile', component: EditProfileComponent },
      { path: 'search', component: SearchComponent },
      { path: 'tweet', component: ComposeComponent },
      { path: 'tweet/:id', component: TweetDetailComponent },
      { path: 'followers', component: FollowListComponent, data: { mode: 'followers' } },
      { path: 'followers/:id', component: FollowListComponent, data: { mode: 'followers' } },
      { path: 'following', component: FollowListComponent, data: { mode: 'following' } },
      { path: 'following/:id', component: FollowListComponent, data: { mode: 'following' } },
      { path: '', pathMatch: 'full', redirectTo: 'home' }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
