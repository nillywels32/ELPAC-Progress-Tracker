# 🚀 Quick Start Guide

Get the Road to Reclassification app running in 3 simple steps!

## Step 1: Install Dependencies

Open your terminal in this folder and run:

```bash
npm install
```

This will install:
- React & React DOM
- Recharts (for charts)
- Framer Motion (for animations)
- jsPDF & html2canvas (for PDF export)
- React Confetti (for celebrations)
- Vite (development server)

## Step 2: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 3: Open in Browser

Navigate to **http://localhost:3000** in your web browser.

That's it! 🎉

---

## 📖 How to Use the App

### For Students:

1. **Enter your name** at the top
2. **Select your grade** (7th or 8th)
3. **Enter ELPAC scores** (Oral and Written Language)
4. **Enter other assessment scores** (SBAC, i-Ready, Edcite A/B)
5. **Watch your progress** update in real-time!
6. **Download PDF report** when ready

### Understanding Your Progress:

- **Green** = Requirement met ✅
- **Blue** = Making progress 📈
- **Orange** = Needs work 📚
- **Red** = Not met yet ❌

### Reclassification Requirements:

You need **BOTH**:
1. ✅ ELPAC Level 4 (mandatory)
2. ✅ At least ONE other assessment

---

## 🎯 Example: Test the App

Try these sample scores to see the app in action:

### Example 1: Student Who Qualifies
```
Grade: 7th
ELPAC Oral: 1600
ELPAC Written: 1600
i-Ready: 570
```
Result: **Ready to Reclassify!** 🎉

### Example 2: Close to Qualifying
```
Grade: 7th
ELPAC Oral: 1580
ELPAC Written: 1580
i-Ready: 555
```
Result: Need 7 more i-Ready points

### Example 3: Focus on ELPAC
```
Grade: 7th
ELPAC Oral: 1550
ELPAC Written: 1550
SBAC: 2500
```
Result: SBAC met, but ELPAC Level 4 required first

---

## 📊 Chart Features

Once you enter scores, you'll see:

1. **Radial Progress Gauge** - Overall completion percentage
2. **Comparison Bar Chart** - Your score vs. target for each test
3. **ELPAC Breakdown** - Oral vs. Written language scores
4. **Achievement Radar** - Visual profile across all assessments

---

## 📄 Exporting Reports

### Quick Summary PDF
- Click "Quick Summary PDF"
- 1-page overview
- Downloads instantly

### Detailed PDF with Charts
- Click "Detailed PDF"
- Includes all charts and graphs
- Takes a few seconds to generate

### Print View
- Click "Print View"
- Uses browser print dialog
- Great for immediate printing

---

## 💾 Data Saving

The app automatically saves your data to your browser's local storage:

- ✅ Saves every time you change a score
- ✅ Loads automatically when you return
- ✅ Clears when you clear browser data

**To manually clear data:**
Open browser console (F12) and type:
```javascript
localStorage.clear()
```

---

## 🎨 Customization

### Change Colors
Edit files in `/components/charts/` and look for color values:
- `#10b981` = Green (success)
- `#3b82f6` = Blue (progress)
- `#f97316` = Orange (warning)

### Change Targets
Edit `/utils/calculations.js` and update the `getAssessmentData` function.

### Add New Assessments
1. Add input field in `RoadToReclassificationEnhanced.jsx`
2. Add calculation logic in `/utils/calculations.js`
3. Update chart data arrays

---

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
npm run dev -- --port 3001
```

### Charts not showing?
- Make sure you entered scores
- Check browser console (F12) for errors
- Refresh the page

### PDF not downloading?
- Try "Quick Summary" first
- Check if popup blocker is enabled
- Ensure all scores are valid numbers

### Animations choppy?
- Close other browser tabs
- Check if "Reduce Motion" is enabled in OS settings
- Try a different browser

---

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [calculations.test.js](tests/calculations.test.js) to verify accuracy
- Customize colors and branding for your school
- Share with teachers and students!

---

## 🎓 For Teachers

### Classroom Setup
1. Project on screen during ELL lessons
2. Use for 1-on-1 goal setting conferences
3. Generate reports for parent meetings
4. Track multiple students (export data between sessions)

### Best Practices
- Start with ELPAC explanation (it's mandatory)
- Show how one assessment is enough (plus ELPAC)
- Celebrate progress, not just completion
- Use charts to motivate students

---

## 💡 Tips for Success

1. **Enter data progressively** - You don't need all scores at once
2. **Focus on ELPAC first** - It's required for everyone
3. **Check the radar chart** - Shows your strongest areas
4. **Download reports regularly** - Track improvement over time
5. **Share with family** - PDF reports are student-friendly

---

## ❓ Common Questions

**Q: Do I need to enter all assessment scores?**
A: No! Enter what you have. The app works with any combination.

**Q: Can I track multiple students?**
A: Currently one at a time. Export PDF, clear data, enter next student.

**Q: Are my scores uploaded anywhere?**
A: No! Everything stays in your browser. No server uploads.

**Q: Can I use this on mobile?**
A: Yes! Fully responsive design works on phones and tablets.

**Q: How accurate are the calculations?**
A: Run the test file to verify: `node tests/calculations.test.js`

---

**Happy tracking! 🎯**

Questions? Check the main [README.md](README.md) for more details.
