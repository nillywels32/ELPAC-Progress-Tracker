# Road to Reclassification - Enhanced ELPAC Progress Tracker

A comprehensive, interactive web application for tracking student progress toward ELPAC reclassification with visual analytics, animations, and PDF export capabilities.

## 🌟 Features

### 📊 Visual Analytics
- **Comparison Bar Chart** - Compare current scores vs. target scores across all assessments
- **Radial Progress Gauge** - Circular progress indicator for overall reclassification status
- **ELPAC Breakdown Chart** - Detailed view of Oral vs. Written language scores
- **Achievement Radar Chart** - Spider chart showing proficiency across all 5 assessments
- **Progress Timeline** - Track score improvements over time

### ✨ Animations & Interactions
- Smooth entrance animations for all components
- Progress bar animations that count up to target
- Celebration effects with confetti when student qualifies
- Success badges that bounce in when requirements are met
- Responsive hover effects and transitions

### 📄 PDF Export
- **Quick Summary PDF** - 1-page overview of assessment progress
- **Detailed PDF** - Comprehensive report with charts and graphs
- **Print View** - Browser-based printing with optimized layout
- Customizable student name on reports

### 💾 Data Persistence
- Automatic saving to browser localStorage
- Load saved data on page refresh
- Assessment history tracking
- Export/import data for backup

### 🎯 Precise Calculations
- All calculations maintain accuracy to avoid floating-point errors
- ELPAC overall score: (Oral + Written) ÷ 2
- Progress percentages calculated precisely
- Dual requirement tracking: ELPAC Level 4 + 1 other assessment

## 📋 Requirements

Students need to meet **BOTH** of these requirements:

1. **ELPAC Level 4** (MANDATORY)
   - Grade 7: Overall score ≥ 1576
   - Grade 8: Overall score ≥ 1590

2. **ONE of the following assessments:**
   - **SBAC ELA**: Nearly Met or above (Grade 7: ≥2479, Grade 8: ≥2487)
   - **i-Ready Reading**: Grade 7: ≥562 (Cycle 1) or ≥567 (Cycle 2), Grade 8: ≥567
   - **Edcite A**: Grade 7: ≥40, Grade 8: ≥41
   - **Edcite B**: Grade 7: ≥38, Grade 8: ≥42

## 🚀 Quick Start

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
ELPAC Path to Reclassification/
├── components/
│   ├── charts/
│   │   ├── ComparisonBarChart.jsx       # Score comparison visualization
│   │   ├── RadialProgressGauge.jsx      # Circular progress indicator
│   │   ├── ElpacBreakdownChart.jsx      # ELPAC domain breakdown
│   │   ├── AchievementRadarChart.jsx    # Spider chart for all assessments
│   │   └── ProgressTimelineChart.jsx    # Historical progress tracking
│   ├── animations/
│   │   ├── AnimatedCard.jsx             # Card entrance animations
│   │   ├── AnimatedProgress.jsx         # Progress bar animations
│   │   └── CelebrationEffect.jsx        # Confetti & success animations
│   └── PDFExport/
│       └── ExportButtons.jsx            # PDF generation controls
├── utils/
│   ├── calculations.js                  # Precise calculation functions
│   ├── localStorage.js                  # Data persistence utilities
│   └── pdfGenerator.js                  # PDF creation logic
├── src/
│   └── main.jsx                         # Application entry point
├── RoadToReclassificationEnhanced.jsx   # Main application component
├── RoadToReclassification.jsx           # Original component (reference)
├── index.html                           # HTML entry point
├── vite.config.js                       # Vite configuration
├── package.json                         # Dependencies and scripts
└── README.md                            # This file
```

## 🧮 Calculation Verification

### ELPAC Overall Score
```javascript
// Formula: (Oral Language + Written Language) ÷ 2
Oral: 1600
Written: 1550
Overall: (1600 + 1550) ÷ 2 = 1575

// Grade 7 Level 4 requires ≥1576
Result: Level 3 (1575 < 1576)
```

### Progress Percentage
```javascript
// Formula: (Current Score ÷ Target Score) × 100
Current: 550
Target: 562
Progress: (550 ÷ 562) × 100 = 97.86%
```

### Overall Reclassification Progress
```javascript
// ELPAC contributes 50%, Other assessment contributes 50%
ELPAC: Level 4 Met (50%)
i-Ready: 550/562 = 97.86% → 48.93%
Overall: 50% + 48.93% = 98.93%
```

## 🎨 Customization

### Colors
Edit the color schemes in component files:
- Green: Success/Met requirements (#10b981)
- Blue: Progress/In-progress (#3b82f6)
- Orange: Needs work (#f97316)
- Purple: Alternative paths (#a78bfa)

### Assessment Targets
Modify targets in `utils/calculations.js`:
```javascript
const data = {
  7: {
    iReady: { cycle1: 562, cycle2: 567 },
    edciteA: 40,
    edciteB: 38,
    // ...
  }
};
```

## 📊 Chart Libraries Used

- **Recharts** - React charting library built on D3
- **Framer Motion** - Animation library for React
- **jsPDF** - PDF generation
- **html2canvas** - Chart capture for PDF
- **react-confetti** - Celebration effects

## 🔧 Troubleshooting

### Charts not displaying
- Ensure all chart data has valid numeric values
- Check browser console for errors
- Verify recharts is installed: `npm install recharts`

### PDF generation fails
- Check that all required data is entered
- Ensure jspdf and html2canvas are installed
- Try the "Quick Summary" option first

### Data not saving
- Check browser localStorage is enabled
- Clear localStorage if data appears corrupted:
  ```javascript
  localStorage.clear()
  ```

### Animations not smooth
- Check if "Reduce Motion" is enabled in browser/OS settings
- Animations automatically respect `prefers-reduced-motion`

## 📝 Usage Tips

1. **Enter student name first** - It will be used on PDF reports
2. **Start with ELPAC** - It's mandatory for all students
3. **Focus on closest assessment** - The app highlights which test you're closest to passing
4. **Save regularly** - Auto-save is enabled but manual saves are recommended for important data
5. **Export reports** - Download PDF before clearing browser data

## 🎓 For Teachers

### Classroom Use
- Project on screen to explain requirements
- Use as a goal-setting tool in conferences
- Generate reports for parent meetings
- Track class-wide progress trends

### Data Privacy
- All data stored locally in browser
- No server uploads
- Clear data for each student after session
- Export data for offline storage if needed

## 🤝 Contributing

To add new features or fix bugs:

1. Create a new branch
2. Make your changes
3. Test thoroughly with real data
4. Submit a pull request

## 📄 License

This project is intended for educational use in schools supporting English Language Learners.

## 🙏 Acknowledgments

- Built for ELL students and teachers
- Based on California ELPAC reclassification criteria
- Designed with input from ELL coordinators and educators

## 📞 Support

For questions or issues:
- Check the troubleshooting section
- Review calculation verification tests
- Contact your school's ELL coordinator

---

**Made with ❤️ for ELL students working toward reclassification**

*Last Updated: October 2024*
