import React, { useState } from 'react';
import { Printer, Download, FileText, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { downloadPDF, generateComprehensivePDF } from '../../utils/pdfGenerator';

/**
 * Export Buttons Component
 * Provides options for downloading/printing PDF reports
 */
const ExportButtons = ({ studentData, studentName = 'Student', grade = 7 }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [name, setName] = useState(studentName);

  const handleQuickPDF = async () => {
    setIsGenerating(true);
    try {
      const success = await downloadPDF(studentData, {
        studentName: name,
        grade: grade,
        format: 'summary'
      });

      if (success) {
        alert('PDF generated successfully!');
      } else {
        alert('Error generating PDF. Please try again.');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDetailedPDF = async () => {
    setIsGenerating(true);
    try {
      const chartIds = [
        'comparison-chart',
        'elpac-breakdown-chart',
        'radar-chart'
      ];

      const success = await generateComprehensivePDF(studentData, chartIds, {
        studentName: name,
        grade: grade,
        format: 'detailed',
        includeCharts: true
      });

      if (success) {
        alert('Comprehensive PDF generated successfully!');
      } else {
        alert('Error generating PDF. Please try again.');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FileText className="text-blue-600" size={24} />
        Export Your Progress Report
      </h3>

      {/* Student Name Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Student Name (for report)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter student name"
        />
      </div>

      {/* Export Options */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Quick Summary PDF */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleQuickPDF}
          disabled={isGenerating}
          className="flex flex-col items-center gap-2 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={32} />
          <span className="font-semibold text-sm text-center">
            Quick Summary PDF
          </span>
          <span className="text-xs opacity-90">1-page overview</span>
        </motion.button>

        {/* Detailed PDF with Charts */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDetailedPDF}
          disabled={isGenerating}
          className="flex flex-col items-center gap-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FileText size={32} />
          <span className="font-semibold text-sm text-center">
            Detailed PDF
          </span>
          <span className="text-xs opacity-90">With charts & graphs</span>
        </motion.button>

        {/* Print Current View */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="flex flex-col items-center gap-2 p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Printer size={32} />
          <span className="font-semibold text-sm text-center">
            Print View
          </span>
          <span className="text-xs opacity-90">Browser print</span>
        </motion.button>
      </div>

      {/* Loading Indicator */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center justify-center gap-2 text-blue-600"
        >
          <Loader className="animate-spin" size={20} />
          <span className="font-medium">Generating PDF...</span>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Use the Quick Summary for a fast overview, or the Detailed PDF
          to include all charts and visual progress indicators. Share these reports with your
          teachers, counselors, and family!
        </p>
      </div>
    </div>
  );
};

export default ExportButtons;
