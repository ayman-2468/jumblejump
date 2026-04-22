// js/admin/noCodeEditor.js
document.querySelectorAll('.editor-tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.editor-panel').forEach(p => p.style.display = 'none');
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).style.display = 'block';
  };
});

// Load saved config
db.collection('appSettings').doc('liveConfig').onSnapshot(doc => {
  if (doc.exists) {
    const c = doc.data();
    Object.keys(c).forEach(key => {
      const el = document.getElementById(key);
      if (el) el.value = c[key];
    });
  }
});

// Save functions
window.saveTextContent = () => {
  const data = {
    welcomeText: document.getElementById('welcomeText').value,
    quotes: document.getElementById('motivationQuotes').value.split('\n')
  };
  db.collection('appSettings').doc('liveConfig').set(data, {merge: true})
    .then(() => alert('تم حفظ النصوص'));
};

window.saveGameRules = () => {
  const data = {
    starsPerCorrect: +document.getElementById('starsPerCorrect').value,
    medalsEvery: +document.getElementById('medalsEvery').value,
    confettiPower: +document.getElementById('confettiPower').value
  };
  db.collection('appSettings').doc('liveConfig').set(data, {merge: true})
    .then(() => alert('تم حفظ قوانين اللعبة'));
};

window.saveUISettings = () => {
  db.collection('appSettings').doc('liveConfig').set({
    showNames: document.getElementById('showNames').value === 'true',
    appLang: document.getElementById('appLang').value
  }, {merge: true}).then(() => alert('تم حفظ إعدادات الواجهة'));
};