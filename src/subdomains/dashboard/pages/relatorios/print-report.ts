import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export function buildReportFileName(startDate: string, endDate: string) {
  const start = startDate || "inicio";
  const end = endDate || "fim";
  return `relatorio-${start}-${end}-meutroco`;
}

export async function downloadReportPdf(
  element: HTMLElement,
  fileName: string
) {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = "794px";
  clone.style.maxWidth = "794px";
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  clone.style.zIndex = "-1";
  clone.style.boxShadow = "none";
  clone.style.borderRadius = "0";
  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2.5,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: 794,
      windowHeight: clone.scrollHeight,
    });

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    const pageContentHeight = pageHeight - margin * 2;

    let heightLeft = contentHeight;
    let offsetY = margin;

    pdf.addImage(
      imageData,
      "PNG",
      margin,
      offsetY,
      contentWidth,
      contentHeight,
      undefined,
      "FAST"
    );
    heightLeft -= pageContentHeight;

    while (heightLeft > 0) {
      offsetY = margin - (contentHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(
        imageData,
        "PNG",
        margin,
        offsetY,
        contentWidth,
        contentHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pageContentHeight;
    }

    pdf.save(`${fileName}.pdf`);
  } finally {
    clone.remove();
  }
}
