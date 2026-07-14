(() => {
  const stage = document.getElementById('game-stage');
  const toolboxEl = document.getElementById('toolbox');
  const partsCountEl = document.getElementById('parts-count');
  const sparkleCountEl = document.getElementById('sparkle-count');

  const relaxOverlay = document.getElementById('relax-overlay');
  const relaxTitleEl = document.getElementById('relax-title');
  const relaxTextEl = document.getElementById('relax-text');
  const relaxDoneBtn = document.getElementById('relax-done-btn');

  const TOOLBOX_WIDTH = 90;
  const ITEM_WIDTH = 50;
  const SPAWN_INTERVAL_MS = 1100;
  const SPARKLE_CHANCE = 0.25;

  const PART_TYPES = ['gear', 'steering-wheel', 'wheel'];

  const playBtn = document.getElementById('play-btn');
  const startOverlay = document.getElementById('start-overlay');


  const RELAX_EXERCISES = [
    {
      title: 'Belly Breathing',
      text: "Let's take a breather. Breathe in slowly through your nose for 4 counts... hold it gently for 4... and breathe out through your mouth for 4. Do that two or three more times.",
    },
    {
      title: 'Tuning Up Your Mind',
      text: "Imagine your mind is like a car in the workshop. Take a slow breath in as you recharge your engine, hold for a moment, and breathe out as you release stress.",
    },
    {
      title: 'Reset Your Engine',
      text: "Your body works hard every day, just like a car. Take a moment to slow down, breathe, and give yourself a little tune-up.",
    },
    {
      title: 'A Quiet Workshop',
      text: "Imagine yourself in a peaceful workshop. Notice the tools around you, the gentle sounds, and the calm feeling as everything gets repaired and refreshed.",
    },
    {
      title: 'Growing Calm',
      text: "Just like a car needs maintenance, your mind needs moments to rest. Relax your shoulders, breathe slowly, and let your body recharge.",
    },
  ];


  let gameStarted = false;

  let toolboxX = 0;

  let partsCount = 0;
  let sparkleCount = 0;
  let isPaused = false;
  let spawnTimer = null;

  let fallingItems = []; // { el, x, y, speed, type }


  function setToolboxX(x) {
    const stageWidth = stage.clientWidth;

    toolboxX = Math.max(
      0,
      Math.min(x, stageWidth - TOOLBOX_WIDTH)
    );

    toolboxEl.style.left = toolboxX + 'px';
  }


  function initToolbox() {
    setToolboxX(stage.clientWidth / 2 - TOOLBOX_WIDTH / 2);
  }


  function handlePointerMove(clientX) {
    const rect = stage.getBoundingClientRect();

    setToolboxX(
      clientX - rect.left - TOOLBOX_WIDTH / 2
    );
  }


  stage.addEventListener('mousemove', (e) => {
    if (!isPaused && gameStarted) {
      handlePointerMove(e.clientX);
    }
  });


  stage.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      handlePointerMove(e.touches[0].clientX);
    }

    e.preventDefault();

  }, { passive: false });



  function spawnItem() {

    if (isPaused) return;

    const stageWidth = stage.clientWidth;

    const isSparkle = Math.random() < SPARKLE_CHANCE;

    const type = isSparkle
      ? 'sparkle'
      : PART_TYPES[Math.floor(Math.random() * PART_TYPES.length)];


    const el = document.createElement('div');

    el.className = 'falling-item falling-item--' + type;


    const img = document.createElement('img');

    img.src = 'images/' + type + '.png';

    img.alt = type;

    el.appendChild(img);


    const x = Math.random() * Math.max(0, stageWidth - ITEM_WIDTH);

    el.style.left = x + 'px';

    el.style.top = '-60px';

    stage.appendChild(el);


    fallingItems.push({
      el,
      x,
      y: -60,
      speed: 2.2 + Math.random() * 1.3,
      type,
    });
  }



  function startSpawning() {

    if (spawnTimer) {
      clearInterval(spawnTimer);
    }

    spawnTimer = setInterval(spawnItem, SPAWN_INTERVAL_MS);

  }



  function stopSpawning() {

    clearInterval(spawnTimer);

    spawnTimer = null;

  }



  function clearFallingItems() {

    fallingItems.forEach((item) => item.el.remove());

    fallingItems = [];

  }



  function triggerRelaxation() {

    isPaused = true;

    stopSpawning();

    clearFallingItems();


    const exercise =
      RELAX_EXERCISES[
        Math.floor(Math.random() * RELAX_EXERCISES.length)
      ];


    relaxTitleEl.textContent = exercise.title;

    relaxTextEl.textContent = exercise.text;


    relaxDoneBtn.hidden = true;

    relaxOverlay.hidden = false;


    setTimeout(() => {

      relaxDoneBtn.hidden = false;

    }, 7500);

  }



  relaxDoneBtn.addEventListener('click', () => {

    relaxOverlay.hidden = true;

    isPaused = false;

    startSpawning();

  });



  function gameLoop() {

    if (!isPaused) {

      const stageHeight = stage.clientHeight;


      const toolboxRect = {

        left: toolboxX,

        right: toolboxX + TOOLBOX_WIDTH,

        top: stageHeight - 65,

      };



      for (let i = fallingItems.length - 1; i >= 0; i--) {

        const item = fallingItems[i];


        item.y += item.speed;

        item.el.style.top = item.y + 'px';



        const itemRect = {

          left: item.x,

          right: item.x + ITEM_WIDTH,

          bottom: item.y + ITEM_WIDTH,

        };



        const overlapsX =
          itemRect.right > toolboxRect.left &&
          itemRect.left < toolboxRect.right;


        const reachedToolbox =
          itemRect.bottom > toolboxRect.top;



        if (
          overlapsX &&
          reachedToolbox &&
          item.y < stageHeight
        ) {

          item.el.remove();

          fallingItems.splice(i, 1);



          if (item.type === 'sparkle') {

            sparkleCount++;

            sparkleCountEl.textContent = sparkleCount;

            triggerRelaxation();


          } else {

            partsCount++;

            partsCountEl.textContent = partsCount;

          }


          continue;

        }



        if (item.y > stageHeight) {

          item.el.remove();

          fallingItems.splice(i, 1);

        }

      }

    }


    requestAnimationFrame(gameLoop);

  }



  window.addEventListener('load', () => {

    initToolbox();

    requestAnimationFrame(gameLoop);

  });



  playBtn.addEventListener('click', () => {

    gameStarted = true;

    startOverlay.style.display = 'none';

    startSpawning();

  });



  window.addEventListener('resize', () => {

    setToolboxX(toolboxX);

  });


})();