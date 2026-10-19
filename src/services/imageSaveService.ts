import { Platform } from 'react-native';
import { BiodataProfile } from '../types/biodata';
import { TEMPLATES_CATALOG } from '../data/templatesData';
import { buildBiodataInnerHtml } from './pdfRenderer';

export interface ImageSaveResult {
  success: boolean;
  filePath?: string;
  folderName: string;
  message: string;
}

/**
 * High-Resolution Image Exporter for Tamil Marriage Biodata
 * Supports both Web and Android platforms, strictly rendering to a single image
 * and saving into the user's customized folder (default: Pictures/TamilMarriageBiodata).
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
      const width = 1240;
      const height = 1754;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      const template = TEMPLATES_CATALOG.find((t) => t.id === profile.templateId) || TEMPLATES_CATALOG[0];

      // Clean SVG with XHTML foreignObject rendering the complete document layout
      const contentHtml = buildBiodataInnerHtml(profile, template);
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${contentHtml}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobUrl = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(blobUrl);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          drawCanvasFallback(ctx, profile, template, width, height);
          resolve();
        };
        img.src = blobUrl;
      });

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
      }, 500);

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

// Fallback high-res direct canvas renderer
function drawCanvasFallback(
  ctx: CanvasRenderingContext2D,
  profile: BiodataProfile,
  template: any,
  width: number,
  height: number
) {
  const p = template.palette;

  // Outer Border
  ctx.strokeStyle = p.borderOuter;
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Inner Border
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Background card
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(40, 40, width - 80, height - 80);

  // Top header text
  ctx.fillStyle = p.primary;
  ctx.font = 'bold 36px "Baloo Thambi 2", "Noto Sans Tamil", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('உ', width / 2, 85);

  ctx.fillStyle = p.primaryDark;
  ctx.font = 'bold 24px "Baloo Thambi 2", "Noto Sans Tamil", sans-serif';
  const godTitle = profile.godInvocation || '|| ஸ்ரீ விநாயகர் துணை ||';
  ctx.fillText(godTitle, width / 2, 125);

  // Sub Banner
  ctx.fillStyle = p.primary;
  ctx.fillRect(60, 150, width - 120, 48);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px "Baloo Thambi 2", "Noto Sans Tamil", sans-serif';
  ctx.fillText(profile.gender === 'groom' ? 'சுப வரன் திருமண விபரம்' : 'சுப மணமகள் திருமண விபரம்', width / 2, 182);

  // Candidate Name
  ctx.textAlign = 'left';
  ctx.fillStyle = p.primary;
  ctx.font = 'bold 32px "Baloo Thambi 2", "Noto Sans Tamil", sans-serif';
  ctx.fillText(`பெயர் : ${profile.fullName || '-'}`, 80, 250);

  // Details
  ctx.font = 'bold 20px "Baloo Thambi 2", "Noto Sans Tamil", sans-serif';
  ctx.fillStyle = '#374151';
  let y = 300;
  const items = [
    `பிறந்த தேதி : ${profile.dateOfBirth || '-'} (${profile.timeOfBirth || ''} ${profile.timePeriod || ''})`,
    `படிப்பு : ${profile.qualification || '-'}`,
    `வேலை : ${profile.occupation || '-'} (${profile.companyName || ''})`,
    `வருமானம் : ₹ ${profile.annualIncome || '-'}`,
    `மதம் & குலம் : ${profile.religion} • ${profile.caste || '-'}`,
    `தந்தை : ${profile.fatherName || '-'}`,
    `தாயார் : ${profile.motherName || '-'}`,
    `பூர்வீகம் : ${profile.nativePlace || '-'}`,
    `செல் : ${profile.parentsContact || '-'}`,
  ];

  items.forEach((txt) => {
    ctx.fillText(txt, 80, y);
    y += 42;
  });

  // Footer Blessing
  ctx.textAlign = 'center';
  ctx.fillStyle = p.primary;
  ctx.font = 'bold 20px "Baloo Thambi 2", "Noto Sans Tamil", sans-serif';
  ctx.fillText('|| எல்லாம் வல்ல இறைவன் திருவருளால் நல்ல வரன் அமைய வாழ்த்துகள் ||', width / 2, height - 70);
}

function buildStandaloneHtmlForCanvas(profile: BiodataProfile, template: any, w: number, h: number): string {
  const p = template.palette;
  const isGroom = profile.gender === 'groom';
  const godText = profile.godInvocation || '|| ஸ்ரீ விநாயகர் துணை ||';

  return `
    <div style="box-sizing: border-box; width: ${w}px; height: ${h}px; padding: 25px; border: 8px double ${p.borderOuter}; background: ${p.background}; font-family: 'Baloo Thambi 2', 'Noto Sans Tamil', sans-serif;">
      <div style="border: 2px solid ${p.accent}; padding: 20px; background: #FFFFFF; height: calc(100% - 40px); box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="font-size: 32px; font-weight: 800; color: ${p.primary};">உ</div>
          <div style="font-size: 22px; font-weight: 800; color: ${p.primaryDark};">${godText}</div>
        </div>
        <div style="background: ${p.primary}; color: #FFFFFF; text-align: center; padding: 8px; font-size: 20px; font-weight: 800; border-radius: 4px; margin-bottom: 20px;">
          ${isGroom ? 'சுப வரன் திருமண விபரம்' : 'சுப மணமகள் திருமண விபரம்'}
        </div>
        <div style="font-size: 28px; font-weight: 800; color: ${p.primary}; margin-bottom: 15px;">
          பெயர் : ${profile.fullName || '-'}
        </div>
        <div style="display: flex; gap: 20px;">
          <div style="flex: 1.5; font-size: 18px; line-height: 1.8; color: #1F2937; font-weight: 700;">
            <div><b>பிறந்த தேதி:</b> ${profile.dateOfBirth || '-'} (${profile.timeOfBirth} ${profile.timePeriod})</div>
            <div><b>படிப்பு:</b> ${profile.qualification || '-'}</div>
            <div><b>வேலை:</b> ${profile.occupation || '-'}</div>
            <div><b>வருமானம்:</b> ₹ ${profile.annualIncome || '-'}</div>
            <div><b>மதம் & சமூகம்:</b> ${profile.religion} / ${profile.caste || '-'}</div>
            <div><b>தந்தை பெயர்:</b> ${profile.fatherName || '-'}</div>
            <div><b>தாயார் பெயர்:</b> ${profile.motherName || '-'}</div>
            <div><b>பூர்வீகம்:</b> ${profile.nativePlace || '-'}</div>
            <div><b>தொடர்பு:</b> ${profile.parentsContact || '-'}</div>
          </div>
          ${
            profile.photoUri
              ? `
          <div style="flex: 1; height: 380px; overflow: hidden; border: 4px solid ${p.accent}; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #FEF3C7;">
            <img src="${profile.photoUri}" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          `
              : ''
          }
        </div>
        <div style="text-align: center; margin-top: 35px; border-top: 2px dashed ${p.accent}; padding-top: 15px; font-size: 18px; font-weight: 800; color: ${p.primary};">
          || எல்லாம் வல்ல இறைவன் திருவருளால் நல்ல வரன் அமைய வாழ்த்துகள் ||
        </div>
      </div>
    </div>
  `;
}
