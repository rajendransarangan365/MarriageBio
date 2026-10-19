import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BiodataProfile } from '../../types/biodata';
import { pickAndCompressPhoto, pickAndCompressPng } from '../../utils/imageCompressor';

interface PhotoEditorProps {
  biodata: BiodataProfile;
  onChangeBiodata: <K extends keyof BiodataProfile>(key: K, value: BiodataProfile[K]) => void;
  isDarkMode?: boolean;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  biodata,
  onChangeBiodata,
  isDarkMode = false,
}) => {
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [sensitivity, setSensitivity] = useState(32);
  const [activeTab, setActiveTab] = useState<'transform' | 'cutout' | 'shape' | 'enhance'>('transform');
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);

  // Handle image upload from camera / gallery with automatic compression & PNG transparency preservation
  const pickImage = async () => {
    try {
      const uri = await pickAndCompressPhoto();
      if (uri) {
        onChangeBiodata('photoUri', uri);
        onChangeBiodata('photoOriginalUri', uri);
        onChangeBiodata('photoZoom', 1.0);
        onChangeBiodata('photoPositionX', 0);
        onChangeBiodata('photoPositionY', 0);
        onChangeBiodata('photoRotation', 0);

        // Auto-detect if user uploaded a transparent cutout PNG
        if (uri.startsWith('data:image/png')) {
          onChangeBiodata('photoCutoutEnabled', true);
          onChangeBiodata('photoBackground', 'transparent');
          onChangeBiodata('photoLayout', 'standing_cutout');
          onChangeBiodata('photoFrameBorder', 'none');
        } else {
          onChangeBiodata('photoCutoutEnabled', false);
        }
      }
    } catch (e: any) {
      console.warn('Image picker error:', e);
      Alert.alert('பிழை', 'புகைப்படத்தைத் தேர்ந்தெடுப்பதில் சிக்கல் ஏற்பட்டது.');
    }
  };

  // Upload transparent PNG cutout from remove.bg or Nero AI with auto-downscale
  const pickTransparentPng = async () => {
    try {
      const uri = await pickAndCompressPng();
      if (uri) {
        onChangeBiodata('photoUri', uri);
        onChangeBiodata('photoOriginalUri', uri);
        onChangeBiodata('photoCutoutEnabled', true);
        onChangeBiodata('photoBackground', 'transparent');
        onChangeBiodata('photoLayout', 'standing_cutout');
        onChangeBiodata('photoFrameBorder', 'none');
        onChangeBiodata('photoZoom', 1.0);
        onChangeBiodata('photoPositionX', 0);
        onChangeBiodata('photoPositionY', 0);
      }
    } catch (e: any) {
      console.warn('Image picker error:', e);
      Alert.alert('பிழை', 'PNG புகைப்படத்தைத் தேர்ந்தெடுப்பதில் சிக்கல் ஏற்பட்டது.');
    }
  };

  // Direct Interactive Pan & Pinch-to-Zoom Gestures
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const pinchStartDistRef = React.useRef<number | null>(null);
  const pinchStartZoomRef = React.useRef(1.0);

  // Global window pointer listeners so mouse drag continues smoothly even outside frame
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const onGlobalPointerMove = (e: MouseEvent | PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      onChangeBiodata('photoPositionX', Math.round(dragStartRef.current.startX + dx));
      onChangeBiodata('photoPositionY', Math.round(dragStartRef.current.startY + dy));
    };

    const onGlobalPointerUp = () => {
      if (isDragging) setIsDragging(false);
    };

    window.addEventListener('pointermove', onGlobalPointerMove);
    window.addEventListener('pointerup', onGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', onGlobalPointerMove);
      window.removeEventListener('pointerup', onGlobalPointerUp);
    };
  }, [isDragging]);

  const handlePointerDown = (e: any) => {
    if (!biodata.photoUri) return;
    if (e.preventDefault) e.preventDefault();
    if (e.target && typeof e.target.setPointerCapture === 'function' && e.pointerId != null) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {}
    }
    setIsDragging(true);
    const clientX = e.clientX ?? e.nativeEvent?.pageX ?? 0;
    const clientY = e.clientY ?? e.nativeEvent?.pageY ?? 0;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startX: biodata.photoPositionX || 0,
      startY: biodata.photoPositionY || 0,
    };
  };

  const handleTouchStart = (e: any) => {
    if (!biodata.photoUri) return;
    const touches = e.nativeEvent?.touches || [];
    if (touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: touches[0].pageX,
        y: touches[0].pageY,
        startX: biodata.photoPositionX || 0,
        startY: biodata.photoPositionY || 0,
      };
    } else if (touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        touches[0].pageX - touches[1].pageX,
        touches[0].pageY - touches[1].pageY
      );
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = biodata.photoZoom || 1.0;
    }
  };

  const handleTouchMove = (e: any) => {
    const touches = e.nativeEvent?.touches || [];
    if (touches.length === 1 && isDragging) {
      const dx = touches[0].pageX - dragStartRef.current.x;
      const dy = touches[0].pageY - dragStartRef.current.y;
      onChangeBiodata('photoPositionX', Math.round(dragStartRef.current.startX + dx));
      onChangeBiodata('photoPositionY', Math.round(dragStartRef.current.startY + dy));
    } else if (touches.length === 2 && pinchStartDistRef.current) {
      const dist = Math.hypot(
        touches[0].pageX - touches[1].pageX,
        touches[0].pageY - touches[1].pageY
      );
      const factor = dist / pinchStartDistRef.current;
      const nextZoom = Math.min(2.5, Math.max(0.4, Number((pinchStartZoomRef.current * factor).toFixed(2))));
      onChangeBiodata('photoZoom', nextZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    pinchStartDistRef.current = null;
  };

  const handleWheel = (e: any) => {
    if (!biodata.photoUri) return;
    if (e.preventDefault) e.preventDefault();
    const deltaY = e.deltaY ?? e.nativeEvent?.deltaY ?? 0;
    const delta = deltaY < 0 ? 0.08 : -0.08;
    const current = biodata.photoZoom || 1.0;
    const next = Math.min(2.5, Math.max(0.4, Number((current + delta).toFixed(2))));
    onChangeBiodata('photoZoom', next);
  };

  const removePhoto = () => {
    onChangeBiodata('photoUri', null);
    onChangeBiodata('photoOriginalUri', null);
    onChangeBiodata('photoCutoutEnabled', false);
  };

  /**
   * Convert any image URI (file://, blob:, content://) to a data URL
   * This fixes ERR_FILE_NOT_FOUND when canvas tries to load file:// URIs
   */
  const toDataUrl = async (uri: string): Promise<string> => {
    if (!uri) return '';
    if (uri.startsWith('data:')) return uri;
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      // Fallback: load into HTML Image element and draw to canvas
      return new Promise((resolve) => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
          resolve(uri);
          return;
        }
        const img = new (window as any).Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
              return;
            }
          } catch {}
          resolve(uri);
        };
        img.onerror = () => resolve(uri);
        img.src = uri;
      });
    }
  };

  // Smart background removal with Subject-Protection Mask and Skin-Tone Guard
  const handleRemoveBackground = async (customColor?: [number, number, number]) => {
    const srcToProcess = biodata.photoOriginalUri || biodata.photoUri;
    if (!srcToProcess) return;

    if (Platform.OS !== 'web') {
      Alert.alert(
        'தகவல்',
        'பின்னணி நீக்கும் வசதி இணையத்தில் (Web) உடனடியாக வேலை செய்யும். ஏற்கனவே பின்னணி நீக்கப்பட்ட PNG படத்தையும் பதிவேற்றலாம்.'
      );
      return;
    }

    setIsProcessingBg(true);
    try {
      const dataUrl = await toDataUrl(srcToProcess);
      const cutoutUri = await performSmartBgRemoval(dataUrl, sensitivity, customColor);
      onChangeBiodata('photoUri', cutoutUri);
      onChangeBiodata('photoCutoutEnabled', true);
      onChangeBiodata('photoBackground', 'transparent');
      onChangeBiodata('photoFrameBorder', 'none');
      onChangeBiodata('photoLayout', 'standing_cutout');
    } catch (err) {
      console.error('BG removal failed:', err);
      Alert.alert('பிழை', 'பின்னணியை நீக்குவதில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleRestoreOriginal = () => {
    if (biodata.photoOriginalUri) {
      onChangeBiodata('photoUri', biodata.photoOriginalUri);
      onChangeBiodata('photoCutoutEnabled', false);
    }
  };

  /**
   * Smart Subject-Protected Background Removal (Nero AI & Photoshop Inspired)
   * 
   * 1. Corner Sampling: Only samples the true outer background corners (top-left & top-right)
   *    rather than averaging candidate shoulders/bottom.
   * 2. Center Subject Protection: Creates an elliptical safe zone around the candidate's
   *    face, neck, and torso.
   * 3. Skin Tone Guard: Prevents human skin tones (RGB where R > G > B) from being keyed out.
   * 4. Edge Feathering: Soft alpha gradient along edges for seamless merging.
   */
  const performSmartBgRemoval = (
    imgDataUrl: string,
    tol: number,
    customColor?: [number, number, number]
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        resolve(imgDataUrl);
        return;
      }
      const img = new (window as any).Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(imgDataUrl); return; }

          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, w, h);
          const d = imgData.data;

          // 1. Determine background color reference(s)
          let bgColors: Array<[number, number, number]> = [];
          if (customColor) {
            bgColors.push(customColor);
          } else {
            // Sample top-left corner box (5x5 pixels)
            let tlR = 0, tlG = 0, tlB = 0, tlCnt = 0;
            const cornerSize = Math.max(3, Math.min(12, Math.floor(w * 0.04)));
            for (let y = 0; y < cornerSize; y++) {
              for (let x = 0; x < cornerSize; x++) {
                const idx = (y * w + x) * 4;
                tlR += d[idx]; tlG += d[idx + 1]; tlB += d[idx + 2];
                tlCnt++;
              }
            }
            if (tlCnt > 0) {
              bgColors.push([Math.round(tlR / tlCnt), Math.round(tlG / tlCnt), Math.round(tlB / tlCnt)]);
            }

            // Sample top-right corner box
            let trR = 0, trG = 0, trB = 0, trCnt = 0;
            for (let y = 0; y < cornerSize; y++) {
              for (let x = w - cornerSize; x < w; x++) {
                const idx = (y * w + x) * 4;
                trR += d[idx]; trG += d[idx + 1]; trB += d[idx + 2];
                trCnt++;
              }
            }
            if (trCnt > 0) {
              bgColors.push([Math.round(trR / trCnt), Math.round(trG / trCnt), Math.round(trB / trCnt)]);
            }
          }

          if (bgColors.length === 0) {
            bgColors.push([245, 245, 245]); // Fallback neutral background
          }

          // Tolerance distance
          const threshold = tol * 2.8;

          // Helper: distance to nearest sampled background color
          const minBgDist = (idx: number): number => {
            const r = d[idx], g = d[idx + 1], b = d[idx + 2];
            let minDist = Infinity;
            for (const [br, bg, bb] of bgColors) {
              const dist = Math.sqrt(
                (r - br) * (r - br) +
                (g - bg) * (g - bg) +
                (b - bb) * (b - bb)
              );
              if (dist < minDist) minDist = dist;
            }
            return minDist;
          };

          // Skin tone check
          const isSkinTone = (r: number, g: number, b: number): boolean => {
            return r > 75 && g > 45 && b > 25 && r > g && g >= b && (r - g) > 10;
          };

          // Center Subject Elliptical Protection Safe Zone
          // Face and chest are centered in portraits
          const cx = w * 0.50;
          const cy = h * 0.52;
          const rx = w * 0.32; // 64% horizontal width protected
          const ry = h * 0.42; // 84% vertical height protected

          const isInSubjectSafeZone = (x: number, y: number): boolean => {
            const dx = (x - cx) / rx;
            const dy = (y - cy) / ry;
            return (dx * dx + dy * dy) < 0.72; // Strict inside subject core
          };

          const visited = new Uint8Array(w * h);
          const toRemove = new Uint8Array(w * h);
          const queue: number[] = [];

          // Seed BFS from the outer border edges only
          for (let x = 0; x < w; x++) {
            // Top row
            const topIdx = x * 4;
            if (minBgDist(topIdx) < threshold) {
              queue.push(x);
              visited[x] = 1;
            }
            // Bottom row
            const botPixel = (h - 1) * w + x;
            const botIdx = botPixel * 4;
            if (minBgDist(botIdx) < threshold) {
              queue.push(botPixel);
              visited[botPixel] = 1;
            }
          }
          for (let y = 1; y < h - 1; y++) {
            // Left column
            const leftPixel = y * w;
            const leftIdx = leftPixel * 4;
            if (minBgDist(leftIdx) < threshold) {
              queue.push(leftPixel);
              visited[leftPixel] = 1;
            }
            // Right column
            const rightPixel = y * w + (w - 1);
            const rightIdx = rightPixel * 4;
            if (minBgDist(rightIdx) < threshold) {
              queue.push(rightPixel);
              visited[rightPixel] = 1;
            }
          }

          // BFS flood-fill from border
          let head = 0;
          while (head < queue.length) {
            const pixel = queue[head++];
            toRemove[pixel] = 1;

            const px = pixel % w;
            const py = Math.floor(pixel / w);

            const neighbors = [
              py > 0 ? pixel - w : -1,
              py < h - 1 ? pixel + w : -1,
              px > 0 ? pixel - 1 : -1,
              px < w - 1 ? pixel + 1 : -1,
            ];

            for (const np of neighbors) {
              if (np < 0 || visited[np]) continue;
              visited[np] = 1;

              const nx = np % w;
              const ny = Math.floor(np / w);

              // Don't invade into the protected subject center zone
              if (isInSubjectSafeZone(nx, ny)) {
                continue;
              }

              const nIdx = np * 4;
              const nr = d[nIdx], ng = d[nIdx + 1], nb = d[nIdx + 2];

              // Protect skin tones from flood fill
              if (isSkinTone(nr, ng, nb)) {
                continue;
              }

              if (minBgDist(nIdx) < threshold) {
                queue.push(np);
              }
            }
          }

          // Apply removal with soft feathering along edge
          const featherRadius = 2;
          for (let pixel = 0; pixel < w * h; pixel++) {
            if (toRemove[pixel]) {
              const idx = pixel * 4;
              const dist = minBgDist(idx);
              const ratio = dist / threshold;

              let nearEdge = false;
              const px = pixel % w;
              const py = Math.floor(pixel / w);

              for (let fy = -featherRadius; fy <= featherRadius && !nearEdge; fy++) {
                for (let fx = -featherRadius; fx <= featherRadius && !nearEdge; fx++) {
                  const nx = px + fx, ny = py + fy;
                  if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    const np = ny * w + nx;
                    if (!toRemove[np]) nearEdge = true;
                  }
                }
              }

              if (nearEdge && ratio > 0.45) {
                // Soft blended edge
                d[idx + 3] = Math.round(((ratio - 0.45) / 0.55) * 150);
              } else {
                d[idx + 3] = 0; // Transparent
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e: any) => reject(e);
      img.src = imgDataUrl;
    });
  };

  // Adjust zoom
  const updateZoom = (delta: number) => {
    const current = biodata.photoZoom || 1.0;
    const next = Math.min(2.5, Math.max(0.4, Number((current + delta).toFixed(2))));
    onChangeBiodata('photoZoom', next);
  };

  // Adjust position X/Y (Nudge D-pad)
  const nudge = (dx: number, dy: number) => {
    const currX = biodata.photoPositionX || 0;
    const currY = biodata.photoPositionY || 0;
    onChangeBiodata('photoPositionX', currX + dx);
    onChangeBiodata('photoPositionY', currY + dy);
  };

  // Reset transform
  const resetTransform = () => {
    onChangeBiodata('photoZoom', 1.0);
    onChangeBiodata('photoPositionX', 0);
    onChangeBiodata('photoPositionY', 0);
    onChangeBiodata('photoRotation', 0);
    onChangeBiodata('photoBrightness', 100);
    onChangeBiodata('photoContrast', 100);
    onChangeBiodata('photoBeautify', 0);
    onChangeBiodata('photoWarmth', 0);
    onChangeBiodata('photoSaturation', 100);
    onChangeBiodata('photoVignette', false);
    onChangeBiodata('photoShape', 'temple_arch');
  };

  // Helper for background color in studio preview
  const getFrameBgColor = () => {
    switch (biodata.photoBackground) {
      case 'transparent':
        return 'transparent';
      case 'abstract_warm':
        return '#FFFDF5';
      case 'abstract_silk':
        return '#FEF9C3';
      case 'abstract_rose':
        return '#FFF1F2';
      case 'abstract_studio':
        return '#F8FAFC';
      case 'cream':
        return '#FEF3C7';
      case 'gold_gradient':
        return '#FEF08A';
      case 'maroon_gradient':
        return '#FCE7F3';
      case 'silk_gradient':
        return '#D1FAE5';
      case 'original':
      default:
        return 'transparent';
    }
  };

  const getFrameBgGradient = () => {
    switch (biodata.photoBackground) {
      case 'abstract_warm':
        return 'radial-gradient(circle at 50% 35%, #FFFDF5 0%, #FEF3C7 50%, #FFFFFF 90%, #FFFFFF 100%)';
      case 'abstract_silk':
        return 'radial-gradient(circle at 50% 35%, #FEF9C3 0%, #FEF08A 45%, #FFFBEB 75%, #FFFFFF 100%)';
      case 'abstract_rose':
        return 'radial-gradient(circle at 50% 35%, #FFF1F2 0%, #FFE4E6 45%, #FAFAF9 80%, #FFFFFF 100%)';
      case 'abstract_studio':
        return 'radial-gradient(circle at 50% 35%, #F8FAFC 0%, #E2E8F0 50%, #FFFFFF 85%, #FFFFFF 100%)';
      case 'cream':
        return 'linear-gradient(135deg, #FFFDF5 0%, #FEF3C7 100%)';
      case 'gold_gradient':
        return 'radial-gradient(circle at 50% 35%, #FEF08A 0%, #FDE68A 100%)';
      case 'maroon_gradient':
        return 'radial-gradient(circle at 50% 35%, #FCE7F3 0%, #FECDD3 100%)';
      case 'silk_gradient':
        return 'radial-gradient(circle at 50% 35%, #D1FAE5 0%, #A7F3D0 100%)';
      case 'transparent':
      default:
        return 'transparent';
    }
  };

  const STUDIO_BACKDROPS = [
    { id: 'transparent', title: 'வெளிப்படை (No BG)', sub: 'பயோடேட்டாவில் கலந்தது', icon: 'checkerboard', color: 'transparent', border: '#D1D5DB' },
    { id: 'abstract_warm', title: 'மென் சந்தன ஒளி', sub: 'வெள்ளை & சந்தன மென் ஒளி', icon: 'weather-sunny', color: '#FEF3C7', border: '#FDE68A' },
    { id: 'abstract_silk', title: 'அரச தங்கம் & பட்டு', sub: 'மங்களகரமான மென் பட்டு', icon: 'crown', color: '#FEF08A', border: '#F59E0B' },
    { id: 'abstract_rose', title: 'குங்கும ரோஸ் ஒளி', sub: 'பாரம்பரிய கோவில் அழகு', icon: 'flower', color: '#FFE4E6', border: '#FDA4AF' },
    { id: 'abstract_studio', title: 'ஸ்டுடியோ நிழல்', sub: 'நவீன வெள்ளை மென் நிழல்', icon: 'camera-iris', color: '#F1F5F9', border: '#CBD5E1' },
    { id: 'cream', title: 'சந்தன கிரீம்', sub: 'தூய பாரம்பரியம்', icon: 'palette', color: '#FEF3C7', border: '#FDE68A' },
    { id: 'gold_gradient', title: 'அரச தங்கப் பட்டு', sub: 'மங்களகரமான பட்டு', icon: 'shimmer', color: '#FDE68A', border: '#D97706' },
    { id: 'maroon_gradient', title: 'குங்குமச் சிவப்பு', sub: 'கோவில் மங்களம்', icon: 'temple-hindu', color: '#FCE7F3', border: '#BE123C' },
    { id: 'silk_gradient', title: 'பட்டுப் பச்சை', sub: 'அழகிய விசேஷ பொலிவு', icon: 'leaf', color: '#D1FAE5', border: '#10B981' },
  ];

  const renderBackdropsGrid = () => (
    <View style={{ marginTop: 16 }}>
      <Text style={[styles.panelTitle, { fontSize: 13 }, isDarkMode && styles.textWhite]}>
        🎨 திருமண பின்னணி & கிரேடியன்ட் (Studio Backdrops & Gradients):
      </Text>
      <Text style={[styles.panelSub, { fontSize: 11, marginBottom: 8 }, isDarkMode && styles.textMutedDark]}>
        பயோடேட்டா வெள்ளை நிறத்துடன் இயல்பாகக் கரையும் மென் பின்னணிகள்
      </Text>
      <View style={styles.backdropsGrid}>
        {STUDIO_BACKDROPS.map((bg) => (
          <TouchableOpacity
            key={bg.id}
            onPress={() => {
              onChangeBiodata('photoBackground', bg.id as any);
              if (bg.id === 'transparent') {
                onChangeBiodata('photoLayout', 'standing_cutout');
              }
            }}
            style={[
              styles.backdropCard,
              isDarkMode && styles.backdropDark,
              biodata.photoBackground === bg.id && styles.backdropCardActive,
            ]}
          >
            <MaterialCommunityIcons
              name={bg.icon as any}
              size={18}
              color={biodata.photoBackground === bg.id ? '#D97706' : isDarkMode ? '#94A3B8' : '#6B7280'}
            />
            <Text
              style={[
                styles.backdropTitle,
                isDarkMode && styles.textWhite,
                biodata.photoBackground === bg.id && { color: '#D97706', fontWeight: '800' },
              ]}
            >
              {bg.title}
            </Text>
            <Text style={styles.backdropSub}>{bg.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Shape Changer styles
  const getShapeStyle = () => {
    switch (biodata.photoShape) {
      case 'circle':
        return { borderRadius: 999, overflow: 'hidden' as const };
      case 'temple_arch':
        return {
          borderTopLeftRadius: 95,
          borderTopRightRadius: 95,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          overflow: 'hidden' as const,
        };
      case 'hexagon':
      case 'diamond':
        return {
          borderRadius: 16,
          // @ts-ignore
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          WebkitClipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          overflow: 'hidden' as const,
        };
      case 'scallop':
        return {
          borderTopLeftRadius: 50,
          borderBottomRightRadius: 50,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 16,
          overflow: 'hidden' as const,
        };
      case 'gaussian_blur':
        return {
          borderRadius: 0,
          borderWidth: 0,
          // @ts-ignore
          maskImage: 'radial-gradient(ellipse 82% 88% at 50% 50%, #000 48%, rgba(0,0,0,0) 96%)',
          WebkitMaskImage: 'radial-gradient(ellipse 82% 88% at 50% 50%, #000 48%, rgba(0,0,0,0) 96%)',
          overflow: 'hidden' as const,
        };
      case 'feather_bottom':
        return {
          borderWidth: 0,
          // @ts-ignore
          maskImage: 'linear-gradient(to bottom, #000 62%, rgba(0,0,0,0.4) 86%, rgba(0,0,0,0) 98%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 62%, rgba(0,0,0,0.4) 86%, rgba(0,0,0,0) 98%)',
          overflow: 'hidden' as const,
        };
      case 'feather_abstract':
        return {
          borderRadius: 0,
          borderWidth: 0,
          // @ts-ignore
          maskImage: 'radial-gradient(circle at 50% 45%, #000 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.15) 85%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 45%, #000 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.15) 85%, transparent 100%)',
          overflow: 'hidden' as const,
        };
      case 'feather_temple':
        return {
          borderTopLeftRadius: 95,
          borderTopRightRadius: 95,
          borderWidth: 0,
          // @ts-ignore
          maskImage: 'linear-gradient(to bottom, #000 68%, rgba(0,0,0,0) 98%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 68%, rgba(0,0,0,0) 98%)',
          overflow: 'hidden' as const,
        };
      case 'rectangle':
      default:
        return { borderRadius: 8, overflow: 'hidden' as const };
    }
  };

  // Frame border styling
  const getFrameBorderStyle = () => {
    if (['gaussian_blur', 'feather_bottom', 'feather_abstract', 'feather_temple'].includes(biodata.photoShape)) {
      return { borderWidth: 0 };
    }
    switch (biodata.photoFrameBorder) {
      case 'ornamental_gold':
        return {
          borderWidth: 4,
          borderColor: '#D97706',
          shadowColor: '#B45309',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 6,
        };
      case 'temple_arch':
        return {
          borderWidth: 3,
          borderColor: '#991B1B',
        };
      case 'double_border':
        return {
          borderWidth: 3,
          borderColor: '#B91C1C',
          padding: 2,
        };
      case 'rounded':
        return {
          borderWidth: 2,
          borderColor: '#9CA3AF',
        };
      case 'none':
      default:
        return {
          borderWidth: 0,
        };
    }
  };

  const zoom = biodata.photoZoom || 1.0;
  const posX = biodata.photoPositionX || 0;
  const posY = biodata.photoPositionY || 0;
  const rotation = biodata.photoRotation || 0;
  const frameW = biodata.photoFrameWidth || 190;
  const frameH = biodata.photoFrameHeight || 280;

  return (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="image-edit-outline" size={24} color={isDarkMode ? '#F59E0B' : '#991B1B'} />
          <View>
            <Text style={[styles.cardTitle, isDarkMode && styles.textWhite]}>
              இமேஜ் டூல்பாக்ஸ் ஸ்டுடியோ (Image Toolbox Studio)
            </Text>
            <Text style={[styles.cardSub, isDarkMode && styles.textMutedDark]}>
              வடிவ மாற்றி, மேஜிக் பின்னணி நீக்கி, பொலிவு மற்றும் பிரேம் அலங்காரக் கருவிகள்
            </Text>
          </View>
        </View>
        {biodata.photoUri && (
          <TouchableOpacity onPress={resetTransform} style={[styles.resetBtn, isDarkMode && styles.btnDark]}>
            <MaterialCommunityIcons name="refresh" size={14} color={isDarkMode ? '#F3F4F6' : '#6B7280'} />
            <Text style={[styles.resetBtnText, isDarkMode && styles.textWhite]}>மீட்டமைக்க</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Live Interactive Canvas Preview */}
      <View style={[styles.studioCanvasContainer, isDarkMode && styles.canvasDark]}>
        <View style={[styles.paperMockupBg, isDarkMode && styles.paperDark]}>
          <View style={styles.paperCornerStamp}>
            <Text style={[styles.paperCornerText, isDarkMode && { color: '#F59E0B' }]}>உ</Text>
          </View>
          <Text style={[styles.paperMockupLabel, isDarkMode && { color: '#FDE68A' }]}>
            {biodata.photoLayout === 'standing_cutout'
              ? '✨ பயோடேட்டாவில் நேரடி நின்ற தோற்றம் (Merged Cutout)'
              : biodata.photoShape === 'gaussian_blur'
              ? '✨ நீள்வட்ட விளிம்பு மங்கலாக்கம் (Soft Radial Feather)'
              : biodata.photoShape === 'feather_bottom'
              ? '✨ கீழ் விளிம்பு கலப்பு (Bottom Torso Fade / Dissolve)'
              : biodata.photoShape === 'feather_abstract'
              ? '✨ பின்னணி பரவல் கலை (Abstract Aura Spread)'
              : biodata.photoShape === 'feather_temple'
              ? '✨ தோரண வாசல் மென் பரவல் (Temple Feather Blend)'
              : `🖼️ ${biodata.photoShape === 'temple_arch' ? 'கோவில் தோரண வாசல்' : biodata.photoShape === 'circle' ? 'வட்ட வடிவம்' : biodata.photoShape === 'hexagon' ? 'அறுங்கோண வைரம்' : biodata.photoShape === 'scallop' ? 'தாமரை மலர் விளிம்பு' : 'சட்ட வடிவம்'} (Custom Shape)`}
          </Text>

          {/* Viewport Frame with Direct Touch/Pinch Gestures, Shape Changer & Transforms */}
          <View
            // @ts-ignore
            onPointerDown={handlePointerDown}
            // @ts-ignore
            onMouseDown={handlePointerDown}
            // @ts-ignore
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={[
              styles.viewportFrame,
              {
                width: frameW,
                height: frameH,
                backgroundColor: getFrameBgColor(),
                backgroundImage: getFrameBgGradient(),
                cursor: biodata.photoUri ? (isDragging ? 'grabbing' : 'grab') : 'default',
                userSelect: 'none',
              } as any,
              getShapeStyle(),
              getFrameBorderStyle(),
              biodata.photoBackground === 'transparent' && styles.checkerboardBg,
            ]}
          >
            {biodata.photoUri ? (
              <View style={styles.imageTransformContainer}>
                <Image
                  source={{
                    uri: showOriginalComparison && biodata.photoOriginalUri
                      ? biodata.photoOriginalUri
                      : biodata.photoUri,
                  }}
                  style={[
                    styles.photoLayer,
                    {
                      transform: [
                        { translateX: posX },
                        { translateY: posY },
                        { scale: zoom },
                        { rotate: `${rotation}deg` },
                      ],
                    },
                  ]}
                  resizeMode={biodata.photoLayout === 'standing_cutout' ? 'contain' : 'cover'}
                />

                {/* Soft Glamour / Beautification Overlay if enabled */}
                {(biodata.photoBeautify || 0) > 0 && (
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor: 'rgba(255, 237, 213, 0.12)',
                      },
                    ]}
                  />
                )}

                {/* Vignette Overlay if enabled */}
                {biodata.photoVignette && (
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFill,
                      styles.vignetteOverlay,
                    ]}
                  />
                )}

                {/* Transform Guides */}
                <View pointerEvents="none" style={styles.photoshopGuides}>
                  <View style={[styles.cornerHandle, styles.cornerTL]} />
                  <View style={[styles.cornerHandle, styles.cornerTR]} />
                  <View style={[styles.cornerHandle, styles.cornerBL]} />
                  <View style={[styles.cornerHandle, styles.cornerBR]} />
                </View>
              </View>
            ) : (
              <View style={styles.emptyPlaceholder}>
                <MaterialCommunityIcons name="account-tie-outline" size={60} color="#9CA3AF" />
                <Text style={[styles.emptyPlaceholderText, isDarkMode && styles.textWhite]}>
                  புகைப்படம் பதிவேற்றப்படவில்லை
                </Text>
                <Text style={styles.emptyPlaceholderSub}>
                  கீழே உள்ள பட்டனை அழுத்தி புகைப்படத்தைத் தேர்ந்தெடுக்கவும்
                </Text>
              </View>
            )}
          </View>

          {/* Interactive Gesture Helper Notice */}
          {biodata.photoUri && (
            <View style={styles.gestureHintRow}>
              <MaterialCommunityIcons name="gesture-pinch" size={13} color={isDarkMode ? '#F59E0B' : '#B45309'} />
              <Text style={[styles.gestureHintText, isDarkMode && { color: '#FDE68A' }]}>
                விரலால் இழுக்கவும் (Drag) • இரண்டு விரலால் அளவை மாற்றவும் (Pinch Zoom)
              </Text>
            </View>
          )}

          {/* Quick HUD Metrics */}
          {biodata.photoUri && (
            <View style={styles.hudBadgeRow}>
              <View style={[styles.hudBadge, isDarkMode && styles.hudDark]}>
                <Text style={[styles.hudBadgeText, isDarkMode && { color: '#FDE68A' }]}>
                  அளவு: {Math.round(zoom * 100)}%
                </Text>
              </View>
              <View style={[styles.hudBadge, isDarkMode && styles.hudDark]}>
                <Text style={[styles.hudBadgeText, isDarkMode && { color: '#FDE68A' }]}>
                  நிலை: X:{posX} Y:{posY}
                </Text>
              </View>
              {rotation !== 0 && (
                <View style={[styles.hudBadge, isDarkMode && styles.hudDark]}>
                  <Text style={[styles.hudBadgeText, isDarkMode && { color: '#FDE68A' }]}>
                    சுழற்சி: {rotation}°
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Upload & Delete Actions */}
        <View style={styles.mainActionRow}>
          <TouchableOpacity onPress={pickImage} style={styles.uploadBigBtn}>
            <MaterialCommunityIcons name="camera-plus" size={18} color="#FFFFFF" />
            <Text style={styles.uploadBigBtnText}>
              {biodata.photoUri ? 'புகைப்படத்தை மாற்று' : 'புகைப்படம் பதிவேற்று (Upload Photo)'}
            </Text>
          </TouchableOpacity>

          {biodata.photoUri && (
            <TouchableOpacity onPress={removePhoto} style={styles.deletePhotoIconBtn}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Gradient & Backdrop Strip - ALWAYS VISIBLE ABOVE TABS */}
        <View style={styles.quickBackdropStrip}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[styles.quickBackdropTitle, isDarkMode && styles.textWhite]}>
              🎨 பின்னணி & கிரேடியன்ட் (Gradient / Backdrop):
            </Text>
            <TouchableOpacity onPress={() => setActiveTab('cutout')}>
              <Text style={{ fontSize: 11, color: '#D97706', fontWeight: '700' }}>
                அனைத்தும் &gt;
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBackdropScroll}>
            {STUDIO_BACKDROPS.map((bg) => (
              <TouchableOpacity
                key={bg.id}
                onPress={() => {
                  onChangeBiodata('photoBackground', bg.id as any);
                  if (bg.id === 'transparent') {
                    onChangeBiodata('photoLayout', 'standing_cutout');
                  }
                }}
                style={[
                  styles.quickBackdropPill,
                  isDarkMode && styles.pillDark,
                  biodata.photoBackground === bg.id && styles.quickBackdropPillActive,
                ]}
              >
                <View style={[styles.quickColorDot, { backgroundColor: bg.color, borderColor: bg.border }]} />
                <Text
                  style={[
                    styles.quickBackdropPillText,
                    isDarkMode && styles.textWhite,
                    biodata.photoBackground === bg.id && { color: '#B45309', fontWeight: '800' },
                  ]}
                >
                  {bg.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Toolbox Tabs: 1) நகர்த்து & அளவு 2) பின்னணி & கிரேடியன்ட் 3) வடிவ மாற்றி 4) அழகு & பொலிவு */}
      <View style={[styles.tabBar, isDarkMode && styles.tabBarDark]}>
        <TouchableOpacity
          onPress={() => setActiveTab('transform')}
          style={[styles.tabItem, activeTab === 'transform' && (isDarkMode ? styles.tabItemActiveDark : styles.tabItemActive)]}
        >
          <MaterialCommunityIcons
            name="cursor-move"
            size={16}
            color={activeTab === 'transform' ? (isDarkMode ? '#F59E0B' : '#991B1B') : '#9CA3AF'}
          />
          <Text
            style={[
              styles.tabItemText,
              activeTab === 'transform' && (isDarkMode ? styles.tabItemTextActiveDark : styles.tabItemTextActive),
            ]}
          >
            நகர்த்து & அளவு
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('cutout')}
          style={[styles.tabItem, activeTab === 'cutout' && (isDarkMode ? styles.tabItemActiveDark : styles.tabItemActive)]}
        >
          <MaterialCommunityIcons
            name="gradient-vertical"
            size={16}
            color={activeTab === 'cutout' ? (isDarkMode ? '#F59E0B' : '#991B1B') : '#9CA3AF'}
          />
          <Text
            style={[
              styles.tabItemText,
              activeTab === 'cutout' && (isDarkMode ? styles.tabItemTextActiveDark : styles.tabItemTextActive),
            ]}
          >
            பின்னணி & கிரேடியன்ட்
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('shape')}
          style={[styles.tabItem, activeTab === 'shape' && (isDarkMode ? styles.tabItemActiveDark : styles.tabItemActive)]}
        >
          <MaterialCommunityIcons
            name="shape-outline"
            size={16}
            color={activeTab === 'shape' ? (isDarkMode ? '#F59E0B' : '#991B1B') : '#9CA3AF'}
          />
          <Text
            style={[
              styles.tabItemText,
              activeTab === 'shape' && (isDarkMode ? styles.tabItemTextActiveDark : styles.tabItemTextActive),
            ]}
          >
            வடிவ மாற்றி
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('enhance')}
          style={[styles.tabItem, activeTab === 'enhance' && (isDarkMode ? styles.tabItemActiveDark : styles.tabItemActive)]}
        >
          <MaterialCommunityIcons
            name="magic-staff"
            size={16}
            color={activeTab === 'enhance' ? (isDarkMode ? '#F59E0B' : '#991B1B') : '#9CA3AF'}
          />
          <Text
            style={[
              styles.tabItemText,
              activeTab === 'enhance' && (isDarkMode ? styles.tabItemTextActiveDark : styles.tabItemTextActive),
            ]}
          >
            அழகு & பொலிவு
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: TRANSFORM & D-PAD CONTROLS */}
      {activeTab === 'transform' && (
        <View style={styles.tabPanel}>
          <Text style={[styles.panelTitle, isDarkMode && styles.textWhite]}>
            படத்தின் நிலையை சரிசெய்யவும் (Pan & Zoom Controls):
          </Text>

          <View style={[styles.controlsRow, isDarkMode && styles.controlsRowDark]}>
            {/* D-Pad Nudge */}
            <View style={styles.dpadWrapper}>
              <Text style={[styles.dpadTitle, isDarkMode && styles.textMutedDark]}>நகர்த்தும் கருவி (Nudge):</Text>
              <View style={styles.dpadContainer}>
                <TouchableOpacity onPress={() => nudge(0, -10)} style={[styles.dpadBtn, isDarkMode && styles.dpadBtnDark, styles.dpadUp]}>
                  <MaterialCommunityIcons name="chevron-up" size={24} color={isDarkMode ? '#FFFFFF' : '#374151'} />
                </TouchableOpacity>

                <View style={styles.dpadMiddleRow}>
                  <TouchableOpacity onPress={() => nudge(-10, 0)} style={[styles.dpadBtn, isDarkMode && styles.dpadBtnDark, styles.dpadLeft]}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={isDarkMode ? '#FFFFFF' : '#374151'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      onChangeBiodata('photoPositionX', 0);
                      onChangeBiodata('photoPositionY', 0);
                    }}
                    style={[styles.dpadBtn, styles.dpadCenter, isDarkMode && { backgroundColor: '#7F1D1D' }]}
                  >
                    <MaterialCommunityIcons name="target" size={16} color={isDarkMode ? '#FDE68A' : '#991B1B'} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => nudge(10, 0)} style={[styles.dpadBtn, isDarkMode && styles.dpadBtnDark, styles.dpadRight]}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={isDarkMode ? '#FFFFFF' : '#374151'} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => nudge(0, 10)} style={[styles.dpadBtn, isDarkMode && styles.dpadBtnDark, styles.dpadDown]}>
                  <MaterialCommunityIcons name="chevron-down" size={24} color={isDarkMode ? '#FFFFFF' : '#374151'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Zoom & Rotate Tools */}
            <View style={styles.quickToolsCol}>
              <Text style={[styles.dpadTitle, isDarkMode && styles.textMutedDark]}>படத்தின் அளவு (Zoom):</Text>
              <View style={styles.zoomButtonsRow}>
                <TouchableOpacity onPress={() => updateZoom(-0.1)} style={[styles.zoomPillBtn, isDarkMode && styles.pillDark]}>
                  <MaterialCommunityIcons name="magnify-minus-outline" size={18} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
                  <Text style={[styles.zoomPillText, isDarkMode && styles.textWhite]}>சிறிதாக்கு</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onChangeBiodata('photoZoom', 1.0)}
                  style={[styles.zoomResetPill, isDarkMode && styles.pillDark]}
                >
                  <Text style={[styles.zoomResetPillText, isDarkMode && { color: '#F59E0B' }]}>100%</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => updateZoom(0.1)} style={[styles.zoomPillBtn, isDarkMode && styles.pillDark]}>
                  <MaterialCommunityIcons name="magnify-plus-outline" size={18} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
                  <Text style={[styles.zoomPillText, isDarkMode && styles.textWhite]}>பெரிதாக்கு</Text>
                </TouchableOpacity>
              </View>

              {/* Rotation */}
              <Text style={[styles.dpadTitle, { marginTop: 12 }, isDarkMode && styles.textMutedDark]}>சுழற்று (Rotate):</Text>
              <View style={styles.zoomButtonsRow}>
                <TouchableOpacity
                  onPress={() => onChangeBiodata('photoRotation', (rotation - 5 + 360) % 360)}
                  style={[styles.zoomPillBtn, isDarkMode && styles.pillDark]}
                >
                  <MaterialCommunityIcons name="rotate-left" size={18} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
                  <Text style={[styles.zoomPillText, isDarkMode && styles.textWhite]}>-5°</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onChangeBiodata('photoRotation', 0)}
                  style={[styles.zoomResetPill, isDarkMode && styles.pillDark]}
                >
                  <Text style={[styles.zoomResetPillText, isDarkMode && { color: '#F59E0B' }]}>0°</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onChangeBiodata('photoRotation', (rotation + 5) % 360)}
                  style={[styles.zoomPillBtn, isDarkMode && styles.pillDark]}
                >
                  <MaterialCommunityIcons name="rotate-right" size={18} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
                  <Text style={[styles.zoomPillText, isDarkMode && styles.textWhite]}>+5°</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Aspect Ratio Presets */}
          <View style={styles.frameSizeBar}>
            <Text style={[styles.frameSizeLabel, isDarkMode && styles.textWhite]}>பிரேம் உயரம் (Frame Height):</Text>
            <View style={styles.presetHeightRow}>
              {[240, 280, 320, 360].map((h) => (
                <TouchableOpacity
                  key={h}
                  onPress={() => onChangeBiodata('photoFrameHeight', h)}
                  style={[
                    styles.sizePill,
                    isDarkMode && styles.sizePillDark,
                    frameH === h && (isDarkMode ? styles.sizePillActiveDark : styles.sizePillActive),
                  ]}
                >
                  <Text
                    style={[
                      styles.sizePillText,
                      isDarkMode && styles.textWhite,
                      frameH === h && (isDarkMode ? { color: '#F59E0B' } : styles.sizePillTextActive),
                    ]}
                  >
                    {h === 280 ? 'இயல்பு (280px)' : `${h}px`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* TAB 2: BACKGROUND REMOVAL (Nero AI & ImageToolbox Studio) */}
      {activeTab === 'cutout' && (
        <View style={styles.tabPanel}>
          <Text style={[styles.panelTitle, isDarkMode && styles.textWhite]}>
            ✨ மேஜிக் பின்னணி நீக்கி (Nero AI Cutout Studio):
          </Text>
          <Text style={[styles.panelSub, isDarkMode && styles.textMutedDark]}>
            புகைப்படத்தில் உள்ள மணமகன் / மணமகளின் முகத்தையும் உடலையும் துல்லியமாகப் பாதுகாத்து, பின்னணியை மட்டும் அழகாக நீக்குகிறது.
          </Text>

          {/* Nero AI Style Before / After Comparison Toggle */}
          {biodata.photoOriginalUri && biodata.photoCutoutEnabled && (
            <View style={styles.compareToggleRow}>
              <TouchableOpacity
                onPress={() => setShowOriginalComparison(false)}
                style={[
                  styles.compareBtn,
                  !showOriginalComparison && styles.compareBtnActive,
                ]}
              >
                <MaterialCommunityIcons
                  name="auto-fix"
                  size={15}
                  color={!showOriginalComparison ? '#FFFFFF' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.compareBtnText,
                    !showOriginalComparison && styles.compareBtnTextActive,
                  ]}
                >
                  கட்டவுட் தோற்றம் (Cutout)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowOriginalComparison(true)}
                style={[
                  styles.compareBtn,
                  showOriginalComparison && styles.compareBtnActive,
                ]}
              >
                <MaterialCommunityIcons
                  name="image-outline"
                  size={15}
                  color={showOriginalComparison ? '#FFFFFF' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.compareBtnText,
                    showOriginalComparison && styles.compareBtnTextActive,
                  ]}
                >
                  அசல் படம் (Original)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Main Cutout Action Card */}
          <View style={[styles.bgRemovalCard, isDarkMode && styles.bgCardDark]}>
            {/* Direct Upload Transparent PNG (remove.bg & Nero AI) */}
            <TouchableOpacity
              onPress={pickTransparentPng}
              style={styles.uploadTransparentPngBtn}
            >
              <MaterialCommunityIcons name="cloud-upload-outline" size={22} color="#FFFFFF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadTransparentPngBtnText}>
                  📁 remove.bg / Nero AI வெளிப்படை PNG பதிவேற்ற
                </Text>
                <Text style={styles.uploadTransparentPngBtnSub}>
                  ஏற்கனவே பின்னணி நீக்கப்பட்ட டிரான்ஸ்பரன்ட் படத்தை நேரடியாகப் பயோடேட்டாவில் சேர்க்க
                </Text>
              </View>
            </TouchableOpacity>

            {/* Smart Cutout In-App Button */}
            <TouchableOpacity
              onPress={() => handleRemoveBackground()}
              disabled={isProcessingBg || !biodata.photoUri}
              style={[
                styles.magicCutoutBtn,
                (!biodata.photoUri || isProcessingBg) && styles.btnDisabled,
                { marginTop: 10 },
              ]}
            >
              <MaterialCommunityIcons
                name={isProcessingBg ? 'loading' : 'magic-staff'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.magicCutoutBtnText}>
                {isProcessingBg
                  ? 'துல்லியமாக பின்னணி நீக்கப்படுகிறது...'
                  : 'ஸ்மார்ட் தானியங்கி பின்னணி நீக்கு (In-App Cutout)'}
              </Text>
            </TouchableOpacity>

            {/* Dedicated One-Click Black Box Fix for PNG Cutouts */}
            <TouchableOpacity
              onPress={() => handleRemoveBackground([0, 0, 0])}
              disabled={isProcessingBg || !biodata.photoUri}
              style={[
                styles.magicCutoutBtn,
                { backgroundColor: '#1F2937', marginTop: 8 },
                (!biodata.photoUri || isProcessingBg) && styles.btnDisabled,
              ]}
            >
              <MaterialCommunityIcons
                name="image-filter-black-white"
                size={18}
                color="#FBBF24"
              />
              <Text style={styles.magicCutoutBtnText}>
                கருப்பு பின்னணி நீக்கு (Remove Black Box from Cutout)
              </Text>
            </TouchableOpacity>

            {biodata.photoOriginalUri && biodata.photoCutoutEnabled && (
              <TouchableOpacity
                onPress={handleRestoreOriginal}
                style={[styles.restoreOriginalBtn, isDarkMode && styles.btnDark]}
              >
                <MaterialCommunityIcons name="undo" size={16} color={isDarkMode ? '#FFFFFF' : '#4B5563'} />
                <Text style={[styles.restoreOriginalBtnText, isDarkMode && styles.textWhite]}>
                  அசல் புகைப்படத்தை மீட்டமைக்க
                </Text>
              </TouchableOpacity>
            )}

            {/* Remove.bg and Complex Background Helper Tip */}
            <View style={styles.removeBgHelperBanner}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#D97706" />
              <Text style={styles.removeBgHelperText}>
                💡 மரம், செடிகள் போன்ற சிக்கலான வெளிப்புற பின்னணிக்கு <Text style={{ fontWeight: '800' }}>remove.bg</Text> அல்லது <Text style={{ fontWeight: '800' }}>Nero AI</Text> தளத்தில் 1 நொடியில் பின்னணி நீக்கி, மேலே உள்ள பட்டன் வழியாக பதிவேற்றலாம்.
              </Text>
            </View>
          </View>

          {/* Target Color Keying Swatches */}
          <View style={{ marginTop: 14 }}>
            <Text style={[styles.panelTitle, { fontSize: 13 }, isDarkMode && styles.textWhite]}>
              🎯 குறிப்பிட்ட பின்னணி வண்ணத்தை நீக்க (Click to Key Color):
            </Text>
            <Text style={[styles.panelSub, { fontSize: 11, marginBottom: 8 }, isDarkMode && styles.textMutedDark]}>
              உங்கள் புகைப்படத்தின் பின்னணி வண்ணத்தைத் தேர்ந்தெடுத்து துல்லியமாக அகற்றவும்
            </Text>
            <View style={styles.colorSwatchesRow}>
              {[
                { title: 'கருப்பு பின்னணி', color: [0, 0, 0] as [number, number, number], hex: '#000000' },
                { title: 'வெள்ளை சுவர்', color: [250, 250, 250] as [number, number, number], hex: '#F9FAFB' },
                { title: 'சாம்பல் ஸ்டுடியோ', color: [215, 215, 220] as [number, number, number], hex: '#D1D5DB' },
                { title: 'சந்தன வெளிர்', color: [248, 241, 228] as [number, number, number], hex: '#FDE68A' },
                { title: 'மரங்கள் / இலை', color: [45, 85, 45] as [number, number, number], hex: '#3F6212' },
                { title: 'வெளிர் இயற்கை', color: [110, 140, 95] as [number, number, number], hex: '#84CC16' },
                { title: 'நீல வானம்', color: [140, 190, 240] as [number, number, number], hex: '#93C5FD' },
              ].map((sw) => (
                <TouchableOpacity
                  key={sw.title}
                  disabled={isProcessingBg || !biodata.photoUri}
                  onPress={() => handleRemoveBackground(sw.color)}
                  style={[styles.colorSwatchBtn, isDarkMode && styles.pillDark]}
                >
                  <View style={[styles.colorDot, { backgroundColor: sw.hex, borderColor: '#D1D5DB', borderWidth: 1 }]} />
                  <Text style={[styles.colorSwatchText, isDarkMode && styles.textWhite]}>
                    {sw.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Matrimonial Studio Backdrops & Gradients */}
          {renderBackdropsGrid()}

          {/* Sensitivity */}
          <View style={[styles.sensitivitySection, { marginTop: 16 }]}>
            <Text style={[styles.sensitivityLabel, isDarkMode && styles.textWhite]}>
              நீக்கும் துல்லியம் (Sensitivity Threshold): {sensitivity}
            </Text>
            <View style={styles.sensitivityRow}>
              {[18, 30, 42, 55].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setSensitivity(val)}
                  style={[
                    styles.sensChip,
                    isDarkMode && styles.sensChipDark,
                    sensitivity === val && styles.sensChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sensChipText,
                      isDarkMode && styles.textWhite,
                      sensitivity === val && styles.sensChipTextActive,
                    ]}
                  >
                    {val === 18 ? 'நுணுக்கமானது' : val === 30 ? 'இயல்பு (பரிந்துரை)' : val === 42 ? 'அதிகம்' : 'அதிதீவிரம்'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* TAB 3: SHAPE CHANGER (ImageToolbox Inspired) */}
      {activeTab === 'shape' && (
        <View style={styles.tabPanel}>
          <Text style={[styles.panelTitle, isDarkMode && styles.textWhite]}>
            வடிவ மாற்றி (Shape Changer - ImageToolbox):
          </Text>
          <Text style={[styles.panelSub, isDarkMode && styles.textMutedDark]}>
            புகைப்படத்திற்கான புனித மற்றும் அழகிய வடிவங்களைத் தேர்ந்தெடுக்கவும்
          </Text>

          <View style={styles.shapesGrid}>
            {[
              { id: 'gaussian_blur', title: 'நீள்வட்ட மென் பரவல்', icon: 'blur', desc: 'பயோடேட்டாவில் மென்மையாகக் கரையும் ரேடியல் விளிம்பு' },
              { id: 'feather_bottom', title: 'கீழ் விளிம்பு கலப்பு', icon: 'gradient-vertical', desc: 'கீழ் பகுதி பயோடேட்டா தாளுடன் கரையும்' },
              { id: 'feather_abstract', title: 'பின்னணி பரவல் கலை', icon: 'weather-cloudy', desc: 'அழகிய மேகம்போல் பரவும் மென் பின்னணி' },
              { id: 'feather_temple', title: 'தோரண வாசல் மென் பரவல்', icon: 'arch', desc: 'கோவில் தோரண வளைவும் மென் விளிம்பும்' },
              { id: 'temple_arch', title: 'கோவில் தோரண வாசல்', icon: 'arch', desc: 'மங்கள தோரண வாசல்' },
              { id: 'rectangle', title: 'செவ்வக வடிவம்', icon: 'rectangle-outline', desc: 'பாரம்பரிய செவ்வகம்' },
              { id: 'circle', title: 'வட்ட வடிவம்', icon: 'circle-outline', desc: 'அழகிய வட்ட பிரேம்' },
              { id: 'hexagon', title: 'அறுங்கோண வைரம்', icon: 'hexagon-outline', desc: 'அரச கம்பீர வடிவம்' },
              { id: 'scallop', title: 'தாமரை மலர் விளிம்பு', icon: 'flower-outline', desc: 'மென்மையான தாமரை இதழ்' },
            ].map((shape) => (
              <TouchableOpacity
                key={shape.id}
                onPress={() => onChangeBiodata('photoShape', shape.id as any)}
                style={[
                  styles.shapeCard,
                  isDarkMode && styles.shapeCardDark,
                  biodata.photoShape === shape.id && styles.shapeCardActive,
                ]}
              >
                <MaterialCommunityIcons
                  name={shape.icon as any}
                  size={24}
                  color={biodata.photoShape === shape.id ? (isDarkMode ? '#F59E0B' : '#991B1B') : '#9CA3AF'}
                />
                <Text
                  style={[
                    styles.shapeCardTitle,
                    isDarkMode && styles.textWhite,
                    biodata.photoShape === shape.id && (isDarkMode ? { color: '#F59E0B' } : { color: '#991B1B' }),
                  ]}
                >
                  {shape.title}
                </Text>
                <Text style={styles.shapeCardDesc}>{shape.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Border Design Elements */}
          <Text style={[styles.panelTitle, { marginTop: 14 }, isDarkMode && styles.textWhite]}>
            பார்டர் அலங்கார வடிவமைப்பு (Border Filigree):
          </Text>
          <View style={styles.chipsGridRow}>
            {[
              { id: 'none', title: 'பார்டர் இல்லை', icon: 'border-none-variant' },
              { id: 'ornamental_gold', title: 'தங்க பார்டர்', icon: 'crown-outline' },
              { id: 'temple_arch', title: 'கோவில் தோரணம்', icon: 'arch' },
              { id: 'double_border', title: 'இரட்டைக் கோடு', icon: 'square-outline' },
              { id: 'rounded', title: 'வளைந்த மூலைகள்', icon: 'image-frame' },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => onChangeBiodata('photoFrameBorder', f.id as any)}
                style={[
                  styles.frameBorderChip,
                  isDarkMode && styles.chipDark,
                  biodata.photoFrameBorder === f.id && styles.frameBorderChipSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name={f.icon as any}
                  size={16}
                  color={biodata.photoFrameBorder === f.id ? (isDarkMode ? '#F59E0B' : '#991B1B') : '#9CA3AF'}
                />
                <Text
                  style={[
                    styles.frameBorderChipText,
                    isDarkMode && styles.textWhite,
                    biodata.photoFrameBorder === f.id && (isDarkMode ? { color: '#F59E0B' } : styles.frameBorderChipTextSelected),
                  ]}
                >
                  {f.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Matrimonial Studio Backdrops & Gradients in Shape Tab */}
          {renderBackdropsGrid()}
        </View>
      )}

      {/* TAB 4: BEAUTIFICATION & ENHANCEMENT */}
      {activeTab === 'enhance' && (
        <View style={styles.tabPanel}>
          <Text style={[styles.panelTitle, isDarkMode && styles.textWhite]}>
            அழகு & பொலிவு மெருகேற்றல் (Beautification & Enhancement):
          </Text>

          {/* Skin Glow / Beautify */}
          <Text style={[styles.filterFieldLabel, isDarkMode && styles.textWhite]}>
            ✨ தோல் மென்மை & பொலிவு (Glamour Glow): {biodata.photoBeautify || 0}%
          </Text>
          <View style={styles.filterPillsRow}>
            {[0, 25, 50, 75].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => onChangeBiodata('photoBeautify', g)}
                style={[
                  styles.filterPill,
                  isDarkMode && styles.pillDark,
                  (biodata.photoBeautify || 0) === g && (isDarkMode ? styles.filterPillSelectedDark : styles.filterPillSelected),
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isDarkMode && styles.textWhite,
                    (biodata.photoBeautify || 0) === g && (isDarkMode ? { color: '#F59E0B' } : styles.filterPillTextSelected),
                  ]}
                >
                  {g === 0 ? 'இயல்பு (None)' : `${g}% பொலிவு`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Golden Hour Warmth */}
          <Text style={[styles.filterFieldLabel, { marginTop: 12 }, isDarkMode && styles.textWhite]}>
            ☀️ முகூர்த்த தங்க நிற ஒளி (Golden Warmth): {biodata.photoWarmth || 0}%
          </Text>
          <View style={styles.filterPillsRow}>
            {[0, 20, 40, 60].map((w) => (
              <TouchableOpacity
                key={w}
                onPress={() => onChangeBiodata('photoWarmth', w)}
                style={[
                  styles.filterPill,
                  isDarkMode && styles.pillDark,
                  (biodata.photoWarmth || 0) === w && (isDarkMode ? styles.filterPillSelectedDark : styles.filterPillSelected),
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isDarkMode && styles.textWhite,
                    (biodata.photoWarmth || 0) === w && (isDarkMode ? { color: '#F59E0B' } : styles.filterPillTextSelected),
                  ]}
                >
                  {w === 0 ? 'இயல்பு' : `${w}% தங்கம்`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Brightness */}
          <Text style={[styles.filterFieldLabel, { marginTop: 12 }, isDarkMode && styles.textWhite]}>
            💡 வெளிச்சம் / பிரகாசம் (Brightness): {biodata.photoBrightness || 100}%
          </Text>
          <View style={styles.filterPillsRow}>
            {[90, 100, 110, 120, 130].map((b) => (
              <TouchableOpacity
                key={b}
                onPress={() => onChangeBiodata('photoBrightness', b)}
                style={[
                  styles.filterPill,
                  isDarkMode && styles.pillDark,
                  (biodata.photoBrightness || 100) === b && (isDarkMode ? styles.filterPillSelectedDark : styles.filterPillSelected),
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isDarkMode && styles.textWhite,
                    (biodata.photoBrightness || 100) === b && (isDarkMode ? { color: '#F59E0B' } : styles.filterPillTextSelected),
                  ]}
                >
                  {b === 100 ? 'இயல்பு' : `${b}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Vignette Toggle */}
          <View style={styles.vignetteToggleRow}>
            <Text style={[styles.filterFieldLabel, isDarkMode && styles.textWhite]}>
              விளிம்பு மங்கல் (Vignette Focus):
            </Text>
            <TouchableOpacity
              onPress={() => onChangeBiodata('photoVignette', !biodata.photoVignette)}
              style={[
                styles.vignetteBtn,
                biodata.photoVignette && styles.vignetteBtnActive,
              ]}
            >
              <MaterialCommunityIcons
                name={biodata.photoVignette ? 'check-circle' : 'circle-outline'}
                size={16}
                color={biodata.photoVignette ? '#FFFFFF' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.vignetteBtnText,
                  biodata.photoVignette && { color: '#FFFFFF' },
                ]}
              >
                {biodata.photoVignette ? 'இயக்கப்பட்டுள்ளது (On)' : 'முடக்கப்பட்டுள்ளது (Off)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
  },
  cardSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  resetBtnText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },

  /* Studio Canvas Preview */
  studioCanvasContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  canvasDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  paperMockupBg: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFDF9',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FDE68A',
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  paperDark: {
    backgroundColor: '#1E293B',
    borderColor: '#B45309',
  },
  paperCornerStamp: {
    position: 'absolute',
    top: 6,
    left: 8,
  },
  paperCornerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
  },
  paperMockupLabel: {
    fontSize: 10,
    color: '#78350F',
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 2,
    textAlign: 'center',
  },
  viewportFrame: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTransformContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLayer: {
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    borderRadius: 999,
    borderWidth: 18,
    borderColor: 'rgba(0, 0, 0, 0.35)',
  },
  photoshopGuides: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.4)',
    borderStyle: 'dashed',
  },
  cornerHandle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#D97706',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  cornerTL: { top: -4, left: -4 },
  cornerTR: { top: -4, right: -4 },
  cornerBL: { bottom: -4, left: -4 },
  cornerBR: { bottom: -4, right: -4 },

  emptyPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyPlaceholderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 8,
  },
  emptyPlaceholderSub: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },

  hudBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  hudBadge: {
    backgroundColor: 'rgba(254, 243, 199, 0.9)',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hudDark: {
    backgroundColor: '#334155',
    borderColor: '#64748B',
  },
  hudBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },

  mainActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  uploadBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#991B1B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  uploadBigBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deletePhotoIconBtn: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
  },

  /* Tab Bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
  },
  tabBarDark: {
    backgroundColor: '#0F172A',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 6,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabItemActiveDark: {
    backgroundColor: '#334155',
  },
  tabItemText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabItemTextActive: {
    color: '#991B1B',
    fontWeight: '800',
  },
  tabItemTextActiveDark: {
    color: '#F59E0B',
    fontWeight: '800',
  },

  tabPanel: {
    paddingTop: 4,
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 4,
  },
  panelSub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 10,
  },

  /* Shapes Grid */
  shapesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  shapeCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  shapeCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  shapeCardActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#991B1B',
  },
  shapeCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  shapeCardDesc: {
    fontSize: 9.5,
    color: '#6B7280',
  },

  /* Controls Row */
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 12,
  },
  controlsRowDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  dpadWrapper: {
    alignItems: 'center',
  },
  dpadTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
  },
  dpadContainer: {
    alignItems: 'center',
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  dpadBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadBtnDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  dpadUp: { marginBottom: 2 },
  dpadDown: { marginTop: 2 },
  dpadLeft: { marginRight: 2 },
  dpadRight: { marginLeft: 2 },
  dpadCenter: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },

  quickToolsCol: {
    flex: 1,
    marginLeft: 18,
  },
  zoomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoomPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  zoomPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
  },
  zoomResetPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  zoomResetPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },

  frameSizeBar: {
    marginTop: 4,
  },
  frameSizeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
  },
  presetHeightRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizePill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sizePillDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  sizePillActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#991B1B',
  },
  sizePillActiveDark: {
    backgroundColor: '#7F1D1D',
    borderColor: '#F59E0B',
  },
  sizePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  sizePillTextActive: {
    color: '#991B1B',
    fontWeight: '700',
  },

  /* Background removal panel */
  bgRemovalCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  bgCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#B45309',
  },
  magicCutoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#B45309',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  magicCutoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  restoreOriginalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
  },
  restoreOriginalBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  sensitivitySection: {
    marginBottom: 10,
  },
  sensitivityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  sensitivityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sensChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
  },
  sensChipDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  sensChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#991B1B',
  },
  sensChipText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  sensChipTextActive: {
    color: '#991B1B',
    fontWeight: '700',
  },

  /* Enhancement tab */
  filterFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#991B1B',
  },
  filterPillSelectedDark: {
    backgroundColor: '#7F1D1D',
    borderColor: '#F59E0B',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterPillTextSelected: {
    color: '#991B1B',
    fontWeight: '800',
  },

  vignetteToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  vignetteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  vignetteBtnActive: {
    backgroundColor: '#047857',
  },
  vignetteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },

  /* Chips and Borders */
  chipsGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frameBorderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  frameBorderChipSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#991B1B',
  },
  frameBorderChipText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  frameBorderChipTextSelected: {
    color: '#991B1B',
    fontWeight: '700',
  },
  chipDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  pillDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  btnDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textMutedDark: {
    color: '#94A3B8',
  },

  /* Nero AI Style Comparison Buttons */
  compareToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  compareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compareBtnActive: {
    backgroundColor: '#991B1B',
    borderColor: '#7F1D1D',
  },
  compareBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  compareBtnTextActive: {
    color: '#FFFFFF',
  },

  /* Color Keying Swatches */
  colorSwatchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorSwatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  colorSwatchText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },

  /* Backdrops Grid */
  backdropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  backdropCard: {
    width: '48%',
    flexDirection: 'column',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    gap: 2,
  },
  backdropCardActive: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  backdropTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  backdropSub: {
    fontSize: 9,
    color: '#6B7280',
  },
  backdropDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },

  /* Upload Transparent PNG Button (remove.bg & Nero AI) */
  uploadTransparentPngBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#047857',
    borderRadius: 8,
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  uploadTransparentPngBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  uploadTransparentPngBtnSub: {
    color: '#D1FAE5',
    fontSize: 9.5,
    marginTop: 2,
    lineHeight: 13,
  },
  removeBgHelperBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    padding: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  removeBgHelperText: {
    flex: 1,
    fontSize: 10,
    color: '#92400E',
    lineHeight: 14,
  },

  /* Gesture Hint Row */
  gestureHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(254, 243, 199, 0.7)',
    borderRadius: 4,
  },
  gestureHintText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },

  /* Transparent Checkerboard Background Pattern */
  checkerboardBg: {
    backgroundColor: '#E5E7EB',
  },

  /* Quick Gradient & Backdrop Strip Styles */
  quickBackdropStrip: {
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 6,
    width: '100%',
  },
  quickBackdropTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  quickBackdropScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
    paddingRight: 10,
  },
  quickBackdropPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  quickBackdropPillActive: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  quickColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  quickBackdropPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
});
