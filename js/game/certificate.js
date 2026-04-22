// js/game/certificate.js
auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = 'login.html';

  const doc = await db.collection('userProgress').doc(user.uid).get();
  const data = doc.data();

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('l', 'mm', 'a4');

  // Gold border
  pdf.setFillColor(255, 215, 0);
  pdf.rect(10, 10, 277, 190, 'F');
  pdf.setFillColor(255, 255, 255);
  pdf.rect(15, 15, 267, 180, 'F');

  // Logo
  pdf.addImage('assets/logo.png', 'PNG', 20, 20, 50, 50);

  // Title
  pdf.setFontSize(42);
  pdf.setTextColor(255, 215, 0);
  pdf.text('شهادة تقدير', 148.5, 70, { align: 'center' });

  pdf.setFontSize(32);
  pdf.setTextColor(0, 105, 92);
  pdf.text('يُمنح هذا التقدير للطالب', 148.5, 100, { align: 'center' });

  pdf.setFontSize(48);
  pdf.setTextColor(255, 215, 0);
  pdf.text(data.displayName || user.email.split('@')[0], 148.5, 130, { align: 'center' });

  pdf.setFontSize(28);
  pdf.setTextColor(0, 105, 92);
  pdf.text(`لإكماله مستوى ${data.currentLevel} بـ ${data.stars} نجمة ⭐`, 148.5, 160, { align: 'center' });

  // Gold seal
  pdf.setFillColor(255, 215, 0);
  pdf.circle(220, 170, 25, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('مصدقة', 220, 168, { align: 'center' });

  pdf.save(`شهادة_${data.displayName}_جمبل_جمب.pdf`);
});