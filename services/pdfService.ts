import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a PDF from an HTML element and returns it as a Blob.
 * @param elementId The ID of the HTML element to convert.
 * @returns A Promise that resolves with the generated PDF Blob.
 */
export const generatePdfFromElement = async (elementId: string): Promise<Blob> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id "${elementId}" not found.`);
    }

    // Add a temporary class to the body to activate PDF-specific styles
    document.body.classList.add('pdf-export');

    const canvas = await html2canvas(element, {
        scale: 2, // Increased scale for better resolution and legibility
        useCORS: true,
        backgroundColor: '#ffffff',
    });

    // Remove the temporary class after canvas generation
    document.body.classList.remove('pdf-export');
    
    // Use JPEG with quality compression for a smaller file size than PNG
    const imgData = canvas.toDataURL('image/jpeg', 0.8);

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    return pdf.output('blob');
};

/**
 * Generates a PDF from an HTML element and triggers a download.
 * @param elementId The ID of the HTML element to convert.
 * @param filename The desired name for the downloaded PDF file.
 */
export const downloadPdfFromElement = async (elementId: string, filename: string): Promise<void> => {
    try {
        const pdfBlob = await generatePdfFromElement(elementId);
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to generate or download PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
    }
};