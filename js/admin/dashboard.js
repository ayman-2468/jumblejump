// js/admin/dashboard.js
auth.onAuthStateChanged(user => {
  if (!user || !['teacher@jumblejump.com', 'admin@jumblejump.com', 'your-email@gmail.com'].includes(user.email)) {
    alert('غير مصرح لك بالدخول');
    location.href = 'login.html';
  }
});

// Load Students Table
async function loadStudents() {
  const tbody = document.querySelector('#studentsTable tbody');
  tbody.innerHTML = '<tr><td colspan="6">جاري التحميل...</td></tr>';

  const snap = await db.collection('userProgress').orderBy('lastActive', 'desc').get();
  tbody.innerHTML = snap.docs.map(doc => {
    const d = doc.data();
    return `<tr>
      <td>${d.displayName || 'طالب'}</td>
      <td>${d.email}</td>
      <td>${d.currentLevel || 'Basic'}</td>
      <td>⭐ ${d.stars || 0}</td>
      <td>🏅 ${Math.floor((d.stars || 0)/10)}</td>
      <td>${new Date(d.lastActive?.toDate()).toLocaleDateString('ar-SA')}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="6">لا يوجد طلاب بعد</td></tr>';
}
loadStudents();

// Save Game Settings
document.querySelectorAll('[data-setting]').forEach(btn => {
  btn.onclick = () => {
    const key = btn.dataset.setting;
    const input = key === 'sentencesPerLevel' ? 'sentencesPerLevel' : 'maxTrials';
    const value = document.getElementById(input).value;
    db.collection('appSettings').doc('game').set({[key]: parseInt(value)}, {merge: true})
      .then(() => alert('تم حفظ الإعدادات'));
  };
});

// Delete All Data
document.getElementById('deleteAllBtn').onclick = async () => {
  if (!confirm('هل أنت متأكد؟ سيتم حذف كل الأسئلة والفئات')) return;
  if (!confirm('آخر تحذير - لا يمكن التراجع')) return;

  const collections = ['basicCategories', 'sentences', 'userProgress'];
  for (const col of collections) {
    const snap = await db.collection(col).get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  alert('تم حذف كل البيانات');
};

// Test as Student
document.getElementById('playAsStudentBtn').onclick = () => {
  window.open('index.html', '_blank');
};