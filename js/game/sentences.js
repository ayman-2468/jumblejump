// js/game/sentences.js
let currentLevel = 'beginner';
let sentences = [];
let currentIndex = 0;
let currentSentence = null;
let trialsLeft = 2;
let stars = 0;

const urlParams = new URLSearchParams(window.location.search);
currentLevel = urlParams.get('level') || 'beginner';

auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = 'login.html';
  const doc = await db.collection('userProgress').doc(user.uid).get();
  stars = doc.data().stars || 0;
  currentIndex = doc.data().progress?.[currentLevel] || 0;
  loadSentences();
});

async function loadSentences() {
  document.getElementById('currentLevelName').textContent = currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1);
  const snap = await db.collection('sentences').doc(currentLevel).get();
  if (!snap.exists) {
    document.querySelector('.sentence-area').innerHTML = '<h2>المعلم لم يضف أسئلة بعد 😊</h2>';
    return;
  }
  sentences = snap.data().items || [];
  showSentence();
}

function showSentence() {
  if (currentIndex >= sentences.length) {
    completeLevel();
    return;
  }

  currentSentence = sentences[currentIndex];
  trialsLeft = 2;
  document.getElementById('hintArea').style.display = 'none';
  document.getElementById('questionCounter').textContent = `${currentIndex + 1} / ${sentences.length}`;

  const words = [...currentSentence.scrambled].sort(() => Math.random() - 0.5);
  const builder = document.getElementById('sentenceBuilder');
  builder.innerHTML = '';
  words.forEach(word => {
    const span = document.createElement('span');
    span.className = 'word-item';
    span.textContent = word;
    span.draggable = true;
    span.onclick = () => new SpeechSynthesisUtterance(word).lang = 'en-US', speechSynthesis.speak(new SpeechSynthesisUtterance(word));
    builder.appendChild(span);
  });

  new Sortable(builder, { animation: 150 });
  updateProgressBar();
}

document.getElementById('checkBtn').onclick = () => {
  const userAnswer = Array.from(document.querySelectorAll('#sentenceBuilder .word-item'))
    .map(w => w.textContent.trim()).join(' ');

  if (userAnswer === currentSentence.correct.trim()) {
    success();
  } else {
    trialsLeft--;
    if (trialsLeft > 0) {
      document.getElementById('trialsLeft').textContent = trialsLeft;
      document.getElementById('hintArea').style.display = 'block';
      document.getElementById('hintText').textContent = currentSentence.hint || "حاول مرة أخرى!";
    } else {
      setTimeout(showSentence, 2000);
    }
  }
};

function success() {
  document.getElementById('correctSound')?.play();
  confetti({ particleCount: 200, spread: 80 });
  stars++; currentIndex++;

  document.getElementById('starsEarned').textContent = `⭐ ${stars}`;
  document.getElementById('grammarSpotlight').textContent = currentSentence.grammarRule || "ممتاز!";
  document.getElementById('motivationalQuote').textContent = ["ممتاز!", "رائع!", "أحسنت!", "يا بطل!"][Math.floor(Math.random()*4)];

  db.collection('userProgress').doc(auth.currentUser.uid).update({
    stars, [`progress.${currentLevel}`]: currentIndex, lastActive: new Date()
  });

  document.getElementById('successOverlay').style.display = 'flex';
}

document.getElementById('nextBtn').onclick = () => {
  document.getElementById('successOverlay').style.display = 'none';
  showSentence();
};

function completeLevel() {
  db.collection('userProgress').doc(auth.currentUser.uid).update({
    [`progress.${currentLevel}`]: 100,
    currentLevel: currentLevel === 'advanced' ? 'Master' : 'Advanced'
  });
  alert("🎉 مبروووك! أكملت المستوى بنجاح!");
  setTimeout(() => location.href = 'index.html', 2000);
}

function updateProgressBar() {
  const percent = (currentIndex / sentences.length) * 100;
  document.getElementById('progressFill').style.width = percent + '%';
}