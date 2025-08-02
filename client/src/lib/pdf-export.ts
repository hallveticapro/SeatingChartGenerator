declare global {
  interface Window {
    html2canvas: any;
    jsPDF: any;
  }
}

export async function exportToPDF(canvasElementId: string): Promise<void> {
  try {
    console.log('Starting PDF export...');
    console.log('Looking for element:', canvasElementId);
    
    // Create timestamp for filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `seating-chart-${timestamp}.pdf`;
    const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    
    console.log('html2canvas available:', !!window.html2canvas);
    console.log('jsPDF available:', !!window.jsPDF);
    
    // Ensure html2canvas is available
    if (!window.html2canvas) {
      throw new Error('html2canvas library not found. Please refresh the page.');
    }
    
    // Try to load PDF libraries
    if (!window.jsPDF && (window as any).loadPDFLibraries) {
      console.log('Attempting to load jsPDF...');
      try {
        await (window as any).loadPDFLibraries();
        console.log('PDF libraries loaded successfully');
      } catch (error) {
        console.log('jsPDF loading failed, using fallback method');
      }
    }

    const canvas = document.getElementById(canvasElementId);
    console.log('Found canvas element:', !!canvas);
    if (!canvas) {
      throw new Error(`Canvas element with ID '${canvasElementId}' not found. Please make sure the seating chart is visible.`);
    }

    // Get canvas dimensions
    const canvasRect = canvas.getBoundingClientRect();
    console.log('Canvas dimensions:', canvasRect.width, 'x', canvasRect.height);

    // Create canvas from HTML with high resolution for crisp text
    console.log('Starting html2canvas...');
    const htmlCanvas = await window.html2canvas(canvas, {
      scale: 4, // High scale for very crisp text
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: canvasRect.width,
      height: canvasRect.height,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc: any) => {
        // Dramatically enhance text in the clone for PDF quality
        const clonedDesks = clonedDoc.querySelectorAll('[data-desk-id]');
        clonedDesks.forEach((desk: any) => {
          // Make text much larger and bolder for PDF
          const textElements = desk.querySelectorAll('div, span, p');
          textElements.forEach((textEl: any, index: number) => {
            if (index === 0) {
              // Desk number - make it very large
              textEl.style.fontSize = '24px';
              textEl.style.fontWeight = '900';
              textEl.style.color = '#000000';
              textEl.style.lineHeight = '1.2';
              textEl.style.textShadow = '0 0 1px rgba(0,0,0,0.5)';
            } else {
              // Student name or "Unassigned" - also much larger
              textEl.style.fontSize = '20px';
              textEl.style.fontWeight = '700';
              textEl.style.lineHeight = '1.3';
              textEl.style.color = '#222222';
              textEl.style.textShadow = '0 0 1px rgba(0,0,0,0.3)';
            }
            textEl.style.fontFamily = 'Arial, sans-serif';
            textEl.style.textRendering = 'optimizeLegibility';
            textEl.style.webkitFontSmoothing = 'antialiased';
            textEl.style.mozOsxFontSmoothing = 'grayscale';
          });
        });
      }
    });
    
    console.log('html2canvas completed. Canvas size:', htmlCanvas.width, 'x', htmlCanvas.height);

    // Create PDF using available method - check for jsPDF more thoroughly
    const hasJsPDF = window.jsPDF || (window as any).jspdf;
    if (hasJsPDF) {
      console.log('Using real jsPDF library');
      
      // Handle different jsPDF loading patterns
      let jsPDF;
      const jsPDFLib = window.jsPDF || (window as any).jspdf;
      
      if (typeof jsPDFLib === 'function') {
        jsPDF = jsPDFLib; // Direct constructor
      } else if (typeof jsPDFLib?.jsPDF === 'function') {
        jsPDF = jsPDFLib.jsPDF; // UMD pattern
      } else if (typeof jsPDFLib?.default === 'function') {
        jsPDF = jsPDFLib.default; // ES module pattern
      } else {
        console.error('jsPDF found but no valid constructor:', jsPDFLib);
        console.log('Falling back to PNG export');
        // Fall through to PNG export
        jsPDF = null;
      }
      
      // Calculate PDF dimensions - use A4 landscape as base
      const pdfWidth = 297; // A4 width in mm (landscape)
      const pdfHeight = 210; // A4 height in mm (landscape)
      const margin = 15; // Smaller margin for more space
      const headerHeight = 20; // Larger header height
      const footerHeight = 15; // Larger footer height
      
      // Available space for the canvas
      const availableWidth = pdfWidth - (2 * margin);
      const availableHeight = pdfHeight - (2 * margin) - headerHeight - footerHeight;
      
      // Calculate scale to fit canvas within available space, but don't make it too small
      const scaleX = availableWidth / (htmlCanvas.width * 0.264583); // Convert px to mm (96 DPI)
      const scaleY = availableHeight / (htmlCanvas.height * 0.264583);
      const scale = Math.min(scaleX, scaleY, 1.5); // Allow scaling up to 1.5x for better size
      
      const imgWidth = (htmlCanvas.width * 0.264583) * scale;
      const imgHeight = (htmlCanvas.height * 0.264583) * scale;
      
      // Center the image
      const imgX = margin + (availableWidth - imgWidth) / 2;
      const imgY = margin + headerHeight + (availableHeight - imgHeight) / 2;
      
      if (jsPDF) {
        console.log('Creating PDF with dimensions:', pdfWidth, 'x', pdfHeight, 'mm');
        console.log('Image will be:', imgWidth, 'x', imgHeight, 'mm at position', imgX, imgY);
        
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

      // Add header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Classroom Seating Chart', pdfWidth / 2, margin + 15, { align: 'center' });

      // Add the seating chart image with moderate compression
      const imgData = htmlCanvas.toDataURL('image/jpeg', 0.92); // Higher quality for text clarity
      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, imgHeight);

      // Add footer with timestamp
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Generated using Classroom Seating Chart Builder - Generated on ${dateString}`, pdfWidth / 2, pdfHeight - 8, { align: 'center' });

        // Save PDF
        pdf.save(filename);
        console.log('PDF saved successfully as:', filename);
      } else {
        throw new Error('jsPDF constructor not available, falling back to PNG');
      }
      
    } else {
      console.log('Using fallback image download method');
      
      // Fallback: Create a composite image with headers and download as PNG
      const compositeCanvas = document.createElement('canvas');
      const ctx = compositeCanvas.getContext('2d');
      if (!ctx) throw new Error('Cannot create canvas context');
      
      // Set canvas size with space for headers/footers - scale to proper size
      const padding = 200;
      const scaledWidth = Math.max(htmlCanvas.width, 2000); // Ensure minimum width
      const scaledHeight = Math.max(htmlCanvas.height, 1400); // Ensure minimum height
      
      compositeCanvas.width = scaledWidth + (padding * 2);
      compositeCanvas.height = scaledHeight + (padding * 2);
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
      
      // Add header with proper scaling
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 72px Arial'; // Much larger header
      ctx.textAlign = 'center';
      ctx.fillText('Classroom Seating Chart', compositeCanvas.width / 2, 100);
      
      // Skip date in header for PNG fallback - will be in footer
      
      // Scale and center the main canvas
      const centerX = (compositeCanvas.width - scaledWidth) / 2;
      const centerY = padding + (scaledHeight - htmlCanvas.height) / 2;
      
      ctx.drawImage(htmlCanvas, centerX, centerY, scaledWidth, scaledHeight);
      
      // Add footer with timestamp
      ctx.font = 'italic 32px Arial'; // Larger footer
      ctx.textAlign = 'center';
      ctx.fillText(`Generated using Classroom Seating Chart Builder - Generated on ${dateString}`, compositeCanvas.width / 2, compositeCanvas.height - 50);
      
      // Download as PNG
      const link = document.createElement('a');
      link.href = compositeCanvas.toDataURL('image/png', 1.0);
      link.download = filename.replace('.pdf', '.png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Image saved successfully as:', filename.replace('.pdf', '.png'));
    }
    
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}