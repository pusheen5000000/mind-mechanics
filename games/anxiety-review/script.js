(() => {
  // Anxiety review questions, adapted from the Jeopardy review.
  // "clue" is shown to the player; "correct" is the term they're fishing for.
  const QUESTIONS = [
    { clue: 'Breathing in for 5, holding, and breathing out for 5 to help calm your body.', correct: 'Belly Breathing' },
    { clue: 'Tightening up a muscle really tight, then letting it relax.', correct: 'Progressive Muscle Relaxation' },
    { clue: 'Imagining your own calm, happy place with all your senses.', correct: 'Visualization' },
    { clue: 'Your worry alarm going off even though there is no real danger.', correct: 'A False Alarm' },
    { clue: 'Looking closely at the evidence for and against a worry.', correct: 'Worry Court' },
    { clue: 'Things you say to yourself that make you feel stronger and braver.', correct: 'Positive Self-Talk' },
    { clue: 'Things you say to yourself that make your worries feel bigger.', correct: 'Negative Self-Talk' },
    { clue: 'A specific time set aside each day just for worrying.', correct: 'Worry Time' },
    { clue: 'A place to keep your worries until you are ready to think about them.', correct: 'The Worry Box' },
    { clue: 'Special cards with reminders to help you think clearly when you feel anxious.', correct: 'Coping Cards' },
    { clue: 'The short name for the Cognitive Behavioral Therapy.', correct: 'CBT' },
    { clue: 'Thoughts, Feelings, and Actions, all connected together.', correct: 'The Anxiety Triad' },
  ];

  const FISH_IMAGES = ["images/fish1.png", "images/fish2.png", "images/fish3.png", "images/fish4.png", "images/fish5.png"];
  const MIN_BITE_DELAY = 1800; // ms before a question pops up
  const MAX_BITE_DELAY = 3600;
  const ENCOURAGEMENTS = [
    'You caught a fish! Great catch!',
    'You caught a fish! Nice work!',
    'You caught a fish! You\u2019re on a roll!',
    'You caught a fish! Keep it up!'
  ];

  // ---------- DOM refs ----------
  const playBtn = document.getElementById("play-btn");
  const startOverlay = document.getElementById("start-overlay");
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  const pondStage = document.getElementById("pond-stage");
  const progressText = document.getElementById("progress-text");
  const encourageText = document.getElementById("encourage-text");
  const personBtn = document.getElementById("person-btn");
  const personSprite = document.getElementById("person-sprite");
  const fishIcon = document.getElementById("fish-icon");
  const caughtFishContainer = document.getElementById("caught-fish-container");
  const quizOverlay = document.getElementById("quiz-overlay");
  const quizOverlayHome = quizOverlay.parentElement; // remember where it started (body)
  const quizClue = document.getElementById("quiz-clue");
  const optionA = document.getElementById("option-a");
  const optionB = document.getElementById("option-b");
  const quizFeedback = document.getElementById("quiz-feedback");

  // ---------- State ----------
  let gameStarted = false;
  let currentFish = "";
  let fishCaught = 0;
  let questionQueue = [];
  let encourageTimer = null;

  // ---------- Helpers ----------
  function shuffledQuestionOrder() {
    const pool = [...QUESTIONS];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }

  function nextQuestion() {
    if (questionQueue.length === 0) questionQueue = shuffledQuestionOrder();
    return questionQueue.pop();
  }

  function updateProgressText() {
    progressText.textContent = `Fish caught: ${fishCaught}`;
  }

  function showEncouragement() {
    encourageText.textContent = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    encourageText.classList.add("show");
    clearTimeout(encourageTimer);
    encourageTimer = setTimeout(() => encourageText.classList.remove("show"), 3000);
  }

  function setSprite(state) {
    personSprite.src = `images/${state}.png`;
    personSprite.alt = state === "fishing" ? "Person fishing at the pond" : "Person standing by the pond";
  }

  function addFishToPond() {
    const fish = document.createElement("img");
    fish.src = currentFish;
    fish.className = "caught-fish";
    fish.style.left = Math.random() * 70 + 15 + "%";
    fish.style.top = Math.random() * 40 + 20 + "%";
    caughtFishContainer.appendChild(fish);
  }

  // ---------- Fishing flow ----------
  function startFishing() {
    personBtn.classList.add("disabled");
    personBtn.setAttribute("aria-label", "Fishing... wait for a bite");
    setSprite("fishing");

    const delay = MIN_BITE_DELAY + Math.random() * (MAX_BITE_DELAY - MIN_BITE_DELAY);
    setTimeout(openQuiz, delay);
  }

  function returnToStanding() {
    setSprite("standing");
    personBtn.classList.remove("disabled");
    personBtn.setAttribute("aria-label", "Click to go fishing");
  }

  function openQuiz() {
    const questionData = nextQuestion();
    currentFish = FISH_IMAGES[Math.floor(Math.random() * FISH_IMAGES.length)];
    fishIcon.src = currentFish;

    // Pick a distinct wrong answer from the question pool
    let wrongPoolIndex;
    do {
      wrongPoolIndex = Math.floor(Math.random() * QUESTIONS.length);
    } while (QUESTIONS[wrongPoolIndex].correct === questionData.correct);
    const wrongTerm = QUESTIONS[wrongPoolIndex].correct;

    quizClue.textContent = questionData.clue;

    const correctFirst = Math.random() < 0.5;
    const optionAData = correctFirst ? { text: questionData.correct, correct: true } : { text: wrongTerm, correct: false };
    const optionBData = correctFirst ? { text: wrongTerm, correct: false } : { text: questionData.correct, correct: true };

    optionA.textContent = optionAData.text;
    optionA.dataset.correct = optionAData.correct;
    optionB.textContent = optionBData.text;
    optionB.dataset.correct = optionBData.correct;

    [optionA, optionB].forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("correct", "incorrect");
    });

    quizFeedback.hidden = true;
    quizFeedback.classList.remove("success", "fail");
    quizOverlay.hidden = false;
  }

  function closeQuizAndReset() {
    quizOverlay.hidden = true;
    returnToStanding();
  }

  function handleOptionClick(chosenBtn) {
    optionA.disabled = true;
    optionB.disabled = true;

    const isCorrect = chosenBtn.dataset.correct === "true";

    if (isCorrect) {
      chosenBtn.classList.add("correct");
      quizFeedback.classList.add("success");
      quizFeedback.hidden = false;
      fishCaught += 1;
      updateProgressText();
      showEncouragement();
      addFishToPond();
      setTimeout(closeQuizAndReset, 0); // correct answer disappears faster
    } else {
      chosenBtn.classList.add("incorrect");
      quizFeedback.textContent = "Not quite! The fish got away...";
      quizFeedback.classList.add("fail");
      quizFeedback.hidden = false;
      setTimeout(closeQuizAndReset, 1500); // wrong answer stays longer
    }
  }

  // ---------- Fullscreen ----------
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      pondStage.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    const isFullscreen = !!document.fullscreenElement;
    fullscreenBtn.textContent = isFullscreen ? "⤢" : "⛶";
    fullscreenBtn.setAttribute("aria-label", isFullscreen ? "Exit fullscreen" : "Toggle fullscreen");

    // Move the quiz overlay so it's still visible while fullscreened
    (isFullscreen ? pondStage : quizOverlayHome).appendChild(quizOverlay);
  });

  // ---------- Init ----------
  optionA.addEventListener("click", () => handleOptionClick(optionA));
  optionB.addEventListener("click", () => handleOptionClick(optionB));

  personBtn.addEventListener("click", () => {
    if (!gameStarted || personBtn.classList.contains("disabled")) return;
    startFishing();
  });

  playBtn.addEventListener("click", () => {
    gameStarted = true;
    startOverlay.style.display = "none";
  });

  updateProgressText();
  setSprite("standing");
})();