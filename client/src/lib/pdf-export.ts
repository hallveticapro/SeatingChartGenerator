declare global {
  interface Window {
    html2canvas: any;
    jsPDF: any;
  }
}

export async function exportToPDF(canvasElementId: string, filename: string = 'seating-chart.pdf'): Promise<void> {
  try {
    if (!window.html2canvas || !window.jsPDF) {
      throw new Error('PDF export libraries not loaded');
    }

    const canvas = document.getElementById(canvasElementId);
    if (!canvas) {
      throw new Error('Canvas element not found');
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
    const htmlCanvas = await window.html2canvas(canvas, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff'
    });

    // Calculate dimensions for PDF
    const imgWidth = htmlCanvas.width;
    const imgHeight = htmlCanvas.height;
    
    // Use landscape if width > height
    const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
    
    // Create PDF
    const { jsPDF } = window.jsPDF;
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
