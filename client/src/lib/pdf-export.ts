declare global {
  interface Window {
    html2canvas: any;
    jsPDF: any;
  }
}

export async function exportToPDF(canvasElementId: string, filename: string = 'seating-chart.pdf'): Promise<void> {
  try {
    console.log('Starting PDF export...');
    console.log('Looking for element:', canvasElementId);
    console.log('html2canvas available:', !!window.html2canvas);
    console.log('jsPDF available:', !!window.jsPDF);
    console.log('jsPDF object:', window.jsPDF);
    
    // Ensure html2canvas is available
    if (!window.html2canvas) {
      throw new Error('html2canvas library not found. Please refresh the page.');
    }
    
    // Load jsPDF if not available
    if (!window.jsPDF && (window as any).loadJsPDF) {
      console.log('Loading jsPDF dynamically...');
      try {
        await (window as any).loadJsPDF();
      } catch (error) {
        console.error('Failed to load jsPDF dynamically:', error);
      }
    }
    
    // Final check for jsPDF
    if (!window.jsPDF) {
      throw new Error('jsPDF library not available. Please refresh the page and try again.');
    }

    const canvas = document.getElementById(canvasElementId);
    console.log('Found canvas element:', !!canvas, canvas);
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
    const htmlCanvas = await window.html2canvas(canvas, {
      scale: 1, // Reduce scale to prevent memory issues
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
    
    // Create PDF - handle different jsPDF loading patterns
    let jsPDF;
    console.log('window.jsPDF structure:', Object.keys(window.jsPDF || {}));
    
    if (window.jsPDF) {
      if (typeof window.jsPDF.jsPDF === 'function') {
        jsPDF = window.jsPDF.jsPDF; // For UMD versions
      } else if (typeof window.jsPDF === 'function') {
        jsPDF = window.jsPDF; // For older versions
      } else {
        console.error('jsPDF found but no valid constructor:', window.jsPDF);
        throw new Error('jsPDF constructor not found in loaded library');
      }
    }
    
    if (!jsPDF) {
      throw new Error('jsPDF constructor not available');
    }
    
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
