(() => {

  // ===== Setup screen elements =====
  const setupCard = document.getElementById('setup-card');
  const teamCountSelect = document.getElementById('team-count');
  const team3Field = document.getElementById('team3-field');
  const team4Field = document.getElementById('team4-field');
  const startBtn = document.getElementById('start-board-btn');

  // ===== Board screen elements =====
  const boardWrap = document.getElementById('board-wrap');
  const scoreboardEl = document.getElementById('scoreboard');
  const boardEl = document.getElementById('board');

  // ===== Start / fullscreen overlay elements =====
  const playBtn = document.getElementById('play-btn');
  const startOverlay = document.getElementById('start-overlay');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const boardStage = document.getElementById('board-stage');

  // ===== Question overlay elements =====
  const questionOverlay = document.getElementById('question-overlay');
  const modalCategory = document.getElementById('modal-category');
  const modalQuestion = document.getElementById('modal-question');
  const modalAnswer = document.getElementById('modal-answer');
  const revealBtn = document.getElementById('reveal-answer-btn');
  const awardRow = document.getElementById('award-row');
  const awardButtons = document.getElementById('award-buttons');
  const skipBtn = document.getElementById('skip-btn');

  // ===== Winner overlay elements =====
  const winnerOverlay = document.getElementById('winner-overlay');
  const winnerTitle = document.getElementById('winner-title');
  const winnerText = document.getElementById('winner-text');
  const playAgainBtn = document.getElementById('play-again-btn');

  // Original parents of the overlays, so they can be moved back when exiting fullscreen
  const questionOverlayHome = questionOverlay.parentElement;
  const winnerOverlayHome = winnerOverlay.parentElement;

  const VALUES = [100, 200, 300, 400];

  // ===== Trivia content =====
  const BOARD = {
    'Thinking Traps': [
      { value: 100, q: 'Believing you can predict the future and assuming it\'s going to be negative.', a: 'Fortune-Telling' },
      { value: 200, q: 'Making sweeping judgments based on one or two experiences, using words like "always" or "never."', a: 'Over-Generalizing' },
      { value: 300, q: 'Believing something is about to occur that is actually very unlikely.', a: 'Over-Estimating Danger' },
      { value: 400, q: 'Only paying attention to the bad things that happen and ignoring all the good things.', a: 'Negative Brain Filter' },
    ],
    'Coping Skills': [
      { value: 100, q: 'Breathing in for 4, holding for 4, out for 4 — what\'s this technique called?', a: 'Box / Breathing Triangle' },
      { value: 200, q: 'Weighing the evidence for and against a worry, like a judge, is called...', a: 'Worry Court' },
      { value: 300, q: 'Keeping a written reminder of a helpful phrase for tough moments is a...', a: 'Coping Card' },
      { value: 400, q: 'Naming things you can see, hear, and touch to calm down is called...', a: 'Grounding' },
    ],
    'Feelings & Body': [
      { value: 100, q: 'A racing heart and sweaty palms before a test are physical signs of...', a: 'Anxiety / Nervousness' },
      { value: 200, q: 'Clenched fists and a hot face are often physical signs of this emotion.', a: 'Anger' },
      { value: 300, q: 'Slumped shoulders and low energy can be physical signs of...', a: 'Sadness' },
      { value: 400, q: 'Noticing tension building in your body before you snap at someone is called...', a: 'Recognizing early warning signs' },
    ],
    'Mixed Bag': [
      { value: 100, q: 'Imagining the worst possible thing will happen and that we won\'t be able to cope.', a: 'Catastrophizing' },
      { value: 200, q: 'Believing you know exactly what others are thinking, and assuming it\'s negative.', a: 'Mind-Reading' },
      { value: 300, q: 'Believing something is true based on feelings rather than facts.', a: 'Emotional Reasoning' },
      { value: 400, q: 'Thinking of situations in extremes — either really good or really bad.', a: 'Black and White Thinking' },
    ],
  };

  const CATEGORIES = Object.keys(BOARD);

  // ===== Game state =====
  let teams = [];
  let currentTile = null;
  let tilesRemaining = 0;

  // ----- Start overlay -----
  playBtn.addEventListener('click', () => {
    startOverlay.style.display = 'none';
  });

  // ----- Fullscreen toggle -----
  // Moves the question/winner overlays into the fullscreen element so they
  // still render on top while the board is in fullscreen mode.
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      boardStage.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = !!document.fullscreenElement;

    fullscreenBtn.textContent = isFullscreen ? '⤢' : '⛶';
    fullscreenBtn.setAttribute(
      'aria-label',
      isFullscreen ? 'Exit fullscreen' : 'Toggle fullscreen'
    );

    if (isFullscreen) {
      boardStage.appendChild(questionOverlay);
      boardStage.appendChild(winnerOverlay);
    } else {
      questionOverlayHome.appendChild(questionOverlay);
      winnerOverlayHome.appendChild(winnerOverlay);
    }
  });

  // ----- Team setup -----
  function updateTeamFieldVisibility() {
    const count = Number(teamCountSelect.value);
    team3Field.classList.toggle('is-hidden', count < 3);
    team4Field.classList.toggle('is-hidden', count < 4);
  }

  teamCountSelect.addEventListener('change', updateTeamFieldVisibility);
  updateTeamFieldVisibility();

  // ----- Rendering -----
  function renderScoreboard() {
    scoreboardEl.innerHTML = '';
    teams.forEach((team) => {
      const pill = document.createElement('div');
      pill.className = 'team-pill';

      const nameEl = document.createElement('span');
      nameEl.className = 'team-pill-name';
      nameEl.textContent = team.name;

      const scoreEl = document.createElement('span');
      scoreEl.className = 'team-pill-score';
      scoreEl.textContent = team.score;
      scoreEl.id = `score-${team.id}`;

      pill.appendChild(nameEl);
      pill.appendChild(scoreEl);
      scoreboardEl.appendChild(pill);
    });
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${CATEGORIES.length}, 1fr)`;

    // Category headers
    CATEGORIES.forEach((category) => {
      const header = document.createElement('div');
      header.className = 'board-header';
      header.textContent = category;
      boardEl.appendChild(header);
    });

    // Point-value tiles, row by row
    VALUES.forEach((value, rowIndex) => {
      CATEGORIES.forEach((category) => {
        const item = BOARD[category][rowIndex];
        const tileBtn = document.createElement('button');
        tileBtn.className = 'board-tile';
        tileBtn.textContent = value;
        tileBtn.addEventListener('click', () => openQuestion(category, item, tileBtn));
        boardEl.appendChild(tileBtn);
      });
    });

    tilesRemaining = CATEGORIES.length * VALUES.length;
  }

  // ----- Question flow -----
  function openQuestion(category, item, tileBtn) {
    currentTile = { category, ...item, tileBtn };

    modalCategory.textContent = `${category} · ${item.value}`;
    modalQuestion.textContent = item.q;
    modalAnswer.textContent = item.a;
    modalAnswer.classList.add('is-hidden');
    revealBtn.classList.remove('is-hidden');
    awardRow.classList.add('is-hidden');

    // Build one "award points" button per team
    awardButtons.innerHTML = '';
    teams.forEach((team) => {
      const btn = document.createElement('button');
      btn.className = 'award-btn';
      btn.textContent = team.name;
      btn.addEventListener('click', () => awardPoints(team));
      awardButtons.appendChild(btn);
    });

    questionOverlay.classList.add('is-visible');
  }

  revealBtn.addEventListener('click', () => {
    modalAnswer.classList.remove('is-hidden');
    revealBtn.classList.add('is-hidden');
    awardRow.classList.remove('is-hidden');
  });

  function closeTile() {
    if (currentTile) {
      currentTile.tileBtn.disabled = true;
      currentTile.tileBtn.textContent = '✓';
    }
    questionOverlay.classList.remove('is-visible');
    tilesRemaining--;
    currentTile = null;

    if (tilesRemaining <= 0) {
      setTimeout(showWinner, 500);
    }
  }

  function awardPoints(team) {
    team.score += currentTile.value;
    const scoreEl = document.getElementById(`score-${team.id}`);
    if (scoreEl) scoreEl.textContent = team.score;
    closeTile();
  }

  skipBtn.addEventListener('click', closeTile);

  // ----- Winner screen -----
  function showWinner() {
    const sorted = [...teams].sort((a, b) => b.score - a.score);
    const topScore = sorted[0].score;
    const winners = sorted.filter((team) => team.score === topScore);
    const isTie = winners.length > 1;

    if (isTie) {
      winnerTitle.textContent = "It's a tie!";
      winnerText.textContent = `${winners.map((team) => team.name).join(' & ')} tied with ${topScore} points. Great teamwork all around!`;
    } else {
      winnerTitle.textContent = `${winners[0].name} wins the board!`;
      winnerText.textContent = `${winners[0].name} finished with ${topScore} points. Nice work spotting those thinking traps and coping skills!`;
    }

    winnerOverlay.classList.add('is-visible');
  }

  // ----- Board start / restart -----
  startBtn.addEventListener('click', () => {
    const count = Number(teamCountSelect.value);
    const nameInputs = [
      document.getElementById('team1-name'),
      document.getElementById('team2-name'),
      document.getElementById('team3-name'),
      document.getElementById('team4-name'),
    ];

    teams = [];
    for (let i = 0; i < count; i++) {
      const name = nameInputs[i].value.trim();
      teams.push({ id: i, name: name || `Team ${i + 1}`, score: 0 });
    }

    setupCard.classList.add('is-hidden');
    boardWrap.classList.remove('is-hidden');

    renderScoreboard();
    renderBoard();
  });

  playAgainBtn.addEventListener('click', () => {
    winnerOverlay.classList.remove('is-visible');
    boardWrap.classList.add('is-hidden');
    setupCard.classList.remove('is-hidden');
  });

})();