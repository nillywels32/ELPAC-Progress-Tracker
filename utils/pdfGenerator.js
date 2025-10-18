import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate PDF report from student assessment data
 */
export const generatePDFReport = async (studentData, options = {}) => {
  const {
    studentName = 'Student',
    grade = 7,
    includeCharts = true,
    format = 'detailed' // 'detailed' or 'summary'
  } = options;

  const pdf = new jsPDF('p', 'mm', 'letter');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper function to add text
  const addText = (text, fontSize = 12, isBold = false, align = 'left') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

    if (align === 'center') {
      const textWidth = pdf.getTextWidth(text);
      pdf.text(text, (pageWidth - textWidth) / 2, yPosition);
    } else {
      pdf.text(text, margin, yPosition);
    }

    yPosition += fontSize * 0.5;
  };

  // Helper function to check if we need a new page
  const checkNewPage = (spaceNeeded = 20) => {
    if (yPosition + spaceNeeded > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Header
  addText('Road to Reclassification', 20, true, 'center');
  yPosition += 5;
  addText(`Assessment Progress Report - Grade ${grade}`, 14, false, 'center');
  yPosition += 10;

  // Student Info
  addText(`Student: ${studentName}`, 12, false);
  yPosition += 2;
  addText(`Date: ${new Date().toLocaleDateString()}`, 12, false);
  yPosition += 10;

  // Overall Status
  checkNewPage(40);
  const { canReclassify, elpacMeets, otherAssessmentsMet } = studentData;

  pdf.setFillColor(canReclassify ? 220 : 255, canReclassify ? 252 : 237, canReclassify ? 231 : 213);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 30, 'F');

  pdf.setTextColor(canReclassify ? 22 : 234, canReclassify ? 101 : 88, canReclassify ? 52 : 58);
  yPosition += 5;
  addText(
    canReclassify
      ? '🎉 RECLASSIFICATION ELIGIBLE!'
      : '📚 WORKING TOWARD RECLASSIFICATION',
    16,
    true,
    'center'
  );
  yPosition += 10;

  pdf.setTextColor(0, 0, 0);
  addText(`ELPAC Level 4: ${elpacMeets ? '✓ Met' : '✗ Not Met'}`, 11, false, 'center');
  yPosition += 5;
  addText(`Alternative Assessments Met: ${otherAssessmentsMet}`, 11, false, 'center');
  yPosition += 15;

  pdf.setTextColor(0, 0, 0);

  // Assessment Details
  checkNewPage(60);
  addText('Assessment Details', 16, true);
  yPosition += 10;

  // ELPAC
  if (studentData.elpacResult) {
    const { level, overallScore, oralScore, writtenScore, meets } = studentData.elpacResult;
    const target = grade === 7 ? 1576 : 1590;

    addText('ELPAC Assessment', 14, true);
    yPosition += 5;
    addText(`  Overall Level: ${level} ${meets ? '✓' : '✗'}`, 11);
    yPosition += 5;
    addText(`  Overall Score: ${overallScore} / ${target}`, 11);
    yPosition += 5;
    addText(`  Oral Language: ${oralScore}`, 11);
    yPosition += 5;
    addText(`  Written Language: ${writtenScore}`, 11);
    yPosition += 10;
  }

  // SBAC
  if (studentData.sbacScore) {
    checkNewPage(25);
    addText('SBAC ELA', 14, true);
    yPosition += 5;
    addText(`  Score: ${studentData.sbacScore}`, 11);
    yPosition += 5;
    addText(`  Level: ${studentData.sbacResult?.level || 'Not determined'}`, 11);
    yPosition += 5;
    addText(`  Status: ${studentData.sbacResult?.meets ? '✓ Met' : '✗ Not Met'}`, 11);
    yPosition += 10;
  }

  // i-Ready
  if (studentData.iReadyScore) {
    checkNewPage(20);
    const target = grade === 7
      ? (studentData.cycle === 1 ? 562 : 567)
      : 567;
    const meets = parseInt(studentData.iReadyScore) >= target;

    addText('i-Ready Reading', 14, true);
    yPosition += 5;
    addText(`  Score: ${studentData.iReadyScore} / ${target}`, 11);
    yPosition += 5;
    addText(`  Status: ${meets ? '✓ Met' : '✗ Not Met'}`, 11);
    yPosition += 10;
  }

  // Edcite A
  if (studentData.edciteAScore) {
    checkNewPage(20);
    const target = grade === 7 ? 40 : 41;
    const meets = parseInt(studentData.edciteAScore) >= target;

    addText('Edcite A', 14, true);
    yPosition += 5;
    addText(`  Score: ${studentData.edciteAScore} / ${target}`, 11);
    yPosition += 5;
    addText(`  Status: ${meets ? '✓ Met' : '✗ Not Met'}`, 11);
    yPosition += 10;
  }

  // Edcite B
  if (studentData.edciteBScore) {
    checkNewPage(20);
    const target = grade === 7 ? 38 : 42;
    const meets = parseInt(studentData.edciteBScore) >= target;

    addText('Edcite B', 14, true);
    yPosition += 5;
    addText(`  Score: ${studentData.edciteBScore} / ${target}`, 11);
    yPosition += 5;
    addText(`  Status: ${meets ? '✓ Met' : '✗ Not Met'}`, 11);
    yPosition += 10;
  }

  // Recommendations
  checkNewPage(60);
  addText('Next Steps & Recommendations', 16, true);
  yPosition += 10;

  if (canReclassify) {
    addText('✓ Congratulations! You have met all requirements for reclassification.', 11);
    yPosition += 5;
    addText('✓ Next: Schedule a meeting with your counselor to complete the process.', 11);
    yPosition += 5;
  } else if (!elpacMeets) {
    addText('• Priority: Focus on achieving ELPAC Level 4 first.', 11);
    yPosition += 5;
    addText('• This is a mandatory requirement for all students.', 11);
    yPosition += 5;
    if (studentData.elpacResult) {
      const pointsNeeded = (grade === 7 ? 1576 : 1590) - studentData.elpacResult.overallScore;
      addText(`• You need ${pointsNeeded} more overall points to reach Level 4.`, 11);
      yPosition += 5;
    }
  } else if (otherAssessmentsMet === 0) {
    addText('✓ Great! You have achieved ELPAC Level 4.', 11);
    yPosition += 5;
    addText('• Now focus on meeting at least ONE other assessment requirement.', 11);
    yPosition += 5;
    addText('• Choose the assessment where you are closest to the target.', 11);
    yPosition += 5;
  }

  yPosition += 10;
  addText('Study Tips:', 14, true);
  yPosition += 5;
  addText('• Work with your ELL teacher regularly', 11);
  yPosition += 5;
  addText('• Complete i-Ready lessons daily', 11);
  yPosition += 5;
  addText('• Practice reading 20+ minutes per day', 11);
  yPosition += 5;
  addText('• Ask questions in class', 11);
  yPosition += 10;

  // Footer
  pdf.setFontSize(9);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    'Generated with Road to Reclassification',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return pdf;
};

/**
 * Generate and download PDF
 */
export const downloadPDF = async (studentData, options = {}) => {
  try {
    const pdf = await generatePDFReport(studentData, options);
    const fileName = `Reclassification_Report_${options.studentName || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

/**
 * Capture chart as image and add to PDF
 */
export const captureChartAsImage = async (elementId) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) return null;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing chart:', error);
    return null;
  }
};

/**
 * Generate comprehensive PDF with charts
 */
export const generateComprehensivePDF = async (studentData, chartIds = [], options = {}) => {
  try {
    const pdf = await generatePDFReport(studentData, options);

    // Add new page for charts
    if (chartIds.length > 0) {
      pdf.addPage();
      let yPos = 15;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Visual Progress Analysis', 15, yPos);
      yPos += 15;

      // Capture and add each chart
      for (const chartId of chartIds) {
        const imageData = await captureChartAsImage(chartId);
        if (imageData) {
          const imgWidth = 180;
          const imgHeight = 100;

          if (yPos + imgHeight > pdf.internal.pageSize.getHeight() - 15) {
            pdf.addPage();
            yPos = 15;
          }

          pdf.addImage(imageData, 'PNG', 15, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 10;
        }
      }
    }

    const fileName = `Comprehensive_Report_${options.studentName || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating comprehensive PDF:', error);
    return false;
  }
};
