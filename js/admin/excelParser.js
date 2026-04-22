// js/admin/excelParser.js
document.querySelectorAll('.btn-upload').forEach(btn => {
  btn.onclick = async () => {
    const type = btn.dataset.type;
    const fileInput = type === 'basic' ? 'basicExcel' : 'sentencesExcel';
    const file = document.getElementById(fileInput).files[0];
    if (!file) return alert('اختر ملف Excel أولاً');

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const batch = db.batch();

    if (type === 'basic') {
      rows.forEach(row => {
        const id = row.Question_ID || 'q' + Date.now() + Math.random();
        batch.set(db.collection('basicCategories').doc(id), {
          mainCategory: row.Main_Category?.trim(),
          subcategory: row.Subcategory?.trim(),
          jumbledWords: row.Jumbled_Words.split('|').map(w => w.trim()),
          hint: row.Hint || '',
          teacherNote: row.Teacher_Note || ''
        });
      });
    } else {
      // Sentence levels
      rows.forEach(row => {
        const level = row.Level.toLowerCase();
        const item = {
          scrambled: row.Scrambled_Words.split('|').map(w => w.trim()),
          correct: row.Correct_Sentence.trim(),
          grammarRule: row.Grammar_Rule || '',
          teacherNote: row.Teacher_Note || ''
        };
        batch.set(db.collection('sentences').doc(level), {
          items: firebase.firestore.FieldValue.arrayUnion(item)
        }, { merge: true });
      });
    }

    await batch.commit();
    alert(`تم رفع ${rows.length} عنصر بنجاح!`);
    document.getElementById(fileInput).value = '';
  };
});