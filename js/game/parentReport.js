// js/game/parentReport.js
async function generateReport() {
  const user = auth.currentUser;
  if (!user) return alert("يجب تسجيل الدخول");

  const doc = await db.collection('userProgress').doc(user.uid).get();
  const data = doc.data();

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');

  pdf.addImage('assets/logo.png', 'PNG', 75, 20, 60, 60);

  pdf.setFontSize(32);
  pdf.text('تقرير تقدم الطالب', 105, 100, { align: 'center' });

  pdf.setFontSize(28);
  pdf.setTextColor(255, 111, 0);
  pdf.text(data.displayName || user.email.split('@')[0], 105, 130, { align: 'center' });

  pdf.setFontSize(22);
  pdf.setTextColor(0, 105, 92);
  pdf.text(`النجوم: ${data.stars || 0} ⭐`, 105, 160, { align: 'center' });
  pdf.text(`المستوى: ${data.currentLevel || 'Basic'}`, 105, 180, { align: 'center' });
  pdf.text(`الخط اليومي: ${data.streak || 0} أيام 🔥`, 105, 200, { align: 'center' });

  pdf.setFontSize(16);
  pdf.text('تطبيق جمبل جمب - المملكة العربية السعودية', 105, 240, { align: 'center' });

  pdf.save(`${data.displayName || 'طالب'}_تقرير_جمبل_جمب.pdf`);
}

auth.onAuthStateChanged(user => {
  if (user) generateReport(); // Auto-generate on open
});