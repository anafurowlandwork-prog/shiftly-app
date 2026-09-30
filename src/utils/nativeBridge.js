import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = Capacitor.isNativePlatform();

/**
 * Triggers native physical vibration feedback on physical devices
 */
export async function triggerHaptic(type = 'light') {
  try {
    if (!isNativePlatform && !('vibrate' in navigator)) return;

    if (type === 'light') {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (type === 'medium') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (type === 'heavy') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else if (type === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (type === 'error') {
      await Haptics.notification({ type: NotificationType.Error });
    }
  } catch (err) {
    // Graceful fallback for non-supported browsers
    if ('vibrate' in navigator) {
      navigator.vibrate(type === 'heavy' ? 40 : 15);
    }
  }
}

/**
 * Retrieves precise GPS device location
 */
export async function getDeviceLocation() {
  try {
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });
    return {
      lat: coordinates.coords.latitude,
      lng: coordinates.coords.longitude
    };
  } catch (err) {
    console.warn('Geolocation fallback used:', err);
    return { lat: 42.352, lng: -71.058 }; // Boston default
  }
}

/**
 * Captures live room or cargo photo via device camera
 */
export async function captureLivePhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    return image.webPath;
  } catch (err) {
    console.warn('Camera capture cancelled or failed:', err);
    return null;
  }
}

/**
 * Configures the native iOS & Android top status bar
 */
export async function configureStatusBar(isDark = false) {
  try {
    if (!isNativePlatform) return;
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: isDark ? '#09090b' : '#ffffff' });
    }
  } catch (err) {
    // Ignore
  }
}

/**
 * Hides native splash screen once React boots
 */
export async function hideSplashScreen() {
  try {
    if (!isNativePlatform) return;
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (err) {
    // Ignore
  }
}
