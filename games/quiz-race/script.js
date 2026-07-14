(() => {

  const setupCard = document.getElementById('setup-card');
  const raceWrap = document.getElementById('race-wrap');
  const startBtn = document.getElementById('start-race-btn');
  const p1NameInput = document.getElementById('p1-name');
  const p2NameInput = document.getElementById('p2-name');

  const turnBanner = document.getElementById('turn-banner');
  const lane1Label = document.getElementById('lane1-label');
  const lane2Label = document.getElementById('lane2-label');
  const car1 = document.getElementById('car1');
  const car2 = document.getElementById('car2');

  const questionTag = document.getElementById('question-tag');
  const questionText = document.getElementById('question-text');
  const answersEl = document.getElementById('answers');
  const answerButtons = Array.from(answersEl.querySelectorAll('.answer-btn'));
  const feedbackEl = document.getElementById('feedback');

  const winnerOverlay = document.getElementById('winner-overlay');
  const winnerTitle = document.getElementById('winner-title');
  const winnerText = document.getElementById('winner-text');
  const playAgainBtn = document.getElementById('play-again-btn');

  const WIN_CORRECT_ANSWERS = 8; // correct answers needed to cross the finish line

  // Question bank mixes thinking-trap ID content with coping-skill content,
  // written with teen-facing scenarios (school, friends, texting, social media).
  const QUESTIONS = [
    {
      tag: 'Thinking Trap',
      text: 'Jamie bombs one quiz and thinks, "I\'m going to fail this whole class."',
      options: ['Mind Reading', 'Catastrophizing', 'Personalization', 'Labeling'],
      correct: 1,
    },
    {
      tag: 'Thinking Trap',
      text: 'A friend doesn\'t text back for an hour and you think, "They\'re mad at me."',
      options: ['All-or-Nothing Thinking', 'Should Statements', 'Mind Reading', 'Blowing Things Up'],
      correct: 2,
    },
    {
      tag: 'Thinking Trap',
      text: 'The group project got a low grade, and you think, "That\'s all my fault."',
      options: ['Blame Me! (Personalization)', 'Negative Glasses', 'Fortune Telling', 'Labeling'],
      correct: 0,
    },
    {
      tag: 'Thinking Trap',
      text: '"I should always be the top student, no matter what." This is an example of...',
      options: ['Mind Reading', 'Should/Must Statements', 'Catastrophizing', 'All-or-Nothing Thinking'],
      correct: 1,
    },
    {
      tag: 'Thinking Trap',
      text: 'You got one comment wrong out of ten on a presentation, and think, "I did terribly."',
      options: ['All-or-Nothing Thinking', 'Personalization', 'Fortune Telling', 'Should Statements'],
      correct: 0,
    },
    {
      tag: 'Thinking Trap',
      text: 'You only remember the one bad grade this term and forget the good ones.',
      options: ['Fortune Telling', 'Negative Glasses (Mental Filter)', 'Blame Me!', 'Labeling'],
      correct: 1,
    },
    {
      tag: 'Thinking Trap',
      text: '"This party is going to be awkward and terrible, I just know it."',
      options: ['Fortune Telling', 'Personalization', 'Should Statements', 'All-or-Nothing Thinking'],
      correct: 0,
    },
    {
      tag: 'Thinking Trap',
      text: 'Missing one practice and thinking, "The coach will never trust me again."',
      options: ['Mind Reading', 'Blowing Things Up (Catastrophizing)', 'Negative Glasses', 'Labeling'],
      correct: 1,
    },
    {
      tag: 'Coping Skill',
      text: 'Which skill helps calm your body first, before you try to think things through?',
      options: ['Belly / Breathing Triangle', 'Staying up scrolling', 'Ignoring it completely', 'Venting to everyone at once'],
      correct: 0,
    },
    {
      tag: 'Coping Skill',
      text: 'Weighing the evidence for and against a worry, like a judge, is called...',
      options: ['Worry Court', 'Coping Cards', 'Self-Talk', 'Grounding'],
      correct: 0,
    },
    {
      tag: 'Coping Skill',
      text: 'Replacing "I can\'t do this" with "I can try, one step at a time" is an example of...',
      options: ['Worry Court', 'Positive Self-Talk', 'Catastrophizing', 'Avoidance'],
      correct: 1,
    },
    {
      tag: 'Coping Skill',
      text: 'Keeping a small written reminder of a helpful coping phrase for tough moments is called a...',
      options: ['Thinking Trap', 'Coping Card', 'Worry Court', 'Mind Reading'],
      correct: 1,
    },
    {
      tag: 'Coping Skill',
      text: 'Naming 5 things you can see, 4 you can hear, and 3 you can touch is a...',
      options: ['Grounding technique', 'Catastrophizing habit', 'Should Statement', 'Fortune Telling exercise'],
      correct: 0,
    },
    {
      tag: 'Coping Skill',
      text: 'Which is a healthy way to handle test anxiety the night before?',
      options: ['Cram until 3am', 'A short walk and steady sleep', 'Skip studying completely', 'Avoid thinking about it at all'],
      correct: 1,
    },
    {
      tag: 'Thinking Trap',
      text: 'Calling yourself "a total failure" after one bad game is an example of...',
      options: ['Labeling', 'Worry Court', 'Grounding', 'Self-Talk'],
      correct: 0,
    },
    {
      tag: 'Coping Skill',
      text: 'Breathing in for 4, holding for 4, and out for 4 is known as...',
      options: ['Box / Breathing Triangle', 'Fortune Telling', 'Mental Filter', 'Coping Card'],
      correct: 0,
    },
  ];

  let shuffledQuestions = [];
  let questionPointer = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function nextQuestion() {
    if (questionPointer >= shuffledQuestions.length) {
      shuffledQuestions = shuffle(QUESTIONS);
      questionPointer = 0;
    }
    return shuffledQuestions[questionPointer++];
  }

  const players = [
    { name: 'Player 1', correct: 0, carEl: car1, laneLabelEl: lane1Label },
    { name: 'Player 2', correct: 0, carEl: car2, laneLabelEl: lane2Label },
  ];

  let currentPlayerIndex = 0;
  let currentQuestion = null;
  let answering = false;

  function setCarPosition(player) {
    const pct = Math.min(100, (player.correct / WIN_CORRECT_ANSWERS) * 100);
    // Leave room so the car glyph doesn't overshoot the lane on the right
    const clamped = Math.min(pct, 92);
    player.carEl.style.left = clamped + '%';
  }

  function renderQuestion() {
    const player = players[currentPlayerIndex];
    turnBanner.textContent = `${player.name}'s turn`;

    currentQuestion = nextQuestion();
    questionTag.textContent = currentQuestion.tag;
    questionText.textContent = currentQuestion.text;
    feedbackEl.textContent = '';

    answerButtons.forEach((btn, idx) => {
      btn.textContent = currentQuestion.options[idx];
      btn.className = 'answer-btn';
      btn.disabled = false;
    });

    answering = true;
  }

  function handleAnswer(idx) {
    if (!answering) return;
    answering = false;

    const player = players[currentPlayerIndex];
    const isCorrect = idx === currentQuestion.correct;

    answerButtons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === currentQuestion.correct) {
        btn.classList.add('is-correct');
      } else if (i === idx && !isCorrect) {
        btn.classList.add('is-wrong');
      }
    });

    if (isCorrect) {
      player.correct++;
      setCarPosition(player);
      feedbackEl.textContent = 'Correct! Engine repaired, car moves forward.';
    } else {
      feedbackEl.textContent = 'Not quite — no movement this turn.';
    }

    if (player.correct >= WIN_CORRECT_ANSWERS) {
      setTimeout(() => showWinner(player), 900);
      return;
    }

    setTimeout(() => {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      renderQuestion();
    }, 1400);
  }

  function showWinner(player) {
    winnerTitle.textContent = `${player.name} wins the race!`;
    winnerText.textContent = `${player.name} repaired their engine fastest and crossed the finish line first. Great work reading those thinking traps and coping skills!`;
    winnerOverlay.classList.add('is-visible');
  }

  function resetGame() {
    players[0].correct = 0;
    players[1].correct = 0;
    setCarPosition(players[0]);
    setCarPosition(players[1]);
    currentPlayerIndex = 0;
    shuffledQuestions = shuffle(QUESTIONS);
    questionPointer = 0;
    winnerOverlay.classList.remove('is-visible');
  }

  answerButtons.forEach((btn) => {
    btn.addEventListener('click', () => handleAnswer(Number(btn.dataset.idx)));
  });

  startBtn.addEventListener('click', () => {
    const name1 = p1NameInput.value.trim();
    const name2 = p2NameInput.value.trim();

    players[0].name = name1 || 'Player 1';
    players[1].name = name2 || 'Player 2';

    lane1Label.textContent = players[0].name;
    lane2Label.textContent = players[1].name;

    setupCard.classList.add('is-hidden');
    raceWrap.classList.remove('is-hidden');

    resetGame();
    renderQuestion();
  });

  playAgainBtn.addEventListener('click', () => {
    resetGame();
    setupCard.classList.remove('is-hidden');
    raceWrap.classList.add('is-hidden');
  });

})();
