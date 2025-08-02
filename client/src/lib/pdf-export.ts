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

    // Get canvas dimensions
    const canvasRect = canvas.getBoundingClientRect();
    console.log('Canvas dimensions:', canvasRect.width, 'x', canvasRect.height);

    // Create canvas from HTML with better quality settings
    console.log('Starting html2canvas...');
    const htmlCanvas = await html2canvas(canvas, {
      scale: 2, // Higher resolution for better quality
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: canvasRect.width,
      height: canvasRect.height,
      removeContainer: true,
      imageTimeout: 0,
      foreignObjectRendering: false // Better text rendering
    });
    
    console.log('html2canvas completed. Canvas size:', htmlCanvas.width, 'x', htmlCanvas.height);

    // Calculate dimensions for PDF with proper scaling
    const imgWidth = htmlCanvas.width;
    const imgHeight = htmlCanvas.height;
    
    // Standard page sizes in points (1 point = 1/72 inch)
    const a4Width = 595.28; // A4 width in points
    const a4Height = 841.89; // A4 height in points
    
    // Calculate scale to fit content on A4
    const scaleX = a4Width / imgWidth;
    const scaleY = a4Height / imgHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't upscale, only downscale
    
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    // Use landscape if content is wider than it is tall
    const orientation = scaledWidth > scaledHeight ? 'landscape' : 'portrait';
    const pageWidth = orientation === 'landscape' ? a4Height : a4Width;
    const pageHeight = orientation === 'landscape' ? a4Width : a4Height;
    
    // Center the content on the page
    const offsetX = (pageWidth - scaledWidth) / 2;
    const offsetY = (pageHeight - scaledHeight) / 2;
    
    console.log('Creating PDF with scale:', scale, 'orientation:', orientation);
    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format: 'a4'
    });

    // Add image to PDF with proper scaling and centering
    const imgData = htmlCanvas.toDataURL('image/png', 0.95); // Slight compression for smaller file
    pdf.addImage(imgData, 'PNG', offsetX, offsetY, scaledWidth, scaledHeight);
    
    // Add title
    pdf.setFontSize(16);
    pdf.setTextColor(60, 60, 60);
    pdf.text('Classroom Seating Chart', 40, 30);

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}
