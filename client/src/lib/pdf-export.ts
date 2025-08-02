import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportToPDF(canvasElementId: string, filename: string = 'seating-chart.pdf'): Promise<void> {
  try {
    console.log('Starting PDF export...');
    console.log('Looking for element:', canvasElementId);

    const canvas = document.getElementById(canvasElementId);
    console.log('Found canvas element:', !!canvas);
    if (!canvas) {
      throw new Error(`Canvas element with ID '${canvasElementId}' not found. Please make sure the seating chart is visible.`);
    }

    // Check canvas dimensions and warn if too large
    const canvasRect = canvas.getBoundingClientRect();
    const maxWidth = 2480; // A4 landscape width at 300 DPI
    const maxHeight = 1748; // A4 landscape height at 300 DPI

    if (canvasRect.width > maxWidth || canvasRect.height > maxHeight) {
      const shouldContinue = confirm(
        'Canvas is larger than A4 size. Consider using landscape orientation or reducing canvas size. Continue anyway?'
      );
      if (!shouldContinue) return;
    }

    // Create canvas from HTML
    console.log('Starting html2canvas...');
    const htmlCanvas = await html2canvas(canvas, {
      scale: 1,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: canvasRect.width,
      height: canvasRect.height
    });
    
    console.log('html2canvas completed. Canvas size:', htmlCanvas.width, 'x', htmlCanvas.height);

    // Calculate dimensions for PDF
    const imgWidth = htmlCanvas.width;
    const imgHeight = htmlCanvas.height;
    
    // Use landscape if width > height
    const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
    
    // Create PDF
    console.log('Creating PDF with dimensions:', imgWidth, 'x', imgHeight, 'orientation:', orientation);
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [imgWidth, imgHeight]
    });

    // Add image to PDF
    const imgData = htmlCanvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}
