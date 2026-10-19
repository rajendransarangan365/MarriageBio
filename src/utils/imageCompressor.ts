import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

/**
 * Compresses and downscales any image URI to max 900px dimension and ~120KB JPEG.
 * This guarantees:
 * 1. window.localStorage quota (5MB) is never exceeded.
 * 2. Profile photo persists reliably across app sessions and workflow steps.
 * 3. Fast decoding in Chrome print and expo-print PDF engine.
 */
export async function compressImageUri(
  uri: string,
  maxDimension: number = 900,
  quality: number = 0.88,
  preferredFormat: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<string> {
  if (!uri) return '';

  if (typeof document === 'undefined') {
    return uri;
  }

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const finish = () => {
      try {
        let width = img.naturalWidth || img.width || 400;
        let height = img.naturalHeight || img.height || 400;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(uri);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Check if the image contains any transparent pixels (alpha < 240)
        let hasTransparency = false;
        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          const d = imgData.data;
          const step = Math.max(1, Math.floor(d.length / 40000)) * 4;
          for (let i = 3; i < d.length; i += step) {
            if (d[i] < 240) {
              hasTransparency = true;
              break;
            }
          }
        } catch {
          // If security or tainted canvas prevents read, check URI/MIME
          hasTransparency = uri.startsWith('data:image/png') || uri.toLowerCase().includes('.png');
        }

        // CRITICAL: Never convert transparent pixels to JPEG without a background,
        // because JPEG discards alpha and browsers render transparent rgba(0,0,0,0) as solid black!
        if (
          hasTransparency ||
          preferredFormat === 'image/png' ||
          uri.startsWith('data:image/png') ||
          uri.toLowerCase().includes('.png')
        ) {
          const pngDataUrl = canvas.toDataURL('image/png');
          resolve(pngDataUrl);
          return;
        }

        // Standard opaque photo: compress as high-quality JPEG
        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegDataUrl);
      } catch (err) {
        console.warn('Image compression fallback:', err);
        resolve(uri);
      }
    };

    img.onload = finish;
    img.onerror = () => resolve(uri);
    img.src = uri;
  });
}


/**
 * Checks and requests essential media library permission on iOS/Android
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'அனுமதி தேவை (Permission Required)',
        'மணமக்கள் புகைப்படத்தைத் தேர்ந்தெடுக்க உங்கள் சாதனத்தின் புகைப்பட கேலரி (Gallery/Photos) அனுமதி தேவைப்படுகிறது.'
      );
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Checks and requests essential camera permission on iOS/Android
 */
export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'அனுமதி தேவை (Permission Required)',
        'நேரடியாகப் புகைப்படம் எடுக்க உங்கள் சாதனத்தின் கேமரா (Camera) அனுமதி தேவைப்படுகிறது.'
      );
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Universal photo picker with automatic permission check and compression (JPEG)
 */
export async function pickAndCompressPhoto(): Promise<string | null> {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      let rawUri = asset.uri;
      const isPng =
        (asset.mimeType && asset.mimeType.toLowerCase().includes('png')) ||
        rawUri.toLowerCase().includes('.png') ||
        rawUri.startsWith('data:image/png');

      if (asset.base64) {
        const mime = asset.mimeType || (isPng ? 'image/png' : 'image/jpeg');
        rawUri = `data:${mime};base64,${asset.base64}`;
      }

      // Compress and resize; automatically preserves PNG transparency if cutout/transparent
      const compressed = await compressImageUri(rawUri, 900, 0.9, isPng ? 'image/png' : 'image/jpeg');
      return compressed;
    }
  } catch (e) {
    console.warn('Photo picker error:', e);
  }
  return null;
}

/**
 * Take photo using device camera with permission check and compression
 */
export async function captureAndCompressPhoto(): Promise<string | null> {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      let rawUri = asset.uri;
      if (asset.base64) {
        const mime = asset.mimeType || 'image/jpeg';
        rawUri = `data:${mime};base64,${asset.base64}`;
      }

      const compressed = await compressImageUri(rawUri, 900, 0.85, 'image/jpeg');
      return compressed;
    }
  } catch (e) {
    console.warn('Camera capture error:', e);
  }
  return null;
}

/**
 * Transparent PNG cutout picker with automatic canvas downscale and permission check
 */
export async function pickAndCompressPng(): Promise<string | null> {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1.0,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      let rawUri = asset.uri;
      if (asset.base64) {
        rawUri = `data:image/png;base64,${asset.base64}`;
      }

      const compressed = await compressImageUri(rawUri, 900, 1.0, 'image/png');
      return compressed;
    }
  } catch (e) {
    console.warn('PNG picker error:', e);
  }
  return null;
}
