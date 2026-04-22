// js/game/basicLevel.js
let currentQuestion = null;
let currentQuestionIndex = 0;
let totalQuestions = 100;
let maxTrials = 2;
let trialsLeft = maxTrials;
let userStars = 0;
let questions = [];

const quotes = [
  "ممتاز! استمر هكذا وستتقن الإنجليزية بسرعة!",
  "رائع جداً! أنت بطل التصنيف اليوم!",
  "أحسنت! ذكاءك يبهرني!",
  "يا سلام! كل كلمة في مكانها الصحيح!"
];

auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "login.html";
  
  // Load user progress
  const doc = await db.collection('userProgress').doc(user.uid).get();
  if (doc.exists) {
    userStars = doc.data().stars || 0;
    currentQuestionIndex = doc.data().basicProgress || 0;
    document.getElementById('starsEarned').textContent = `⭐ ${userStars}`;
  }

  loadQuestions();
});

async function loadQuestions() {
  const snap = await db.collection('basicCategories').get();
  questions = snap.docs.map(doc => ({id: doc.id, ...doc.data()}));
  totalQuestions = questions.length;

  if (totalQuestions === 0) {
    alert("المعلم لم يضف أسئلة بعد. انتظر التحديث!");
    return;
  }
  showNextQuestion();
}

function showNextQuestion() {
  if (currentQuestionIndex >= totalQuestions) {
    alert("مبروووك! أكملت المستوى الأساسي بنجاح! 🎉");
    db.collection('userProgress').doc(auth.currentUser.uid).update({
      basicCompleted: true,
      currentLevel: 'Beginner'
    });
    location.href = 'index.html';
    return;
  }

  currentQuestion = questions[currentQuestionIndex];
  trialsLeft = maxTrials;
  document.getElementById('questionCounter').textContent = `سؤال ${currentQuestionIndex + 1} من ${totalQuestions}`;
  document.getElementById('hintArea').style.display = 'none';

  renderCategories();
  renderWordBank();
  currentQuestionIndex++;
}

function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  const mainBox = document.createElement('div');
  mainBox.className = 'category-box';
  mainBox.innerHTML = `
    <div class="category-title">${currentQuestion.mainCategory}</div>
    <div class="subcategory-title">${currentQuestion.subcategory}</div>
    <div class="dropped-words" id="dropZone"></div>
  `;
  grid.appendChild(mainBox);

  // Add 3 distractors
  const distractors = ['Animals', 'Food', 'Colors', 'Family', 'School', 'Sports'];
  const used = [currentQuestion.mainCategory];
  while (grid.children.length < 4) {
    const rand = distractors[Math.floor(Math.random() * distractors.length)];
    if (!used.includes(rand)) {
      used.push(rand);
      const box = document.createElement('div');
      box.className = 'category-box';
      box.innerHTML = `<div class="category-title">${rand}</div><div class="dropped-words"></div>`;
      grid.appendChild(box);
    }
  }

  new Sortable(document.getElementById('dropZone'), {
    group: 'words',
    animation: 150
  });
}

function renderWordBank() {
  const list = document.getElementById('wordsList');
  list.innerHTML = '';

  let words = currentQuestion.jumbledWords.slice();
  const extra = ['cat', 'apple', 'red', 'mother', 'book', 'ball', 'sun', 'car'];
  while (words.length < 10) {
    const w = extra[Math.floor(Math.random() * extra.length)];
    if (!words.includes(w)) words.push(w);
  }
  words.sort(() => Math.random() - 0.5);

  words.forEach(word => {
    const el = document.createElement('span');
    el.className = 'word-item';
    el.textContent = word;
    el.draggable = true;
    el.onclick = () => {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = 'en-US';
      speechSynthesis.speak(utter);
    };
    list.appendChild(el);
  });

  new Sortable(list, { group: 'words', animation: 150 });
}

document.getElementById('checkBtn').onclick = () => {
  const dropped = document.querySelectorAll('#dropZone .word-item');
  const correctWords = currentQuestion.jumbledWords.map(w => w.toLowerCase());
  const userWords = Array.from(dropped).map(el => el.textContent.toLowerCase());

  if (userWords.length !== correctWords.length) return;

  const correct = correctWords.every(w => userWords.includes(w)) &&
                  userWords.every(w => correctWords.includes(w));

  if (correct) {
    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
    document.getElementById('correctSound')?.play();
    
    userStars++;
    document.getElementById('starsEarned').textContent = `⭐ ${userStars}`;
    document.getElementById('progressFill').style.width = `${(currentQuestionIndex/totalQuestions)*100}%`;

    document.getElementById('grammarSpotlight').textContent = 
      `${currentQuestion.mainCategory} → ${currentQuestion.subcategory}`;

    document.getElementById('motivationalQuote').textContent = 
      quotes[Math.floor(Math.random() * quotes.length)];

    document.getElementById('successOverlay').style.display = 'flex';

    db.collection('userProgress').doc(auth.currentUser.uid).set({
      stars: userStars,
      basicProgress: currentQuestionIndex,
      lastActive: new Date()
    }, { merge: true });

  } else {
    trialsLeft--;
    if (trialsLeft > 0) {
      document.getElementById('trialsLeft').textContent = trialsLeft;
      document.getElementById('hintArea').style.display = 'block';
      document.getElementById('hintText').textContent = currentQuestion.hint || "حاول مرة أخرى!";
    } else {
      alert("الإجابة الصحيحة: " + currentQuestion.jumbledWords.join(', '));
      showNextQuestion();
    }
  }
};

document.getElementById('nextQuestionBtn').onclick = () => {
  document.getElementById('successOverlay').style.display = 'none';
  showNextQuestion();
};