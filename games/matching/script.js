(function () {
  const GEAR_ICON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" stroke="#a8461f" stroke-width="1.6"/>
    <path d="M12 2.5v2.3M12 19.2v2.3M21.5 12h-2.3M4.8 12H2.5M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6M18.5 18.5l-1.6-1.6M7.1 7.1 5.5 5.5" stroke="#a8461f" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;

  const WRENCH_ICON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.7 3.3a4.5 4.5 0 0 0-5.9 5.4L4 16.5a2 2 0 0 0 2.8 2.8L14.6 11a4.5 4.5 0 0 0 5.4-5.9l-2.6 2.6-2-2 2.6-2.6Z" stroke="#3e5c76" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`;

  // Content adapted from thinking-trap concepts (Fortune-Telling, Over-Generalizing,
  // Overestimating Danger, Negative Brain Filter, Catastrophizing, Should Statements,
  // Mind-Reading, Emotional Reasoning, Black & White Thinking)
const ALL_PAIRS = [
  {
    id: "fortune1",
    thought: "Believing you can predict the future and assuming it’s going to be negative.",
    tool: "Fortune-Telling",
    toolText: "Correct!",
    fixNote: "Matched: Fortune-Telling"
  },
  {
    id: "fortune2",
    thought: "Thinking you know something bad will happen before it actually happens.",
    tool: "Fortune-Telling",
    toolText: "Correct!",
    fixNote: "Matched: Fortune-Telling"
  },

  {
    id: "danger1",
    thought: "Believing something is about to happen even though it is very unlikely.",
    tool: "Over-Estimating Danger",
    toolText: "Correct!",
    fixNote: "Matched: Over-Estimating Danger"
  },
  {
    id: "danger2",
    thought: "Confusing something that could happen with something that will happen.",
    tool: "Over-Estimating Danger",
    toolText: "Correct!",
    fixNote: "Matched: Over-Estimating Danger"
  },

  {
    id: "catastrophe1",
    thought: "Imagining the worst possible thing will happen and you won't be able to cope.",
    tool: "Catastrophizing",
    toolText: "Correct!",
    fixNote: "Matched: Catastrophizing"
  },
  {
    id: "catastrophe2",
    thought: "Turning a problem into a disaster in your mind.",
    tool: "Catastrophizing",
    toolText: "Correct!",
    fixNote: "Matched: Catastrophizing"
  },

  {
    id: "mindread1",
    thought: "Believing you know exactly what others are thinking and assuming it is negative.",
    tool: "Mind-Reading",
    toolText: "Correct!",
    fixNote: "Matched: Mind-Reading"
  },
  {
    id: "mindread2",
    thought: "Assuming someone dislikes you without knowing what they think.",
    tool: "Mind-Reading",
    toolText: "Correct!",
    fixNote: "Matched: Mind-Reading"
  },

  {
    id: "blackwhite1",
    thought: "Thinking situations are either completely good or completely bad.",
    tool: "Black and White Thinking",
    toolText: "Correct!",
    fixNote: "Matched: Black and White Thinking"
  },
  {
    id: "blackwhite2",
    thought: "Believing you either succeed perfectly or fail completely.",
    tool: "Black and White Thinking",
    toolText: "Correct!",
    fixNote: "Matched: Black and White Thinking"
  },

  {
    id: "overgeneral1",
    thought: "Making judgments based on one or two experiences using words like always or never.",
    tool: "Over-Generalizing",
    toolText: "Correct!",
    fixNote: "Matched: Over-Generalizing"
  },

  {
    id: "filter1",
    thought: "Only noticing bad things and ignoring positive things.",
    tool: "Negative Brain Filter",
    toolText: "Correct!",
    fixNote: "Matched: Negative Brain Filter"
  },

  {
    id: "should1",
    thought: "Telling yourself how you should feel or behave.",
    tool: "Should Statements",
    toolText: "Correct!",
    fixNote: "Matched: Should Statements"
  },

  {
    id: "emotion1",
    thought: "Believing something is true because you feel it.",
    tool: "Emotional Reasoning",
    toolText: "Correct!",
    fixNote: "Matched: Emotional Reasoning"
  }
];

let PAIRS = [];

  const trapsList = document.getElementById("trapsList");
  const toolsList = document.getElementById("toolsList");
  const fixedCountEl = document.getElementById("fixedCount");
  const totalCountEl = document.getElementById("totalCount");
  const gaugeFill = document.getElementById("gaugeFill");
  const gaugeNeedle = document.getElementById("gaugeNeedle");
  const statusChip = document.getElementById("statusChip");
  const toast = document.getElementById("toast");
  const completeOverlay = document.getElementById("completeOverlay");
  const restartBtn = document.getElementById("restartBtn");

  const GAUGE_DASH = 282.6;
  let fixedCount = 0;
  let selectedTool = null; // for tap-to-select fallback

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 1600);
  }

  function setStatus(text, kind) {
    statusChip.textContent = text;
    statusChip.classList.remove("good", "bad");
    if (kind) statusChip.classList.add(kind);
  }

  function updateGauge() {
    totalCountEl.textContent = PAIRS.length;
    fixedCountEl.textContent = fixedCount;
    const ratio = fixedCount / PAIRS.length;
    gaugeFill.style.strokeDashoffset = String(GAUGE_DASH * (1 - ratio));
    gaugeNeedle.style.transform = `rotate(${-90 + ratio * 180}deg)`;
  }

  function buildBoard() {
    PAIRS = shuffle(ALL_PAIRS).slice(0, 9);
    trapsList.innerHTML = "";
    toolsList.innerHTML = "";
    fixedCount = 0;
    selectedTool = null;
    updateGauge();
    setStatus("Pick up a wrench to begin, match each term with its definition!");
    completeOverlay.classList.remove("is-visible");

    PAIRS.forEach((pair) => {
      const card = document.createElement("div");
      card.className = "trap-card";
      card.dataset.id = pair.id;
      card.innerHTML = `
        <div class="trap-icon">${GEAR_ICON}</div>
        <div class="trap-body">
          <p class="trap-name">${pair.thought}</p>
          <p class="trap-fix-note">${pair.fixNote}</p>
        </div>`;
      card.addEventListener("click", () => tryMatchByTap(pair.id, card));
      trapsList.appendChild(card);
    });

    shuffle(PAIRS).forEach((pair) => {
      const card = document.createElement("div");
      card.className = "tool-card";
      card.dataset.id = pair.id;
      card.tabIndex = 0;
      card.innerHTML = `<div class="tool-icon">${WRENCH_ICON}</div><span>${pair.tool}</span>`;
      attachDrag(card, pair);
      card.addEventListener("click", () => selectTool(card, pair));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectTool(card, pair);
        }
      });
      toolsList.appendChild(card);
    });
  }

  function selectTool(card, pair) {
    if (card.classList.contains("used")) return;
    if (selectedTool && selectedTool.card === card) {
      card.classList.remove("selected");
      selectedTool = null;
      setStatus("Pick up a wrench to begin");
      return;
    }
    if (selectedTool) selectedTool.card.classList.remove("selected");
    selectedTool = { card, pair };
    card.classList.add("selected");
    setStatus(`Holding "${pair.tool}", tap the matching term.`);
  }

  function tryMatchByTap(trapId, trapCard) {
    if (!selectedTool) {
      setStatus("Grab a wrench from the toolbox first", "bad");
      return;
    }
    resolveMatch(selectedTool.pair, trapId, trapCard, selectedTool.card);
    selectedTool.card.classList.remove("selected");
    selectedTool = null;
  }

  function attachDrag(card, pair) {
    let dragEl = null;
    let startX = 0, startY = 0, offsetX = 0, offsetY = 0;

    card.addEventListener("pointerdown", (e) => {
      if (card.classList.contains("used")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;
      const rect = card.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      dragEl = card.cloneNode(true);
      dragEl.classList.add("dragging");
      dragEl.style.width = rect.width + "px";
      dragEl.style.left = rect.left + "px";
      dragEl.style.top = rect.top + "px";
      document.body.appendChild(dragEl);
      card.style.opacity = "0.3";

      const onMove = (ev) => {
        dragEl.style.left = ev.clientX - offsetX + "px";
        dragEl.style.top = ev.clientY - offsetY + "px";
        document.querySelectorAll(".trap-card").forEach((t) => t.classList.remove("dragover"));
        dragEl.style.pointerEvents = "none";
        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const trapCard = target && target.closest(".trap-card");
        if (trapCard) trapCard.classList.add("dragover");
      };

      const onUp = (ev) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        card.style.opacity = "";
        dragEl.remove();
        document.querySelectorAll(".trap-card").forEach((t) => t.classList.remove("dragover"));

        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const trapCard = target && target.closest(".trap-card");
        if (trapCard) {
          resolveMatch(pair, trapCard.dataset.id, trapCard, card);
        }
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    });
  }

  function resolveMatch(pair, trapId, trapCard, toolCard) {
    if (trapCard.classList.contains("fixed")) {
      showToast("That one's already fixed!");
      return;
    }
    if (pair.id === trapId) {
      trapCard.classList.add("fixed");
      toolCard.classList.add("used");
      fixedCount++;
      updateGauge();
      setStatus("Nice fix! Keep going", "good");
      showToast(`\u2713 ${pair.toolText}`);
      if (fixedCount === PAIRS.length) {
      setTimeout(() => { 
          completeOverlay.classList.add("is-visible"); 
      }, 500);
    }
    } else {
      trapCard.classList.add("shake");
      setTimeout(() => trapCard.classList.remove("shake"), 400);
      setStatus("Not quite the right tool for that one", "bad");
      showToast("Hmm, try a different wrench for that thought.");
    }
  }

  restartBtn.addEventListener("click", buildBoard);

  buildBoard();
})();