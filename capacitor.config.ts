import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.egocore.app',
  appName: 'EgoCore',
  webDir: 'www',
  server: {
    url: 'https://egocore.ai/',
    cleartext: false,
    androidScheme: 'https',
    allowNavigation: [
      'egocore.ai',
      '*.egocore.ai',
    ],
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0B0B0F',
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: '#0B0B0F',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0B0B0F',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B0B0F',
      overlaysWebView: false,
    },
  },
};

export default config;
