import html2pdf from 'html2pdf.js'

/**
 * Generates and downloads a PDF directly from an HTML element using html2pdf.js
 * @param {HTMLElement} element - The DOM element to render to PDF
 * @param {string} filename - The output PDF filename
 * @returns {Promise<void>}
 */
export async function downloadCvPdf(element, filename = 'Hamza_Eshtiba_CV.pdf') {
  if (!element) {
    throw new Error('No element provided for PDF generation')
  }

  const opt = {
    margin: [6, 6, 6, 6],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      scrollY: 0,
      windowWidth: 840,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  return html2pdf().set(opt).from(element).save()
}
