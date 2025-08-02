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

    // Temporarily increase font sizes for PDF export
    const deskElements = canvas.querySelectorAll('[data-desk-id]');
    const originalStyles: { element: Element; fontSize: string; fontWeight: string }[] = [];
    
    // Store original styles and increase font sizes
    deskElements.forEach(element => {
      const computed = window.getComputedStyle(element);
      originalStyles.push({
        element,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight
      });
      
      // Increase font size and weight for PDF export
      (element as HTMLElement).style.fontSize = '18px';
      (element as HTMLElement).style.fontWeight = 'bold';
      
      // Also update child text elements
      const textElements = element.querySelectorAll('div, span, p');
      textElements.forEach(textEl => {
        (textEl as HTMLElement).style.fontSize = '18px';
        (textEl as HTMLElement).style.fontWeight = 'bold';
        (textEl as HTMLElement).style.lineHeight = '1.3';
      });
    });

    // Create canvas from HTML with higher scale for better quality
    console.log('Starting html2canvas...');
    const htmlCanvas = await window.html2canvas(canvas, {
      scale: 4, // Very high scale for crisp text
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: canvasRect.width,
      height: canvasRect.height,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc: any) => {
        // Ensure text is rendered with high quality in the cloned document
        const clonedDesks = clonedDoc.querySelectorAll('[data-desk-id]');
        clonedDesks.forEach((desk: any) => {
          (desk as HTMLElement).style.fontSize = '18px';
          (desk as HTMLElement).style.fontWeight = 'bold';
          
          const textElements = desk.querySelectorAll('div, span, p');
          textElements.forEach((textEl: any) => {
            (textEl as HTMLElement).style.fontSize = '18px';
            (textEl as HTMLElement).style.fontWeight = 'bold';
            (textEl as HTMLElement).style.lineHeight = '1.3';
            (textEl as HTMLElement).style.textRendering = 'optimizeLegibility';
            // Use type assertion to avoid TS error
            (textEl as any).style.webkitFontSmoothing = 'antialiased';
          });
        });
      }
    });
    
    // Restore original styles
    originalStyles.forEach(({ element, fontSize, fontWeight }) => {
      (element as HTMLElement).style.fontSize = fontSize;
      (element as HTMLElement).style.fontWeight = fontWeight;
      
      const textElements = element.querySelectorAll('div, span, p');
      textElements.forEach(textEl => {
        (textEl as HTMLElement).style.fontSize = '';
        (textEl as HTMLElement).style.fontWeight = '';
        (textEl as HTMLElement).style.lineHeight = '';
      });
    });
    
    console.log('html2canvas completed. Canvas size:', htmlCanvas.width, 'x', htmlCanvas.height);

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
      
      // Calculate PDF dimensions - use A4 landscape as base
      const pdfWidth = 297; // A4 width in mm (landscape)
      const pdfHeight = 210; // A4 height in mm (landscape)
      const margin = 20; // margin in mm
      const headerHeight = 15; // header height in mm
      const footerHeight = 10; // footer height in mm
      
      // Available space for the canvas
      const availableWidth = pdfWidth - (2 * margin);
      const availableHeight = pdfHeight - (2 * margin) - headerHeight - footerHeight;
      
      // Calculate scale to fit canvas within available space
      const scaleX = availableWidth / (htmlCanvas.width * 0.264583); // Convert px to mm (96 DPI)
      const scaleY = availableHeight / (htmlCanvas.height * 0.264583);
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      const imgWidth = (htmlCanvas.width * 0.264583) * scale;
      const imgHeight = (htmlCanvas.height * 0.264583) * scale;
      
      // Center the image
      const imgX = margin + (availableWidth - imgWidth) / 2;
      const imgY = margin + headerHeight + (availableHeight - imgHeight) / 2;
      
      console.log('Creating PDF with dimensions:', pdfWidth, 'x', pdfHeight, 'mm');
      console.log('Image will be:', imgWidth, 'x', imgHeight, 'mm at position', imgX, imgY);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Classroom Seating Chart', pdfWidth / 2, margin + 10, { align: 'center' });
      
      // Add date/time
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${dateString}`, pdfWidth - margin, margin + 5, { align: 'right' });

      // Add the seating chart image
      const imgData = htmlCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);

      // Add footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Generated using Classroom Seating Chart Builder', pdfWidth / 2, pdfHeight - 5, { align: 'center' });

      // Save PDF
      pdf.save(filename);
      console.log('PDF saved successfully as:', filename);
      
    } else {
      console.log('Using fallback image download method');
      
      // Fallback: Create a composite image with headers and download as PNG
      const compositeCanvas = document.createElement('canvas');
      const ctx = compositeCanvas.getContext('2d');
      if (!ctx) throw new Error('Cannot create canvas context');
      
      // Set canvas size with space for headers/footers
      const padding = 100;
      compositeCanvas.width = htmlCanvas.width + (padding * 2);
      compositeCanvas.height = htmlCanvas.height + (padding * 2);
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
      
      // Add header
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Classroom Seating Chart', compositeCanvas.width / 2, 40);
      
      // Add date
      ctx.font = '14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`Generated: ${dateString}`, compositeCanvas.width - 20, 25);
      
      // Add the main canvas
      ctx.drawImage(htmlCanvas, padding, padding);
      
      // Add footer
      ctx.font = 'italic 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Generated using Classroom Seating Chart Builder', compositeCanvas.width / 2, compositeCanvas.height - 20);
      
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