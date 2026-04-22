// js/game/progress.js
let userData = { stars: 0, currentLevel: 'Basic', progress: {}, streak: 0 };

auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = 'login.html';

  document.getElementById('studentName').textContent = user.displayName || user.email.split('@')[0];

  const docRef = db.collection('userProgress').doc(user.uid);
  const doc = await docRef.get();

  if (doc.exists) {
    userData = doc.data();
  } else {
    await docRef.set({
      displayName: user.displayName || user.email.split('@')[0],
      email: user.email,
      stars: 0,
      streak: 0,
      currentLevel: 'Basic',
      progress: { basic: 0 },
      lastLogin: null,
      lastActive: new Date()
    });
  }

  // Daily streak + bonus
  const today = new Date().toDateString();
  if (userData.lastLogin !== today) {
    const bonus = (userData.streak || 0) + 1;
    userData.stars += bonus * 5;
    userData.streak = bonus;
    await docRef.update({ lastLogin: today, streak: bonus, stars: userData.stars });
    if (bonus > 1) alert(`🔥 حضور يومي ${bonus} أيام! +${bonus * 5} نجوم هدية!`);
  }

  updateDashboard();
  loadLeaderboard();
});

function updateDashboard() {
  document.getElementById('totalStars').textContent = `${userData.stars} ⭐`;
  document.getElementById('totalMedals').textContent = `${Math.floor(userData.stars / 10)} 🏅`;
  document.getElementById('currentLevel').textContent = userData.currentLevel || 'Basic';

  const levels = ['Basic', 'Beginner', 'Intermediate', 'Advanced'];
  const grid = document.getElementById('levelsGrid');
  grid.innerHTML = '';

  levels.forEach((lvl, i) => {
    const isUnlocked = i === 0 || userData.progress[levels[i-1].toLowerCase()] === 100;
    const progress = userData.progress[lvl.toLowerCase()] || 0;

    const card = document.createElement('div');
    card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <h3>${lvl === 'Basic' ? 'المستوى الأساسي' : lvl + ' Level'}</h3>
      <div class="level-progress">${progress}% مكتمل</div>
      ${!isUnlocked ? '<div class="lock-overlay">🔒 أكمل المستوى السابق</div>' : ''}
    `;
    if (isUnlocked) {
      card.onclick = () => location.href = lvl === 'Basic' ? 'basic.html' : `sentences.html?level=${lvl.toLowerCase()}`;
    }
    grid.appendChild(card);
  });

  if (Object.values(userData.progress).some(p => p === 100)) {
    document.getElementById('certBtn').style.display = 'block';
    document.querySelector('.btn-certificate').onclick = () => location.href = 'certificate.html';
  }
}

async function loadLeaderboard() {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const snap = await db.collection('userProgress')
    .where('lastActive', '>', new Date(oneWeekAgo))
    .orderBy('stars', 'desc')
    .limit(10)
    .get();

  const list = document.getElementById('leaderboardList');
  list.innerHTML = snap.docs.map((doc, i) => {
    const d = doc.data();
    return `<li><strong>${i+1}. ${d.displayName}</strong> → ${d.stars} نجمة ⭐</li>`;
  }).join('') || '<li>لا يوجد لاعبون بعد</li>';
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  auth.signOut().then(() => location.href = 'login.html');
});