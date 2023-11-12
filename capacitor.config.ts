import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'driver',
  webDir: 'www',
  bundledWebRuntime: false,
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      'android-minSdkVersion': '22',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000',
      WKWebViewOnly: 'true',
      AndroidPersistentFileLocation: 'Compatibility',
      'android-targetSdkVersion': '30',
      hostname: 'localhost',
      AndroidInsecureFileModeEnabled: 'true'
    }
  }
};

export default config;
