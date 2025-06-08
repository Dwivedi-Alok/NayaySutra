import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export const exportAsPDF = (text, translated, sourceLang, targetLang, languageList) => {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  const lineHeight = 10;
  let yPosition = margin;

  // Add title
  pdf.setFontSize(18);
  pdf.text('Legal Translation Document', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight * 2;

  // Add metadata
  pdf.setFontSize(12);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += lineHeight;
  
  const sourceLabel = sourceLang === 'en' ? 'English' : languageList.find(l => l.code === sourceLang)?.label || sourceLang;
  const targetLabel = languageList.find(l => l.code === targetLang)?.label || targetLang;
  pdf.text(`Languages: ${sourceLabel} → ${targetLabel}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Add source text
  pdf.setFontSize(14);
  pdf.text('Original Text:', margin, yPosition);
  yPosition += lineHeight;
  pdf.setFontSize(11);
  
  const sourceLines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
  sourceLines.forEach(line => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += lineHeight;
  });

  yPosition += lineHeight;

  // Add translation
  pdf.setFontSize(14);
  pdf.text('Translation:', margin, yPosition);
  yPosition += lineHeight;
  pdf.setFontSize(11);
  
  const translationLines = pdf.splitTextToSize(translated || 'No translation available', pageWidth - 2 * margin);
  translationLines.forEach(line => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += lineHeight;
  });

  pdf.save(`translation_${Date.now()}.pdf`);
};

export const exportAsWord = async (text, translated, sourceLang, targetLang, languageList) => {
  const sourceLabel = sourceLang === 'en' ? 'English' : languageList.find(l => l.code === sourceLang)?.label || sourceLang;
  const targetLabel = languageList.find(l => l.code === targetLang)?.label || targetLang;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "Legal Translation Document",
              bold: true,
              size: 32
            })
          ],
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Date: ${new Date().toLocaleDateString()}`,
              size: 24
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Languages: ${sourceLabel} → ${targetLabel}`,
              size: 24
            })
          ],
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Original Text:",
              bold: true,
              size: 28
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: text,
              size: 24
            })
          ],
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Translation:",
              bold: true,
              size: 28
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: translated || 'No translation available',
              size: 24
            })
          ]
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `translation_${Date.now()}.docx`);
};