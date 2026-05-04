import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/feed', pathMatch: 'full' },

  // Guest-only routes
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },

  // Authenticated routes
  {
    path: 'feed',
    loadComponent: () => import('./components/feed/feed.component').then(m => m.FeedComponent),
    canActivate: [authGuard]
  },
  {
    path: 'explore',
    loadComponent: () => import('./components/explore/explore.component').then(m => m.ExploreComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts/new',
    loadComponent: () => import('./components/create-post/create-post.component').then(m => m.CreatePostComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts/:id/edit',
    loadComponent: () => import('./components/create-post/create-post.component').then(m => m.CreatePostComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts/:id',
    loadComponent: () => import('./components/post-detail/post-detail.component').then(m => m.PostDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard]
  },

  // Admin routes
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },

  // 404 route
    {
      path: '404',
      loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
    },

  { path: '**', redirectTo: '/404' }
];
