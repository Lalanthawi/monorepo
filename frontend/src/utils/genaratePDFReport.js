import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePDFReport = async (elementId, reportTitle, dateRange) => {
  try {
    // Get the element to convert to PDF
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Report element not found");
    }

    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    let position = 0;

    // Add header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(reportTitle, 15, 20);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 30);
    pdf.text(`Period: ${dateRange}`, 15, 37);

    position = 45;

    // Add the canvas as image
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    const fileName = `${reportTitle.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Alternative method without external libraries (basic browser print)
export const printReport = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open("", "_blank");
  const styles = Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch (e) {
        return "";
      }
    })
    .join("\n");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Report</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
