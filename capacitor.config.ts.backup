import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dailymood.app',
  appName: 'DailyMood AI',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    url: 'https://project-iota-gray.vercel.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#8B5CF6',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark'
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    buildOptions: {
      keystorePath: 'android-release-key.keystore',
      keystoreAlias: 'dailymood',
    }
  }
};

export default config;

