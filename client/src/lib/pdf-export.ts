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
    
    // Try to load PDF libraries
    let useRealPDF = false;
    if (!window.jsPDF && (window as any).loadPDFLibraries) {
      console.log('Attempting to load jsPDF...');
      try {
        useRealPDF = await (window as any).loadPDFLibraries();
        if (useRealPDF) {
          console.log('Real jsPDF loaded successfully');
        } else {
          console.log('Using fallback PDF method');
        }
      } catch (error) {
        console.log('jsPDF loading failed, using fallback method');
        useRealPDF = false;
      }
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
    
    // Create PDF using available method
    if (window.jsPDF && (typeof window.jsPDF === 'object' || typeof window.jsPDF === 'function')) {
      console.log('Using real jsPDF library');
      
      // Handle different jsPDF loading patterns
      let jsPDF;
      if (typeof window.jsPDF.jsPDF === 'function') {
        jsPDF = window.jsPDF.jsPDF; // For UMD versions
      } else if (typeof window.jsPDF === 'function') {
        jsPDF = window.jsPDF; // For older versions
      } else {
        console.error('jsPDF found but no valid constructor:', window.jsPDF);
        throw new Error('jsPDF constructor not found');
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
    } else {
      console.log('Using fallback image download method');
      
      // Fallback: use the simple PDF creator (actually downloads as PNG)
      if ((window as any).createSimplePDF) {
        const simplePdf = await (window as any).createSimplePDF(htmlCanvas, filename);
        simplePdf.addImage(htmlCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        simplePdf.save(filename);
      } else {
        throw new Error('No PDF creation method available');
      }
    }
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}
