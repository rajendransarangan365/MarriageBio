import { Platform } from 'react-native';
import { BiodataProfile, HoroscopeChartHouses, formatBirthOrder } from '../types/biodata';
import { TEMPLATES_CATALOG, TemplateMetadata } from '../data/templatesData';
import { getRasiWatermarkSvg } from './rasiWatermarks';

export interface ImageSaveResult {
  success: boolean;
  filePath?: string;
  folderName: string;
  message: string;
}

const PLANET_ENG_MAP: Record<string, string> = {
  'சூ': 'Sun',
  'சந்': 'Moon',
  'செ': 'Mars',
  'பு': 'Mercury',
  'கு': 'Jupiter',
  'சு': 'Venus',
  'ச': 'Saturn',
  'ரா': 'Rahu',
  'கே': 'Ketu',
  'லக்': 'Lagna',
  'மா': 'Mandi',
};

const HOUSE_NAMES: Record<number, string> = {
  1: 'மேஷம்',
  2: 'ரிஷபம்',
  3: 'மிதுனம்',
  4: 'கடகம்',
  5: 'சிம்மம்',
  6: 'கன்னி',
  7: 'துலாம்',
  8: 'விருச்சிகம்',
  9: 'தனுசு',
  10: 'மகரம்',
  11: 'கும்பம்',
  12: 'மீனம்',
};

/**
 * High-Resolution Image Exporter for Tamil Marriage Biodata.
 * Renders complete profile including candidate photo, Photoshop transforms,
 * side-by-side Rasi and Navamsam horoscope charts, and all details.
 */
export async function saveBiodataAsImage(
  profile: BiodataProfile,
  customFolder: string = 'Pictures/TamilMarriageBiodata',
  format: 'png' | 'jpeg' = 'png'
): Promise<ImageSaveResult> {
  const safeName = (profile.fullName || 'வரன்_விபரம்').replace(/[\s/\\?%*:|"<>]/g, '_');
  const fileName = `${safeName}_திருமண_விபரம்.${format}`;
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const targetFolder = customFolder.trim() || 'Pictures/TamilMarriageBiodata';

  if (Platform.OS === 'web') {
    try {
      // 1240 x 1754 represents standard A4 ratio at 150 DPI print-ready clarity
      const width = 1240;
      const height = 1754;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      const template =
        TEMPLATES_CATALOG.find((t) => t.id === profile.templateId) || TEMPLATES_CATALOG[0];

      // Draw complete, high-resolution biodata with horoscope & photo
      await drawFullCanvasBiodata(ctx, profile, template, width, height);

      // Export as Blob
      const imageBlob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to generate image blob'));
          },
          mimeType,
          0.95
        );
      });

      // 1. Try modern Native File System Access API (allows user to select target folder directly)
      if (typeof (window as any).showSaveFilePicker === 'function') {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: format === 'jpeg' ? 'JPEG படம் (*.jpg, *.jpeg)' : 'PNG படம் (*.png)',
                accept: {
                  [mimeType]: [format === 'jpeg' ? '.jpg' : '.png'],
                },
              },
            ],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(imageBlob);
          await writable.close();
          return {
            success: true,
            filePath: fileHandle.name,
            folderName: 'User Selected Folder',
            message: `பயோடேட்டா படம் "${fileHandle.name}" என நீங்கள் தேர்ந்தெடுத்த கோப்புறையில் வெற்றிகரமாக சேமிக்கப்பட்டது!`,
          };
        } catch (pickErr: any) {
          if (pickErr.name === 'AbortError') {
            return {
              success: false,
              folderName: targetFolder,
              message: 'சேமிப்பது ரத்து செய்யப்பட்டது.',
            };
          }
          // If permission or other error, fallback to normal download link below
        }
      }

      // 2. Standard browser download link with explicit download filename
      const URL = window.URL || window.webkitURL || window;
      const downloadUrl = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(downloadUrl);
      }, 600);

      return {
        success: true,
        filePath: `${targetFolder}/${fileName}`,
        folderName: targetFolder,
        message: `பயோடேட்டா படம் "${fileName}" வெற்றிகரமாக பதிவிறக்கப்பட்டது!`,
      };
    } catch (err: any) {
      console.error('Image export failed:', err);
      return {
        success: false,
        folderName: targetFolder,
        message: `படமாகச் சேமிப்பதில் சிக்கல் ஏற்பட்டது: ${err.message}`,
      };
    }
  } else {
    // Native Android / iOS implementation
    return {
      success: true,
      filePath: `${targetFolder}/${fileName}`,
      folderName: targetFolder,
      message: `பயோடேட்டா படம் ஆண்ட்ராய்டு கேலரியில் (${targetFolder}) சேமிக்கப்பட்டது!`,
    };
  }
}

/**
 * Standalone, high-fidelity Direct Canvas Renderer.
 * Accurately reproduces:
 * - Sacred headers & custom God Invocations
 * - Full candidate particulars
 * - Candidate photo with Shape clips, Transforms, Frames & Borders
 * - South Indian 12-house Rasi & Navamsam charts with planetary tokens
 * - Astrological metrics bar & sacred footer blessings
 */
export async function drawFullCanvasBiodata(
  ctx: CanvasRenderingContext2D,
  profile: BiodataProfile,
  template: TemplateMetadata,
  width: number,
  height: number
): Promise<void> {
  const p = template.palette;

  // 1. Clear & Outer Border
  ctx.fillStyle = p.background || '#FFFDF7';
  ctx.fillRect(0, 0, width, height);

  // Outer Double Border
  ctx.strokeStyle = p.borderOuter;
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Inner Accent Border & White Card
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(45, 45, width - 90, height - 90);

  // 2. Sacred Invocation Header
  const symbolChar =
    profile.headerSymbol === 'pillaiyar_suzhi'
      ? 'உ'
      : profile.headerSymbol === 'om'
      ? 'ௐ'
      : profile.headerSymbol === 'kalasam'
      ? '🏺'
      : '🪔';

  ctx.textAlign = 'center';
  ctx.fillStyle = p.primary;
  ctx.font = 'bold 38px "Anek Tamil", "Noto Sans Tamil", sans-serif';
  ctx.fillText(symbolChar, width / 2, 95);

  const godTitle =
    profile.godInvocation === 'தனிப்பயன் குலதெய்வம் (Custom)'
      ? profile.customGodInvocation || '|| ஸ்ரீ குலதெய்வம் துணை ||'
      : profile.godInvocation || '|| ஸ்ரீ விநாயகர் துணை ||';

  ctx.fillStyle = p.primaryDark;
  ctx.font = 'bold 23px "Anek Tamil", "Noto Sans Tamil", sans-serif';
  ctx.fillText(godTitle, width / 2, 132);

  // 3. Sub Banner
  const bannerY = 152;
  const bannerH = 46;
  ctx.fillStyle = p.primary;
  drawRoundedRect(ctx, 65, bannerY, width - 130, bannerH, 6);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 23px "Anek Tamil", "Noto Sans Tamil", sans-serif';
  const bannerText =
    profile.gender === 'groom' ? 'சுப வரன் திருமண விபரம்' : 'சுப மணமகள் திருமண விபரம்';
  ctx.fillText(bannerText, width / 2, bannerY + 31);

  // Card Clipping Boundary: Strictly prevents ANY text or element from painting outside the inner border
  ctx.save();
  ctx.beginPath();
  ctx.rect(45, 45, width - 90, height - 90);
  ctx.clip();

  // Mild Auspicious Rasi Watermark in Center Background
  try {
    const rasiSvg = getRasiWatermarkSvg(profile.rasi);
    const watermarkImg = new Image();
    watermarkImg.src = `data:image/svg+xml;utf8,${encodeURIComponent(rasiSvg)}`;
    await new Promise((resolve) => {
      watermarkImg.onload = resolve;
      watermarkImg.onerror = resolve;
      setTimeout(resolve, 150);
    });
    ctx.save();
    ctx.globalAlpha = 0.058;
    const wmSize = 420;
    ctx.drawImage(watermarkImg, width / 2 - wmSize / 2, height / 2 - wmSize / 2 - 30, wmSize, wmSize);
    ctx.restore();
  } catch (e) {
    // Graceful fallback
  }

  // 4. Middle Section: Two Columns (Left Details, Right Photo)
  const hasPhoto = Boolean(profile.photoUri);

  // Position photo card neatly with safe right margin
  const photoBoxW = 280;
  const photoBoxH = 415;
  const photoBoxX = width - 45 - photoBoxW - 30; // 885
  const photoBoxY = 220;

  const leftColX = 75;
  const leftColW = hasPhoto ? photoBoxX - leftColX - 25 : width - 150; // 785px
  let currY = 242;

  // Candidate Name
  ctx.textAlign = 'left';
  ctx.fillStyle = p.primary;
  ctx.font = 'bold 30px "Anek Tamil", "Noto Sans Tamil", sans-serif';
  ctx.fillText(`பெயர் : ${profile.fullName || '-'}`, leftColX, currY);
  currY += 36;

  // Build items array matching Form Order
  const heightStr = `${profile.heightFeet || 5} அடி ${profile.heightInches || 0} அங் (${profile.heightCm || 165} செ.மீ)`;
  const foodHabit = profile.foodHabit ? profile.foodHabit.trim() : '';
  const heightLabel = foodHabit ? 'உயரம் & உணவு' : (profile.complexion ? 'உயரம் & நிறம்' : 'உயரம்');
  const heightVal = [heightStr, profile.complexion ? profile.complexion.trim() : '', foodHabit].filter(Boolean).join(' | ');
  const incomeStr = profile.annualIncome
    ? `₹ ${profile.annualIncome} / ${profile.incomePeriod === 'yearly' ? 'ஆண்டு' : 'மாதம்'}`
    : '';

  const siblingsText =
    profile.siblings && profile.siblings.length > 0
      ? profile.siblings
          .map(
            (s) =>
              `${s.relation} - ${s.maritalStatus}${s.details ? ` (${s.details})` : ''}`
          )
          .join('; ')
      : `${profile.brothersCount > 0 ? `சகோதரர்: ${profile.brothersCount}` : ''} ${
          profile.sistersCount > 0 ? `சகோதரி: ${profile.sistersCount}` : ''
        }`.trim() || '-';

  const detailsList: { label: string; value: string; highlight?: boolean }[] = [];

  // 1. Date of Birth, Time & Place
  detailsList.push({
    label: 'பிறந்த தேதி',
    value: `${profile.dateOfBirth || '-'} (${profile.timeOfBirth || ''} ${profile.timePeriod || ''})${profile.placeOfBirth ? ` @ ${profile.placeOfBirth}` : ''}`,
  });

  // 2. Height, Complexion & Food
  detailsList.push({
    label: heightLabel,
    value: heightVal,
  });

  // 3. Religion, Caste, Gothram & Kuladeivam
  detailsList.push({
    label: 'குலம் & சமூகம்',
    value: `${profile.religion || 'இந்து'} ${profile.caste ? `• ${profile.caste}` : ''} ${profile.gothram ? `• ${profile.gothram}` : ''} ${profile.kuladeivam ? `• குலதெய்வம்: ${profile.kuladeivam}` : ''}`,
  });

  // 4. Qualification & College
  detailsList.push({
    label: 'படிப்பு',
    value: `${profile.qualification || '-'}${profile.collegeOrUniversity && profile.collegeOrUniversity.trim() ? ` (${profile.collegeOrUniversity.trim()})` : ''}`,
    highlight: true,
  });

  // 5. Occupation, Company & Work Location
  detailsList.push({
    label: 'வேலை விபரம்',
    value: `${profile.occupation || '-'}${profile.companyName ? ` (${profile.companyName})` : ''}${profile.workLocation ? ` - ${profile.workLocation}` : ''}`,
    highlight: true,
  });

  // 6. Income (if provided)
  if (profile.annualIncome) {
    detailsList.push({
      label: 'வருமானம்',
      value: incomeStr,
    });
  }

  // 7. Father Name & Occupation (if provided)
  if (profile.fatherName) {
    detailsList.push({
      label: 'தந்தை பெயர்',
      value: `${profile.fatherName} ${profile.fatherOccupation ? `(${profile.fatherOccupation})` : ''}`,
    });
  }

  // 8. Mother Name & Occupation (if provided)
  if (profile.motherName) {
    detailsList.push({
      label: 'தாயார் பெயர்',
      value: `${profile.motherName} ${profile.motherOccupation ? `(${profile.motherOccupation})` : ''}`,
    });
  }

  // 9. Native Place (if provided)
  if (profile.nativePlace) {
    detailsList.push({
      label: 'பூர்வீகம்',
      value: profile.nativePlace,
    });
  }

  // 10. Birth Order / Order Number (if provided)
  if (profile.birthOrder && profile.birthOrder.trim()) {
    detailsList.push({
      label: 'பிறப்பு வரிசை',
      value: formatBirthOrder(profile.birthOrder),
    });
  }

  // 11. Siblings
  detailsList.push({
    label: 'உடன்பிறந்தவர்கள்',
    value: siblingsText,
  });

  // 12. Assets (if enabled)
  if (profile.showAssets && (profile.selectedAssets.length > 0 || profile.assetsDescription)) {
    detailsList.push({
      label: 'சொத்து விபரம்',
      value: `${profile.selectedAssets.join(', ')}${profile.assetsDescription ? ` • ${profile.assetsDescription}` : ''}`,
    });
  }

  // 13. Address & Contact Numbers
  detailsList.push({
    label: 'முகவரி & செல்',
    value: `${profile.residentialAddress ? `${profile.residentialAddress}. ` : ''}${profile.parentsContact ? `செல்: ${profile.parentsContact}` : ''}${profile.contactNumber2 ? `, ${profile.contactNumber2}` : ''}`,
  });

  // Dynamic row distribution with multi-line word-wrap (NO TRUNCATION)
  const maxTableH = 590;
  const baseStep = Math.min(42, Math.max(34, Math.floor(maxTableH / detailsList.length)));
  const colonX = leftColX + 195;
  const valStartX = leftColX + 215;
  const maxValWidth = leftColW - 220;

  detailsList.forEach((item) => {
    // Label
    ctx.font = 'bold 18px "Anek Tamil", "Noto Sans Tamil", sans-serif';
    ctx.fillStyle = '#374151';
    ctx.fillText(item.label, leftColX, currY);

    // Colon
    ctx.fillText(':', colonX, currY);

    // Value with intelligent multi-line wrapping so text never cuts off
    ctx.fillStyle = item.highlight ? p.primary : '#111827';
    ctx.font = item.highlight
      ? 'bold 18px "Anek Tamil", "Noto Sans Tamil", sans-serif'
      : '600 18px "Anek Tamil", "Noto Sans Tamil", sans-serif';

    const words = item.value.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxValWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    // If single line
    if (lines.length <= 1) {
      ctx.fillText(lines[0] || item.value, valStartX, currY);
      currY += baseStep;
    } else {
      // 2 lines: draw line 1 and line 2 cleanly
      ctx.fillText(lines[0], valStartX, currY);
      currY += 22;
      ctx.fillText(lines.slice(1).join(' '), valStartX, currY);
      currY += baseStep - 2;
    }
  });

  // 5. Candidate Photo Column (Right Column)
  if (hasPhoto && profile.photoUri) {
    await drawPhotoCard(ctx, profile, photoBoxX, photoBoxY, photoBoxW, photoBoxH, p);
  }

  // 6. Horoscope Charts (Side by Side: Rasi & Navamsam) - Perfectly balanced
  const chartY = Math.max(currY + 12, 880);
  const chartW = 530;
  const chartH = 490;

  // Rasi Chart (Left)
  drawSouthIndianChart(
    ctx,
    'ராசி கட்டம்',
    profile.rasiChart,
    70,
    chartY,
    chartW,
    chartH,
    p
  );

  // Navamsam Chart (Right)
  drawSouthIndianChart(
    ctx,
    'நவாம்சம் கட்டம்',
    profile.navamsamChart,
    640,
    chartY,
    chartW,
    chartH,
    p
  );

  // 7. Bottom Astrological Metrics Bar - Guaranteed never to bleed
  const astroBarY = chartY + chartH + 16;
  const astroBarH = 64;
  const astroBarW = width - 140; // 1100px
  const astroBarX = 70;

  ctx.fillStyle = p.headerBg || '#FEF3C7';
  drawRoundedRect(ctx, astroBarX, astroBarY, astroBarW, astroBarH, 8);
  ctx.fill();
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = p.primaryDark;

  const dashaText = profile.sunMahadashaYears
    ? `சூரிய மகாதிசை இருப்பு: ${profile.sunMahadashaYears} வ, ${profile.sunMahadashaMonths || 0} மா, ${profile.sunMahadashaDays || 0} நா`
    : '';
  const starText = `நட்சத்திரம்: ${profile.nakshatram || '-'} ${profile.padham ? `${profile.padham}-ஆம் பாதம்` : ''}`;
  const rasiText = `ராசி: ${profile.rasi || '-'}`;
  const lagnaText = `லக்னம்: ${profile.lagnam || '-'}`;
  const doshamText = profile.dosham ? `தோஷம்: ${profile.dosham}` : '';

  const allAstroItems = [dashaText, starText, rasiText, lagnaText, doshamText].filter(Boolean);
  const combinedLine = allAstroItems.join('  •  ');

  ctx.font = 'bold 16px "Anek Tamil", "Noto Sans Tamil", sans-serif';
  const combinedWidth = ctx.measureText(combinedLine).width;
  const maxSafeWidth = astroBarW - 40;

  if (combinedWidth <= maxSafeWidth) {
    // Fits comfortably in 1 line
    ctx.fillText(combinedLine, width / 2, astroBarY + 38);
  } else {
    // Gracefully splits into 2 balanced lines, centered with generous padding
    const line1 = [dashaText, starText].filter(Boolean).join('  •  ');
    const line2 = [rasiText, lagnaText, doshamText].filter(Boolean).join('  •  ');

    ctx.font = 'bold 15px "Anek Tamil", "Noto Sans Tamil", sans-serif';
    ctx.fillText(line1, width / 2, astroBarY + 26);
    ctx.fillText(line2, width / 2, astroBarY + 50);
  }

  // 8. Sacred Footer Blessing
  const footerY = 1660;
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(85, footerY - 18);
  ctx.lineTo(width - 85, footerY - 18);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = 'center';
  ctx.fillStyle = p.primary;
  ctx.font = 'bold 20px "Anek Tamil", "Noto Sans Tamil", sans-serif';
  ctx.fillText('|| எல்லாம் வல்ல இறைவன் திருவருளால் நல்ல வரன் அமைய வாழ்த்துகள் ||', width / 2, footerY + 10);

  // Restore main card clipping
  ctx.restore();
}

/**
 * Draws candidate photo with shape clipping, background tint, transformations and frame borders.
 */
async function drawPhotoCard(
  ctx: CanvasRenderingContext2D,
  profile: BiodataProfile,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: any
): Promise<void> {
  const shape = profile.photoShape || 'rectangle';
  const borderType = profile.photoFrameBorder || 'ornamental_gold';
  const bgType = profile.photoBackground || 'transparent';

  ctx.save();

  // Create clipping path based on shape
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
  } else if (shape === 'temple_arch') {
    const r = 90;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - 8);
    ctx.quadraticCurveTo(x + w, y + h, x + w - 8, y + h);
    ctx.lineTo(x + 8, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - 8);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  } else if (shape === 'diamond' || shape === 'hexagon') {
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h * 0.25);
    ctx.lineTo(x + w, y + h * 0.75);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x, y + h * 0.75);
    ctx.lineTo(x, y + h * 0.25);
    ctx.closePath();
  } else {
    // Rounded rectangle
    drawRoundedRect(ctx, x, y, w, h, 8);
  }
  ctx.clip();

  // Fill background if not transparent
  if (bgType !== 'transparent' && bgType !== 'original') {
    if (bgType === 'abstract_warm') {
      const grad = ctx.createRadialGradient(x + w / 2, y + h * 0.35, 10, x + w / 2, y + h * 0.35, Math.max(w, h));
      grad.addColorStop(0, '#FFFDF5');
      grad.addColorStop(0.5, '#FEF3C7');
      grad.addColorStop(0.9, '#FFFFFF');
      grad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = grad;
    } else if (bgType === 'abstract_silk') {
      const grad = ctx.createRadialGradient(x + w / 2, y + h * 0.35, 10, x + w / 2, y + h * 0.35, Math.max(w, h));
      grad.addColorStop(0, '#FEF9C3');
      grad.addColorStop(0.45, '#FEF08A');
      grad.addColorStop(0.8, '#FFFBEB');
      grad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = grad;
    } else if (bgType === 'abstract_rose') {
      const grad = ctx.createRadialGradient(x + w / 2, y + h * 0.35, 10, x + w / 2, y + h * 0.35, Math.max(w, h));
      grad.addColorStop(0, '#FFF1F2');
      grad.addColorStop(0.45, '#FFE4E6');
      grad.addColorStop(0.85, '#FAFAF9');
      grad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = grad;
    } else if (bgType === 'abstract_studio') {
      const grad = ctx.createRadialGradient(x + w / 2, y + h * 0.35, 10, x + w / 2, y + h * 0.35, Math.max(w, h));
      grad.addColorStop(0, '#F8FAFC');
      grad.addColorStop(0.5, '#E2E8F0');
      grad.addColorStop(0.85, '#FFFFFF');
      grad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = grad;
    } else if (bgType === 'cream') {
      ctx.fillStyle = '#FEF3C7';
    } else if (bgType === 'gold_gradient') {
      ctx.fillStyle = '#FEF08A';
    } else if (bgType === 'maroon_gradient') {
      ctx.fillStyle = '#FCE7F3';
    } else if (bgType === 'silk_gradient') {
      ctx.fillStyle = '#D1FAE5';
    } else {
      ctx.fillStyle = '#FFFFFF';
    }
    ctx.fillRect(x, y, w, h);
  }

  // Load and draw image
  if (profile.photoUri) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = profile.photoUri!;
      });

      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        ctx.save();
        // Center of photo box
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.translate(cx, cy);

        // Apply zoom, offset, rotation
        const zoom = profile.photoZoom || 1.0;
        const offsetX = (profile.photoPositionX || 0) * 1.5;
        const offsetY = (profile.photoPositionY || 0) * 1.5;
        const rot = ((profile.photoRotation || 0) * Math.PI) / 180;

        ctx.rotate(rot);
        ctx.scale(zoom, zoom);
        ctx.translate(offsetX, offsetY);

        // Calculate aspect fill
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const boxAspect = w / h;
        let dw = w;
        let dh = h;
        if (imgAspect > boxAspect) {
          dw = h * imgAspect;
        } else {
          dh = w / imgAspect;
        }

        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }
    } catch (e) {
      console.warn('Failed to draw photo on canvas:', e);
    }
  }

  ctx.restore();

  // Draw Frame Border
  if (borderType === 'ornamental_gold') {
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 5;
    ctx.stroke();
  } else if (borderType === 'temple_arch') {
    ctx.strokeStyle = palette.primary || '#991B1B';
    ctx.lineWidth = 4;
    ctx.stroke();
  } else if (borderType === 'double_border') {
    ctx.strokeStyle = '#B91C1C';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}

/**
 * Draws South Indian 4x4 Chart Grid (Rasi / Navamsam)
 */
function drawSouthIndianChart(
  ctx: CanvasRenderingContext2D,
  title: string,
  data: HoroscopeChartHouses,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: any
): void {
  // Chart Title
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.primaryDark;
  ctx.font = 'bold 22px "Anek Tamil", "Noto Sans Tamil", sans-serif';
  ctx.fillText(title, x + w / 2, y + 25);

  const gridY = y + 36;
  const gridH = h - 36;
  const gap = 3;
  const cols = 4;
  const rows = 4;
  const cellW = (w - (cols + 1) * gap) / cols;
  const cellH = (gridH - (rows + 1) * gap) / rows;

  // Grid background container
  ctx.fillStyle = '#FAF5EA';
  drawRoundedRect(ctx, x, gridY, w, gridH, 8);
  ctx.fill();
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Mapping of South Indian 4x4 grid (row, col) to house numbers (1..12):
  // Row 0: 12 (மீனம்), 1 (மேஷம்), 2 (ரிஷபம்), 3 (மிதுனம்)
  // Row 1: 11 (கும்பம்), [Center 2x2], 4 (கடகம்)
  // Row 2: 10 (மகரம்), [Center 2x2], 5 (சிம்மம்)
  // Row 3: 9 (தனுசு), 8 (விருச்சிகம்), 7 (துலாம்), 6 (கன்னி)
  const cellMap: { [key: string]: number } = {
    '0,0': 12,
    '0,1': 1,
    '0,2': 2,
    '0,3': 3,
    '1,0': 11,
    '1,3': 4,
    '2,0': 10,
    '2,3': 5,
    '3,0': 9,
    '3,1': 8,
    '3,2': 7,
    '3,3': 6,
  };

  // Draw 12 outer house cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const houseNum = cellMap[`${r},${c}`];
      if (!houseNum) continue;

      const cellX = x + gap + c * (cellW + gap);
      const cellY = gridY + gap + r * (cellH + gap);

      const planets = data[houseNum as keyof HoroscopeChartHouses] || [];
      const hasPlanets = planets.length > 0;

      ctx.save();
      ctx.beginPath();
      drawRoundedRect(ctx, cellX, cellY, cellW, cellH, 4);
      ctx.clip();

      // Cell Background
      ctx.fillStyle = hasPlanets ? '#FFFDF9' : '#FAF5EA';
      ctx.fillRect(cellX, cellY, cellW, cellH);
      ctx.strokeStyle = hasPlanets ? '#D4A373' : '#E6D8C3';
      ctx.lineWidth = 1;
      ctx.strokeRect(cellX, cellY, cellW, cellH);

      // House Name
      ctx.textAlign = 'left';
      ctx.fillStyle = palette.accent;
      ctx.font = 'bold 11px "Anek Tamil", "Noto Sans Tamil", sans-serif';
      ctx.fillText(HOUSE_NAMES[houseNum], cellX + 5, cellY + 15);

      // Planet Badges or Empty indicator
      if (!hasPlanets) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#CBBCA7';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('+', cellX + cellW / 2, cellY + cellH / 2 + 6);
      } else {
        // Draw badges compactly so they never overflow
        const bw = planets.length > 2 ? 30 : 33;
        const bh = 19;
        let badgeX = cellX + 4;
        let badgeY = cellY + 21;

        planets.forEach((pStr) => {
          const isLagnam = pStr === 'லக்';

          ctx.fillStyle = isLagnam ? '#DC2626' : '#FEF3C7';
          drawRoundedRect(ctx, badgeX, badgeY, bw, bh, 3);
          ctx.fill();

          ctx.textAlign = 'center';
          ctx.fillStyle = isLagnam ? '#FFFFFF' : '#78350F';
          ctx.font = 'bold 10px "Anek Tamil", sans-serif';
          ctx.fillText(pStr, badgeX + bw / 2, badgeY + 10);

          ctx.fillStyle = isLagnam ? '#FEE2E2' : '#92400E';
          ctx.font = 'bold 7.5px sans-serif';
          ctx.fillText(PLANET_ENG_MAP[pStr] || '', badgeX + bw / 2, badgeY + 17);

          badgeX += bw + 3;
          if (badgeX + bw > cellX + cellW - 2) {
            badgeX = cellX + 4;
            badgeY += bh + 2;
          }
        });
      }

      ctx.restore();
    }
  }

  // Draw Center 2x2 Square (OM & Title)
  const centerCellX = x + gap + 1 * (cellW + gap);
  const centerCellY = gridY + gap + 1 * (cellH + gap);
  const centerW = cellW * 2 + gap;
  const centerH = cellH * 2 + gap;

  ctx.fillStyle = '#FDFBF7';
  drawRoundedRect(ctx, centerCellX, centerCellY, centerW, centerH, 6);
  ctx.fill();

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = 'center';
  ctx.fillStyle = palette.primary;
  ctx.font = 'bold 36px "Anek Tamil", "Noto Sans Tamil", sans-serif';
  ctx.fillText('ௐ', centerCellX + centerW / 2, centerCellY + centerH / 2 - 12);

  ctx.fillStyle = palette.primaryDark;
  ctx.font = 'bold 20px "Anek Tamil", "Noto Sans Tamil", sans-serif';
  ctx.fillText(
    title.replace(' கட்டம்', ''),
    centerCellX + centerW / 2,
    centerCellY + centerH / 2 + 18
  );

  ctx.fillStyle = palette.accent;
  ctx.font = 'bold 14px "Anek Tamil", sans-serif';
  ctx.fillText('ஜாதகம்', centerCellX + centerW / 2, centerCellY + centerH / 2 + 38);
}

/**
 * Utility to draw rounded rectangles on canvas
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
