import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular'

export const THEME_KEY = 'selectedTheme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public darkMode: boolean;

  constructor(private platform: Platform, public storage: Storage) {
    this.platform.ready().then(() => {
      
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      
      this.storage.get(THEME_KEY).then( (darkMode) => {
        this.darkMode = darkMode || prefersDark.matches;
        this.setAppTheme(this.darkMode);
      });
      
      prefersDark.addListener(e => {
        this.storage.set(THEME_KEY, e.matches);
        this.setAppTheme(e.matches);
      });

    });
  }

  getCurrentDarkMode() {
    return this.darkMode;
  }

  setAppTheme(darkMode: boolean) {
    darkMode ? document.body.classList.add('dark') : document.body.classList.remove('dark');
    this.storage.set(THEME_KEY, darkMode);
  }

}
