import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { BiodataProfile, HoroscopeChartHouses, formatBirthOrder } from '../types/biodata';
import { TEMPLATES_CATALOG, TemplateMetadata } from '../data/templatesData';
import { getRasiWatermarkSvg, RASI_WATERMARKS } from './rasiWatermarks';

export const KUMBAM_WATERMARK_SVG = RASI_WATERMARKS['kumbam'];

export async function generateAndSharePdf(profile: BiodataProfile): Promise<string | null> {
  try {
    const template =
      TEMPLATES_CATALOG.find((t) => t.id === profile.templateId) || TEMPLATES_CATALOG[0];

    const html = buildBiodataHtml(profile, template);

    // On Web: use an iframe to print directly without navigating away or opening blank windows
    if (Platform.OS === 'web') {
      const iframeId = 'biodata-print-frame';
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
      if (iframe) {
        iframe.remove();
      }

      iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.style.zIndex = '-9999';
      iframe.style.border = 'none';
      const triggerPrint = () => {
        try {
          iframe?.contentWindow?.focus();
          iframe?.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print error, falling back to window.print:', e);
          window.print();
        }
      };

      // Auto-cleanup after print dialog closes
      try {
        iframe.contentWindow?.addEventListener('afterprint', () => {
          setTimeout(() => iframe?.remove(), 500);
        });
      } catch (e) {}

      iframe.onload = () => {
        const frameDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
        if (!frameDoc) {
          triggerPrint();
          return;
        }

        // Ensure all images are fully loaded and decoded before triggering print
        const imgs: HTMLImageElement[] = Array.from(frameDoc.images || []) as HTMLImageElement[];
        if (imgs.length === 0) {
          setTimeout(triggerPrint, 350);
        } else {
          let hasTriggered = false;
          const safeTrigger = () => {
            if (!hasTriggered) {
              hasTriggered = true;
              // Short grace period for browser paint pipeline to commit decoded image
              setTimeout(triggerPrint, 400);
            }
          };

          const promises = imgs.map((img: HTMLImageElement) => {
            if (img.complete && img.naturalWidth > 0) {
              return Promise.resolve();
            }
            if (typeof (img as any).decode === 'function') {
              return (img as any).decode().catch(() => {});
            }
            return new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });
          });

          Promise.all(promises).then(safeTrigger).catch(safeTrigger);

          // Safety timeout so print dialog always opens
          setTimeout(safeTrigger, 3000);
        }
      };

      document.body.appendChild(iframe);
      // Using srcdoc prevents Chromium from pushing an 'about:blank' entry into window.history
      iframe.srcdoc = html;

      return 'web-print-triggered';
    }

    // On iOS / Android: Native PDF generation via expo-print
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `${profile.fullName}_வரன்_விபரம்.pdf`,
      });
    }

    return uri;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

export function buildBiodataInnerHtml(profile: BiodataProfile, template: TemplateMetadata): string {
  const isGroom = profile.gender === 'groom';
  const colors = template.palette;

  const godText =
    profile.godInvocation === 'தனிப்பயன் குலதெய்வம் (Custom)'
      ? profile.customGodInvocation || '|| ஸ்ரீ குலதெய்வம் துணை ||'
      : profile.godInvocation;

  const symbolHtml =
    profile.headerSymbol === 'pillaiyar_suzhi'
      ? `<span class="symbol-text">உ</span>`
      : profile.headerSymbol === 'om'
      ? `<span class="symbol-text">ௐ</span>`
      : profile.headerSymbol === 'kalasam'
      ? `<span class="symbol-text">🏺</span>`
      : `<span class="symbol-text">🪔</span>`;

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

  // Helper for 12-house South Indian chart HTML (Image 2 Design: 4x4 card grid)
  const buildChartHtml = (
    title: string,
    chartData: HoroscopeChartHouses
  ) => {
    const houseNames: Record<number, string> = {
      1: 'மேஷம்', 2: 'ரிஷபம்', 3: 'மிதுனம்', 4: 'கடகம்',
      5: 'சிம்மம்', 6: 'கன்னி', 7: 'துலாம்', 8: 'விருச்சிகம்',
      9: 'தனுசு', 10: 'மகரம்', 11: 'கும்பம்', 12: 'மீனம்',
    };

    const renderCell = (num: number) => {
      const planets = chartData[num as keyof HoroscopeChartHouses] || [];
      const hasPlanets = planets.length > 0;
      const content = hasPlanets
        ? `<div class="planets-card-grid">
            ${planets.map((p: string) => `
              <div class="planet-badge-item ${p === 'லக்' ? 'lagnam' : ''}">
                <span class="planet-tam ${p === 'லக்' ? 'lagnam' : ''}">${p}</span>
                <span class="planet-eng">${PLANET_ENG_MAP[p] || ''}</span>
              </div>
            `).join('')}
          </div>`
        : `<div class="empty-plus">+</div>`;

      return `
        <div class="chart-cell ${hasPlanets ? 'occupied' : ''}">
          <div class="house-name">${houseNames[num]}</div>
          ${content}
        </div>
      `;
    };

    return `
      <div class="chart-box">
        <div class="chart-title">${title}</div>
        <div class="chart-grid">
          <!-- Row 1 -->
          ${renderCell(12)}
          ${renderCell(1)}
          ${renderCell(2)}
          ${renderCell(3)}

          <!-- Row 2 -->
          ${renderCell(11)}
          <div class="chart-center">
            <div class="center-om">ௐ</div>
            <div class="center-title">${title.replace(' கட்டம்', '')}</div>
            <div class="center-sub">ஜாதகம்</div>
          </div>
          ${renderCell(4)}

          <!-- Row 3 -->
          ${renderCell(10)}
          ${renderCell(5)}

          <!-- Row 4 -->
          ${renderCell(9)}
          ${renderCell(8)}
          ${renderCell(7)}
          ${renderCell(6)}
        </div>
      </div>
    `;
  };

  // Siblings string
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

  // Height and food string
  const heightStr = `${profile.heightFeet || 5} அடி ${profile.heightInches || 0} அங் (${profile.heightCm || 165} செ.மீ)`;
  const foodStr = profile.foodHabit || 'அசைவம் (Non-Veg)';

  // Income string
  const incomeStr = profile.annualIncome
    ? `₹ ${profile.annualIncome} / ${profile.incomePeriod === 'yearly' ? 'ஆண்டு' : 'மாதம்'}`
    : '-';

  // Auspicious Watermark matching candidate's Rasi
  const rasiWatermarkSvg = getRasiWatermarkSvg(profile.rasi);

  // Photo Photoshop transform properties
  const zoom = profile.photoZoom || 1.0;
  const posX = profile.photoPositionX || 0;
  const posY = profile.photoPositionY || 0;
  const rotation = profile.photoRotation || 0;
  const brightness = profile.photoBrightness || 100;
  const contrast = profile.photoContrast || 100;
  const isCutout = profile.photoLayout === 'standing_cutout';

  // Background tint
  const getPhotoBgCss = () => {
    switch (profile.photoBackground) {
      case 'cream': return '#FEF3C7';
      case 'gold_gradient': return '#FEF08A';
      case 'maroon_gradient': return '#FCE7F3';
      case 'silk_gradient': return '#D1FAE5';
      case 'transparent':
      default: return 'transparent';
    }
  };

  // Photo shape styling with Gaussian blur / abstract spread effects
  const getPhotoShapeCss = () => {
    switch (profile.photoShape) {
      case 'circle':
        return 'border-radius: 999px; overflow: hidden;';
      case 'temple_arch':
        return 'border-top-left-radius: 95px; border-top-right-radius: 95px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; overflow: hidden;';
      case 'hexagon':
      case 'diamond':
        return 'clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); overflow: hidden;';
      case 'scallop':
        return 'border-top-left-radius: 50px; border-bottom-right-radius: 50px; border-top-right-radius: 16px; border-bottom-left-radius: 16px; overflow: hidden;';
      case 'gaussian_blur':
        return 'border: none !important; border-radius: 0; mask-image: radial-gradient(ellipse 82% 88% at 50% 50%, #000 48%, rgba(0,0,0,0) 96%); -webkit-mask-image: radial-gradient(ellipse 82% 88% at 50% 50%, #000 48%, rgba(0,0,0,0) 96%); mask-size: 100% 100%; -webkit-mask-size: 100% 100%;';
      case 'feather_bottom':
        return 'border: none !important; mask-image: linear-gradient(to bottom, #000 62%, rgba(0,0,0,0.4) 86%, rgba(0,0,0,0) 98%); -webkit-mask-image: linear-gradient(to bottom, #000 62%, rgba(0,0,0,0.4) 86%, rgba(0,0,0,0) 98%); mask-size: 100% 100%; -webkit-mask-size: 100% 100%;';
      case 'feather_abstract':
        return 'border: none !important; border-radius: 0; mask-image: radial-gradient(circle at 50% 45%, #000 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.15) 85%, transparent 100%); -webkit-mask-image: radial-gradient(circle at 50% 45%, #000 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.15) 85%, transparent 100%); mask-size: 100% 100%; -webkit-mask-size: 100% 100%;';
      case 'feather_temple':
        return 'border-top-left-radius: 95px; border-top-right-radius: 95px; mask-image: linear-gradient(to bottom, #000 68%, rgba(0,0,0,0) 98%); -webkit-mask-image: linear-gradient(to bottom, #000 68%, rgba(0,0,0,0) 98%); mask-size: 100% 100%; -webkit-mask-size: 100% 100%;';
      case 'rectangle':
      default:
        return 'border-radius: 8px; overflow: hidden;';
    }
  };

  // Border style
  const getPhotoBorderCss = () => {
    if (['gaussian_blur', 'feather_bottom', 'feather_abstract', 'feather_temple'].includes(profile.photoShape)) {
      return 'border: none;';
    }
    switch (profile.photoFrameBorder) {
      case 'ornamental_gold':
        return 'border: 3.5px solid #D97706; box-shadow: 0 4px 10px rgba(180, 83, 9, 0.25);';
      case 'temple_arch':
        return 'border: 3px solid #991B1B;';
      case 'double_border':
        return 'border: 3px double #B91C1C; padding: 2px;';
      case 'rounded':
        return 'border: 2px solid #9CA3AF;';
      case 'none':
      default:
        return 'border: none;';
    }
  };

  return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Anek+Tamil:wght@500;600;700;800&amp;family=Catamaran:wght@600;700;800;900&amp;family=Mukta+Malar:wght@600;700;800&amp;display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: #FFFFFF;
          color: #1F2937;
          font-family: 'Anek Tamil', 'Catamaran', 'Mukta Malar', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 8.5pt;
          line-height: 1.25;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        @page {
          size: A4 portrait;
          margin: 4mm;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          .document-wrapper {
            width: 100% !important;
            height: 289mm !important;
            min-height: 289mm !important;
            max-height: 289mm !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            box-shadow: none !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .inner-border {
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
          }
          .photo-viewport {
            overflow: hidden !important;
          }
        }

        .document-wrapper {
          border: 3.5px double ${colors.borderOuter};
          padding: 3.5mm;
          background-color: ${colors.background};
          width: 100%;
          max-width: 202mm;
          height: 289mm;
          min-height: 289mm;
          max-height: 289mm;
          margin: 0 auto;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          page-break-inside: avoid;
          page-break-after: avoid;
          overflow: hidden;
        }

        .inner-border {
          border: 1.5px solid ${colors.accent};
          padding: 3mm;
          background-color: #FFFFFF;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          min-height: 0;
          overflow: hidden;
          position: relative;
        }

        .watermark-kumbam {
          position: absolute;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 360px;
          height: 360px;
          pointer-events: none;
          opacity: 0.058;
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .watermark-kumbam svg {
          width: 100%;
          height: 100%;
        }

        .worship-header, .banner, .two-column-layout, .charts-row, .bottom-astro-bar {
          position: relative;
          z-index: 1;
        }

        /* Auspicious Header */
        .worship-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px 4px;
          margin-bottom: 2px;
          border-bottom: 1px solid #F3F4F6;
          flex-shrink: 0;
        }
        .center-worship {
          text-align: center;
          flex: 1;
        }
        .symbol-text {
          font-size: 13pt;
          font-weight: 800;
          color: ${colors.primary};
          display: block;
          line-height: 1;
        }
        .god-text {
          font-size: 9.5pt;
          font-weight: 800;
          color: ${colors.primaryDark};
          letter-spacing: 0.3px;
        }

        /* Banner */
        .banner {
          background-color: ${colors.primary};
          color: #FFFFFF;
          text-align: center;
          padding: 3px 6px;
          font-size: 10.5pt;
          font-weight: 800;
          letter-spacing: 0.5px;
          border-radius: 3px;
          margin-bottom: 4px;
          flex-shrink: 0;
        }

        /* 2-Column Main Section (Left Details, Right Photo) - Dynamic flex stretch */
        .two-column-layout {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 4px;
          width: 100%;
          flex: 1;
          min-height: 0;
          box-sizing: border-box;
        }

        .details-column {
          flex: 1 1 ${profile.photoUri ? '63%' : '100%'};
          min-width: 0;
          max-width: ${profile.photoUri ? '65%' : '100%'};
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          height: 100%;
        }

        .details-table {
          width: 100%;
          height: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }
        .details-table td {
          padding: 1.5px 0;
          vertical-align: middle;
          font-size: 8.5pt;
          line-height: 1.32;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .details-table td.lbl {
          font-weight: 700;
          color: #374151;
          width: 114px;
          min-width: 114px;
          max-width: 120px;
          white-space: normal;
          padding-right: 4px;
        }
        .details-table td.colon {
          font-weight: 700;
          color: #4B5563;
          width: 12px;
          text-align: center;
        }
        .details-table td.val {
          font-weight: 600;
          color: #111827;
          word-break: break-word;
          padding-left: 2px;
        }
        .candidate-big-name {
          font-size: 13.5pt;
          font-weight: 800;
          color: ${colors.primary};
          line-height: 1.1;
        }

        /* Right Photo Column - GUARANTEED FIXED WIDTH & PRINT VISIBILITY */
        .photo-column {
          flex: 0 0 35%;
          width: 35%;
          min-width: 160px;
          max-width: 35%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          height: 100%;
        }
        .photo-viewport {
          width: 160px;
          max-width: 100%;
          height: 100%;
          max-height: 290px;
          min-height: 180px;
          position: relative;
          background-color: ${getPhotoBgCss()};
          ${getPhotoShapeCss()}
          ${getPhotoBorderCss()}
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-sizing: border-box;
        }
        .photo-viewport img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: ${isCutout ? 'contain' : 'cover'};
          transform: translate(${posX}px, ${posY}px) scale(${zoom}) rotate(${rotation}deg);
          filter: brightness(${brightness}%) contrast(${contrast}%);
        }

        /* Charts Container — side by side with sacred central motif */
        .charts-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 4px;
          flex-shrink: 0;
        }
        .chart-box {
          flex: 1;
          text-align: center;
        }
        .chart-title {
          font-size: 8.5pt;
          font-weight: 800;
          color: ${colors.primaryDark};
          margin-bottom: 2px;
        }
        .chart-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 1fr);
          gap: 3px;
          background-color: #FAF5EA;
          border: 1.5px solid ${colors.accent};
          border-radius: 6px;
          padding: 3px;
          box-sizing: border-box;
          width: 100%;
        }
        .chart-cell {
          background-color: #FAF5EA;
          border: 0.8px solid #E6D8C3;
          border-radius: 4px;
          min-height: 36px;
          padding: 2px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          text-align: center;
        }
        .chart-cell.occupied {
          background-color: #FFFDF9;
          border-color: #D4A373;
        }
        .house-name {
          font-size: 5pt;
          font-weight: 800;
          color: ${colors.accent};
          line-height: 1;
          text-align: left;
        }
        .empty-plus {
          font-size: 10pt;
          color: #CBBCA7;
          font-weight: 700;
          text-align: center;
          margin: auto;
          line-height: 1;
        }
        .planets-card-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 1.5px;
          margin-top: 1px;
        }
        .planet-badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #FEF3C7;
          border-radius: 2px;
          padding: 1px 2px;
        }
        .planet-badge-item.lagnam {
          background-color: #DC2626;
        }
        .planet-tam {
          font-size: 7pt;
          font-weight: 800;
          color: #78350F;
          line-height: 1.1;
        }
        .planet-tam.lagnam {
          color: #FFFFFF;
        }
        .planet-eng {
          font-size: 4pt;
          font-weight: 700;
          color: #92400E;
          line-height: 1;
        }
        .planet-badge-item.lagnam .planet-eng {
          color: #FEE2E2;
        }
        .chart-center {
          grid-column: 2 / span 2;
          grid-row: 2 / span 2;
          background-color: #FDFBF7;
          border: 1px dashed ${colors.accent};
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2px;
        }
        .center-om {
          font-size: 13pt;
          font-weight: 800;
          color: ${colors.primary};
          line-height: 1;
        }
        .center-title {
          font-size: 7.5pt;
          font-weight: 800;
          color: ${colors.primaryDark};
          margin-top: 1px;
        }
        .center-sub {
          font-size: 5pt;
          font-weight: 700;
          color: ${colors.accent};
        }

        /* Bottom Horoscope Summary Bar */
        .bottom-astro-bar {
          background-color: ${colors.headerBg};
          border: 1px solid ${colors.accent};
          border-radius: 3px;
          padding: 3px 8px;
          text-align: center;
          font-size: 8pt;
          font-weight: 600;
          color: ${colors.primaryDark};
          margin-bottom: 3px;
          flex-shrink: 0;
          word-break: break-word;
          overflow: hidden;
          line-height: 1.35;
        }
        .bottom-astro-bar b {
          color: ${colors.primary};
          font-weight: 800;
        }

        /* Footer Blessing */
        .footer-blessing {
          text-align: center;
          padding-top: 2px;
          border-top: 1px dashed ${colors.accent};
          font-weight: 700;
          font-size: 7.5pt;
          color: ${colors.primary};
          flex-shrink: 0;
        }
      </style>
    </head>
    <body>
      <div class="document-wrapper">
        <div class="inner-border">
          
          <!-- Auspicious Rasi Watermark (Mild Divine Background) -->
          <div class="watermark-kumbam" aria-hidden="true">
            ${rasiWatermarkSvg}
          </div>

          <!-- Auspicious Top Header -->
          <div class="worship-header">
            <div class="center-worship">
              ${symbolHtml}
              <div class="god-text">${godText}</div>
            </div>
          </div>

          <!-- Document Sub Banner -->
          <div class="banner">
            ${isGroom ? 'சுப வரன் திருமண விபரம்' : 'சுப மணமகள் திருமண விபரம்'}
          </div>

          <!-- 2-COLUMN MAIN BODY (LEFT: DETAILS, RIGHT: PHOTO) -->
          <div class="two-column-layout">
            <div class="details-column">
              <table class="details-table">
                <!-- 1. Candidate Full Name -->
                <tr>
                  <td class="lbl">பெயர்</td>
                  <td class="colon">:</td>
                  <td class="val candidate-big-name">${profile.fullName || '-'}</td>
                </tr>

                <!-- 2. Date of Birth, Time & Place -->
                <tr>
                  <td class="lbl">பிறந்த தேதி</td>
                  <td class="colon">:</td>
                  <td class="val">${profile.dateOfBirth || '-'} (${profile.timeOfBirth || ''} ${profile.timePeriod || ''})${profile.placeOfBirth ? ` @ ${profile.placeOfBirth}` : ''}</td>
                </tr>

                <!-- 3. Height, Complexion & Food Habit -->
                <tr>
                  <td class="lbl">உயரம் &amp; உணவு</td>
                  <td class="colon">:</td>
                  <td class="val">${heightStr} ${profile.complexion ? `| ${profile.complexion}` : ''} | ${foodStr}</td>
                </tr>

                <!-- 4. Religion, Caste, Gothram & Kuladeivam -->
                <tr>
                  <td class="lbl">குலம் &amp; சமூகம்</td>
                  <td class="colon">:</td>
                  <td class="val">${profile.religion || 'இந்து'} ${profile.caste ? `• ${profile.caste}` : ''} ${profile.gothram ? `• ${profile.gothram}` : ''} ${profile.kuladeivam ? `• குலதெய்வம்: ${profile.kuladeivam}` : ''}</td>
                </tr>

                <!-- 5. Qualification & Optional College -->
                <tr>
                  <td class="lbl">படிப்பு</td>
                  <td class="colon">:</td>
                  <td class="val" style="font-weight: 700;">${profile.qualification || '-'}${profile.collegeOrUniversity && profile.collegeOrUniversity.trim() ? ` (${profile.collegeOrUniversity.trim()})` : ''}</td>
                </tr>

                <!-- 6. Occupation, Company & Work Location -->
                <tr>
                  <td class="lbl">வேலை விபரம்</td>
                  <td class="colon">:</td>
                  <td class="val" style="color: ${colors.primary}; font-weight: 700;">${profile.occupation || '-'}${profile.companyName ? ` (${profile.companyName})` : ''}${profile.workLocation ? ` - ${profile.workLocation}` : ''}</td>
                </tr>

                <!-- 7. Income (if provided) -->
                ${
                  profile.annualIncome
                    ? `
                <tr>
                  <td class="lbl">வருமானம்</td>
                  <td class="colon">:</td>
                  <td class="val" style="color: #B45309; font-weight: 700;">${incomeStr}</td>
                </tr>
                `
                    : ''
                }

                <!-- 8. Father's Name & Occupation (if provided) -->
                ${
                  profile.fatherName
                    ? `
                <tr>
                  <td class="lbl">தந்தை பெயர்</td>
                  <td class="colon">:</td>
                  <td class="val">${profile.fatherName} ${profile.fatherOccupation ? `(${profile.fatherOccupation})` : ''}</td>
                </tr>
                `
                    : ''
                }

                <!-- 9. Mother's Name & Occupation (if provided) -->
                ${
                  profile.motherName
                    ? `
                <tr>
                  <td class="lbl">தாயார் பெயர்</td>
                  <td class="colon">:</td>
                  <td class="val">${profile.motherName} ${profile.motherOccupation ? `(${profile.motherOccupation})` : ''}</td>
                </tr>
                `
                    : ''
                }

                <!-- 10. Ancestral Origin / Native Place (if provided) -->
                ${
                  profile.nativePlace
                    ? `
                <tr>
                  <td class="lbl">பூர்வீகம்</td>
                  <td class="colon">:</td>
                  <td class="val">${profile.nativePlace}</td>
                </tr>
                `
                    : ''
                }

                <!-- 11. Birth Order / Order Number (if provided) -->
                ${
                  profile.birthOrder && profile.birthOrder.trim()
                    ? `
                <tr>
                  <td class="lbl">பிறப்பு வரிசை</td>
                  <td class="colon">:</td>
                  <td class="val">${formatBirthOrder(profile.birthOrder)}</td>
                </tr>
                `
                    : ''
                }

                <!-- 12. Siblings -->
                <tr>
                  <td class="lbl">உடன்பிறந்தவர்கள்</td>
                  <td class="colon">:</td>
                  <td class="val">${siblingsText}</td>
                </tr>

                <!-- 13. Assets (if enabled) -->
                ${
                  profile.showAssets && (profile.selectedAssets.length > 0 || profile.assetsDescription)
                    ? `
                <tr>
                  <td class="lbl">சொத்து விபரம்</td>
                  <td class="colon">:</td>
                  <td class="val">${profile.selectedAssets.join(', ')}${profile.assetsDescription ? ` • ${profile.assetsDescription}` : ''}</td>
                </tr>
                `
                    : ''
                }

                <!-- 14. Address & Contact Numbers -->
                <tr>
                  <td class="lbl">முகவரி &amp; செல்</td>
                  <td class="colon">:</td>
                  <td class="val">${profile.residentialAddress ? `${profile.residentialAddress}. ` : ''}${profile.parentsContact ? `செல்: ${profile.parentsContact}` : ''}${profile.contactNumber2 ? `, ${profile.contactNumber2}` : ''}</td>
                </tr>
              </table>
            </div>

            ${
              profile.photoUri
                ? `
            <div class="photo-column">
              <div class="photo-viewport">
                <img src="${profile.photoUri}" alt="${profile.fullName}" />
              </div>
            </div>
            `
                : ''
            }
          </div>

          <!-- SIDE-BY-SIDE HOROSCOPE CHARTS -->
          <div class="charts-container">
            ${buildChartHtml('ராசி கட்டம்', profile.rasiChart)}
            ${buildChartHtml('நவாம்சம் கட்டம்', profile.navamsamChart)}
          </div>

          <!-- BOTTOM ASTROLOGICAL METRICS BAR -->
          <div class="bottom-astro-bar">
            ${profile.sunMahadashaYears ? `சூரிய மகாதிசை இருப்பு: <b>${profile.sunMahadashaYears} வ, ${profile.sunMahadashaMonths || 0} மா, ${profile.sunMahadashaDays || 0} நா</b>  •  ` : ''}
            நட்சத்திரம்: <b>${profile.nakshatram || '-'} ${profile.padham ? `${profile.padham}-ஆம் பாதம்` : ''}</b>  •  
            ராசி: <b>${profile.rasi || '-'}</b>  •  
            லக்னம்: <b>${profile.lagnam || '-'}</b>
            ${profile.dosham ? `  •  தோஷம்: <b>${profile.dosham}</b>` : ''}
          </div>

          <!-- Footer Blessing -->
          <div class="footer-blessing">
            || எல்லாம் வல்ல இறைவன் திருவருளால் நல்ல வரன் அமைய வாழ்த்துகள் ||
          </div>

        </div>
      </div>
  `;
}

export function buildBiodataHtml(profile: BiodataProfile, template: TemplateMetadata): string {
  const innerHtml = buildBiodataInnerHtml(profile, template);
  return `
    <!DOCTYPE html>
    <html lang="ta">
    <head>
      <meta charset="UTF-8">
      <title>${profile.fullName || 'வரன்'} - திருமண வரன் விபரம்</title>
    </head>
    <body>
      ${innerHtml}
    </body>
    </html>
  `;
}
