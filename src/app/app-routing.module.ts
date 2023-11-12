import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { map } from 'rxjs/operators';

const redirectAuthorizedToMain = () => redirectLoggedInTo(['main']);
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth/signin']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule),
    // ...canActivate()
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthModule),
    ...canActivate(redirectAuthorizedToMain)
  },
  {
    path: 'main',
    loadChildren: () => import('./program/main/main.module').then( m => m.MainPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'menu',
    loadChildren: () => import('./shared/components/menu/menu.module').then( m => m.MenuPageModule)
  },
  {
    path: 'routes',
    loadChildren: () => import('./information/routes/routes.module').then( m => m.RoutesPageModule)
  },
  {
    path: 'support',
    loadChildren: () => import('./support/bus/bus.module').then( m => m.BusPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./contact-us/contact-us.module').then( m => m.ContactUsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
