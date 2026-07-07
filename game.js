/* =====================================================
   TRAILHEAD — game engine
   Scaffolding, productive struggle, and equity.
   Framework: Miner, pedagogical friction (desirable difficulties,
   productive struggle vs. exclusionary barriers, system policy).
   ===================================================== */
"use strict";

/* ---------- shared framework constants ---------- */
const PRODUCTIVE_CHALLENGE = [55, 80];   // % band: below = bypass, above = overload
const BARRIER_ACCESSIBLE_MAX = 20;       // % above this = exclusionary

/* ---------- segment definition data ---------- */
const SEGMENTS = [
  { id: 0, name: "Source Scramble", type: "text", desc: "Sourcing primary letters about Fort Sumter.", baseChallenge: 85 },
  { id: 1, name: "Corroboration River", type: "text", desc: "Comparing Northern and Southern newspaper claims.", baseChallenge: 85 },
  { id: 2, name: "Context Ridge", type: "analysis", desc: "Analyzing 1860 presidential election census maps.", baseChallenge: 70 },
  { id: 3, name: "Counterargument Ledge", type: "writing", desc: "Refuting claims of state-sovereignty legalities.", baseChallenge: 90 },
  { id: 4, name: "Evidence Switchback", type: "writing", desc: "Structuring text citations to back claims.", baseChallenge: 90 },
  { id: 5, name: "Thesis Chimney", type: "writing", desc: "Synthesizing arguments into a unified claim.", baseChallenge: 90 },
  { id: 6, name: "Revision Traverse", type: "writing", desc: "Rewriting sections to match feedback.", baseChallenge: 90 },
  { id: 7, name: "Summit Defense", type: "oral", desc: "Orally defending key reasoning to peers.", baseChallenge: 95 }
];

/* ---------- support cards properties ---------- */
const SUPPORTS = {
  none: { name: "No Scaffolding", cost: 0, isDigital: false },
  glossary: { name: "Waymarks (Glossary)", cost: 1, isDigital: true },
  bridge: { name: "STT Bridge (Dictation)", cost: 1, isDigital: true },
  belay: { name: "Belay Partner (Peer Talk)", cost: 1, isDigital: false },
  frames: { name: "Rope Rail (Frames)", cost: 1, isDigital: false },
  checkpoint: { name: "Route Checkpoint", cost: 1, isDigital: false }
};

/* ---------- coordinate mapping for mountain SVG ---------- */
const NODES_COORDS = [
  { x: 130, y: 350 }, // Seg 0
  { x: 210, y: 320 }, // Seg 1
  { x: 290, y: 270 }, // Seg 2
  { x: 370, y: 240 }, // Seg 3
  { x: 450, y: 190 }, // Seg 4
  { x: 520, y: 150 }, // Seg 5
  { x: 590, y: 110 }, // Seg 6
  { x: 660, y: 60 }   // Seg 7
];
const START_COORD = { x: 70, y: 390 };

/* ---------- state ---------- */
let S = {
  attempt: 1,
  selectedSegment: 0,
  gondola: false,
  turnstile: false,
  supports: {},        // segId -> support key
  hikerPositions: {},  // hikerId -> current segment index (-1 for trailhead, 8 for summit)
  hikerStates: {},     // hikerId -> "walk" | "struggle" | "halt" | "zip" | "idle"
  hikerPaths: {},      // hikerId -> array of coords visited
  hikerHaltSeg: {},    // hikerId -> segment index where they halted
  hikerSummitFlag: {}, // hikerId -> "color" (walked) | "gray" (gondola) | null
  history: []          // list of past attempt results
};

/* ---------- dom helper ---------- */
const $ = (id) => document.getElementById(id);
const announce = (m) => { $("announcer").textContent = m; };

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  window.scrollTo(0, 0);
}

/* ---------- game initialization ---------- */
function resetGame() {
  S.attempt = 1;
  S.history = [];
  resetAttemptState();
}

function init() {
  resetGame();

  // Event wiring below must run exactly once — re-running init() would stack
  // duplicate listeners (two runAttempt intervals mutating shared hiker state).

  // Title screen button
  $("startBtn").addEventListener("click", () => {
    showScreen("play");
    setupPlayScreen();
  });

  // Global option changes
  $("gondolaToggle").addEventListener("change", (e) => {
    S.gondola = e.target.checked;
    updateGondolaCable();
    updateSummaryStrip();
  });
  $("turnstileToggle").addEventListener("change", (e) => {
    S.turnstile = e.target.checked;
    updateSupportDisabledStates();
    updateSummaryStrip();
  });

  // Segment select dropdown
  $("segmentSelect").addEventListener("change", (e) => {
    S.selectedSegment = parseInt(e.target.value, 10);
    renderSegmentDetails();
    selectSvgNode(S.selectedSegment);
  });

  // Radio button support selection
  document.getElementsByName("supportRadio").forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (e.target.checked) {
        S.supports[S.selectedSegment] = e.target.value;
        updateSummaryStrip();
        renderSvgNodes();
      }
    });
  });

  // Run attempt button
  $("runBtn").addEventListener("click", runAttempt);

  // Continue to debrief button
  $("continueBtn").addEventListener("click", showDebrief);

  // Reflection submission
  $("submitReflectionBtn").addEventListener("click", () => {
    const val = $("reflectionText").value.trim();
    if (val.length < 5) {
      alert("Please type a short reflection before revealing the mapping.");
      return;
    }
    $("reflectionBox").style.display = "none";
    $("frameworkMapping").style.display = "block";
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });

  // Replay buttons
  $("replayBtn").addEventListener("click", () => {
    if (runTimer) { clearInterval(runTimer); runTimer = null; }
    if (S.attempt < 3) {
      S.attempt++;
      resetAttemptState();
      showScreen("play");
      setupPlayScreen();
    } else {
      resetGame(); // state only — never re-run init(), which would duplicate listeners
      showScreen("title");
    }
  });
}

function resetAttemptState() {
  S.selectedSegment = 0;
  S.gondola = false;
  S.turnstile = false;
  S.supports = {};
  SEGMENTS.forEach(seg => {
    S.supports[seg.id] = "none";
  });
  S.hikerPositions = { ell: -1, dys: -1, rly: -1, sam: -1 };
  S.hikerStates = { ell: "idle", dys: "idle", rly: "idle", sam: "idle" };
  S.hikerPaths = { ell: [], dys: [], rly: [], sam: [] };
  S.hikerHaltSeg = { ell: null, dys: null, rly: null, sam: null };
  S.hikerSummitFlag = { ell: null, dys: null, rly: null, sam: null };
}

/* ---------- rendering functions ---------- */

function setupPlayScreen() {
  $("attemptLabel").textContent = "Attempt " + S.attempt + " of 3";
  $("gondolaToggle").checked = S.gondola;
  $("turnstileToggle").checked = S.turnstile;
  $("segmentSelect").value = S.selectedSegment;
  
  updateGondolaCable();
  updateSupportDisabledStates();
  renderSvgNodes();
  selectSvgNode(S.selectedSegment);
  renderSegmentDetails();
  updateSummaryStrip();
}

function updateGondolaCable() {
  const cable = $("gondolaCable");
  if (S.gondola && !S.turnstile) {
    cable.classList.add("active");
  } else {
    cable.classList.remove("active");
  }
}

function updateSupportDisabledStates() {
  // If turnstile is checked, disable glossary and bridge radio options
  const ban = S.turnstile;
  $("opt-glossary").classList.toggle("disabled", ban);
  $("opt-glossary").querySelector("input").disabled = ban;
  $("opt-bridge").classList.toggle("disabled", ban);
  $("opt-bridge").querySelector("input").disabled = ban;

  // If a digital support was selected but is now banned, revert segment choice to "none"
  SEGMENTS.forEach(seg => {
    const supp = S.supports[seg.id];
    if (ban && (supp === "glossary" || supp === "bridge")) {
      S.supports[seg.id] = "none";
    }
  });

  if (S.selectedSegment !== null) {
    renderSegmentDetails();
  }
}

function renderSvgNodes() {
  const container = $("trailNodes");
  container.innerHTML = "";
  
  // Trailhead Start circle
  const st = document.createElementNS("http://www.w3.org/2000/svg", "g");
  st.setAttribute("class", "trail-node");
  st.innerHTML = '<circle cx="' + START_COORD.x + '" cy="' + START_COORD.y + '" r="8" class="trail-node-circle"></circle>' +
                 '<text x="' + (START_COORD.x - 36) + '" y="' + (START_COORD.y + 4) + '" class="node-label">Start</text>';
  container.appendChild(st);

  // 8 Segment nodes
  SEGMENTS.forEach(seg => {
    const coords = NODES_COORDS[seg.id];
    const gp = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gp.setAttribute("class", "trail-node" + (S.selectedSegment === seg.id ? " selected" : ""));
    gp.setAttribute("tabindex", "0");
    gp.setAttribute("aria-label", "Segment " + (seg.id + 1) + ": " + seg.name);
    
    // Support abbreviation
    const supp = S.supports[seg.id];
    let suppLabel = "";
    if (supp === "glossary") suppLabel = "W";
    else if (supp === "bridge") suppLabel = "B";
    else if (supp === "belay") suppLabel = "P";
    else if (supp === "frames") suppLabel = "R";
    else if (supp === "checkpoint") suppLabel = "C";

    gp.innerHTML = '<circle cx="' + coords.x + '" cy="' + coords.y + '" r="10" class="trail-node-circle"></circle>' +
                   (suppLabel ? '<text x="' + coords.x + '" y="' + (coords.y + 3) + '" class="node-support-icon">' + suppLabel + '</text>' : '') +
                   '<text x="' + (coords.x + 12) + '" y="' + (coords.y + 14) + '" class="node-label">' + (seg.id + 1) + '</text>';
    
    gp.addEventListener("click", () => {
      S.selectedSegment = seg.id;
      $("segmentSelect").value = seg.id;
      selectSvgNode(seg.id);
      renderSegmentDetails();
    });

    gp.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        S.selectedSegment = seg.id;
        $("segmentSelect").value = seg.id;
        selectSvgNode(seg.id);
        renderSegmentDetails();
      }
    });

    container.appendChild(gp);
  });
}

function selectSvgNode(segId) {
  const nodes = $("trailNodes").querySelectorAll(".trail-node");
  // The first element is Start, followed by segments 0..7
  nodes.forEach((n, idx) => {
    if (idx === 0) return;
    n.classList.toggle("selected", (idx - 1) === segId);
  });
}

function renderSegmentDetails() {
  const seg = SEGMENTS[S.selectedSegment];
  $("selectHint").innerHTML = 'Scaffold Segment <strong>' + (seg.id + 1) + ' &middot; ' + seg.name + '</strong>: ' + seg.desc;
  
  // Set current checked support
  const currentSupport = S.supports[seg.id];
  document.getElementsByName("supportRadio").forEach(radio => {
    radio.checked = radio.value === currentSupport;
  });
}

function updateSummaryStrip() {
  const strip = $("trailSummaryStrip");
  strip.innerHTML = '<strong style="color:var(--forest);">Active Scaffold map:</strong> ';
  
  SEGMENTS.forEach(seg => {
    const sKey = S.supports[seg.id];
    let icon = "🌲";
    if (sKey === "glossary") icon = "🔑 Waymarks";
    else if (sKey === "bridge") icon = "🌉 Bridge";
    else if (sKey === "belay") icon = "🤝 Partner";
    else if (sKey === "frames") icon = "🪢 Rail";
    else if (sKey === "checkpoint") icon = "🏁 Checkpoint";

    const nd = document.createElement("span");
    nd.className = "strip-node" + (S.selectedSegment === seg.id ? " now" : "");
    nd.innerHTML = (seg.id + 1) + ': ' + icon;
    strip.appendChild(nd);
  });
}

/* ---------- simulation execution engine ---------- */

let runTimer = null;

function runAttempt() {
  // A stale interval from a previous run must never mutate this run's state
  if (runTimer) { clearInterval(runTimer); runTimer = null; }

  showScreen("run");
  $("runStatus").textContent = "Hikers are preparing to climb...";
  // Re-hide the continue button: it stays visible from the previous run otherwise,
  // letting the debrief open mid-simulation and compute metrics from partial state.
  $("continueBtn").style.display = "none";

  // Clone the play mountain SVG into the run view
  const clone = $("mountainSvg").cloneNode(true);
  clone.id = "mountainSvgRun";
  
  const container = $("mountainSvgRun").parentNode;
  container.innerHTML = "";
  container.appendChild(clone);
  
  // Reset runtime parameters
  S.hikerPositions = { ell: -1, dys: -1, rly: -1, sam: -1 };
  S.hikerStates = { ell: "idle", dys: "idle", rly: "idle", sam: "idle" };
  S.hikerHaltSeg = { ell: null, dys: null, rly: null, sam: null };
  S.hikerSummitFlag = { ell: null, dys: null, rly: null, sam: null };
  
  S.hikerPaths = {
    ell: [START_COORD],
    dys: [START_COORD],
    rly: [START_COORD],
    sam: [START_COORD]
  };

  renderHikerDots();
  renderHikerStatuses();

  // Begin simulation clock
  let step = 0;
  
  // Sam rule: Gondola active, no turnstile lockdown, and NO checkpoint anywhere on the trail
  const hasCheckpoint = Object.values(S.supports).includes("checkpoint");
  const samGondola = S.gondola && !S.turnstile && !hasCheckpoint;

  runTimer = setInterval(() => {
    step++;
    let active = false;

    // Evaluate Maya
    if (S.hikerStates.ell !== "halt" && S.hikerPositions.ell < 7) {
      active = true;
      const nextSeg = S.hikerPositions.ell + 1;
      const barrierText = SEGMENTS[nextSeg].type === "text";
      const hasSupport = S.supports[nextSeg] === "glossary" && !S.turnstile;
      
      if (barrierText && !hasSupport) {
        S.hikerStates.ell = "halt";
        S.hikerHaltSeg.ell = nextSeg;
        drawHaltMarker("ell", NODES_COORDS[nextSeg]);
      } else {
        S.hikerPositions.ell = nextSeg;
        const wiggle = SEGMENTS[nextSeg].type === "text" || S.supports[nextSeg] === "none";
        S.hikerStates.ell = wiggle ? "struggle" : "walk";
        const target = NODES_COORDS[nextSeg];
        S.hikerPaths.ell.push(target);
        animateDot("ell", target, wiggle);
      }
    } else if (S.hikerPositions.ell === 7 && S.hikerSummitFlag.ell === null) {
      S.hikerPositions.ell = 8;
      S.hikerStates.ell = "idle";
      S.hikerSummitFlag.ell = "color";
      plantSummitFlag("ell", "color");
    }

    // Evaluate Jordan
    if (S.hikerStates.dys !== "halt" && S.hikerPositions.dys < 7) {
      active = true;
      const nextSeg = S.hikerPositions.dys + 1;
      const barrierWrite = SEGMENTS[nextSeg].type === "writing";
      const hasSupport = S.supports[nextSeg] === "bridge" && !S.turnstile;

      if (barrierWrite && !hasSupport) {
        S.hikerStates.dys = "halt";
        S.hikerHaltSeg.dys = nextSeg;
        drawHaltMarker("dys", NODES_COORDS[nextSeg]);
      } else {
        S.hikerPositions.dys = nextSeg;
        const wiggle = SEGMENTS[nextSeg].type === "writing" || S.supports[nextSeg] === "none";
        S.hikerStates.dys = wiggle ? "struggle" : "walk";
        const target = NODES_COORDS[nextSeg];
        S.hikerPaths.dys.push(target);
        animateDot("dys", target, wiggle);
      }
    } else if (S.hikerPositions.dys === 7 && S.hikerSummitFlag.dys === null) {
      S.hikerPositions.dys = 8;
      S.hikerStates.dys = "idle";
      S.hikerSummitFlag.dys = "color";
      plantSummitFlag("dys", "color");
    }

    // Evaluate Riley
    if (S.hikerStates.rly !== "halt" && S.hikerPositions.rly < 7) {
      active = true;
      const nextSeg = S.hikerPositions.rly + 1;
      const barrierOral = SEGMENTS[nextSeg].type === "oral";
      const hasSupport = S.supports[nextSeg] === "belay";

      if (barrierOral && !hasSupport) {
        S.hikerStates.rly = "halt";
        S.hikerHaltSeg.rly = nextSeg;
        drawHaltMarker("rly", NODES_COORDS[nextSeg]);
      } else {
        S.hikerPositions.rly = nextSeg;
        const wiggle = SEGMENTS[nextSeg].type === "oral" || S.supports[nextSeg] === "none";
        S.hikerStates.rly = wiggle ? "struggle" : "walk";
        const target = NODES_COORDS[nextSeg];
        S.hikerPaths.rly.push(target);
        animateDot("rly", target, wiggle);
      }
    } else if (S.hikerPositions.rly === 7 && S.hikerSummitFlag.rly === null) {
      S.hikerPositions.rly = 8;
      S.hikerStates.rly = "idle";
      S.hikerSummitFlag.rly = "color";
      plantSummitFlag("rly", "color");
    }

    // Evaluate Sam
    if (samGondola) {
      if (S.hikerPositions.sam === -1) {
        active = true;
        S.hikerPositions.sam = 8;
        S.hikerStates.sam = "zip";
        S.hikerSummitFlag.sam = "gray";
        const peak = NODES_COORDS[7];
        S.hikerPaths.sam.push(peak);
        animateDot("sam", peak, false);
        plantSummitFlag("sam", "gray");
      }
    } else {
      if (S.hikerStates.sam !== "halt" && S.hikerPositions.sam < 7) {
        active = true;
        const nextSeg = S.hikerPositions.sam + 1;
        S.hikerPositions.sam = nextSeg;
        const wiggle = S.supports[nextSeg] === "none";
        S.hikerStates.sam = wiggle ? "struggle" : "walk";
        const target = NODES_COORDS[nextSeg];
        S.hikerPaths.sam.push(target);
        animateDot("sam", target, wiggle);
      } else if (S.hikerPositions.sam === 7 && S.hikerSummitFlag.sam === null) {
        S.hikerPositions.sam = 8;
        S.hikerStates.sam = "idle";
        S.hikerSummitFlag.sam = "color";
        plantSummitFlag("sam", "color");
      }
    }

    renderHikerStatuses();
    drawPathsOnSvg("mountainSvgRun");

    if (!active) {
      clearInterval(runTimer);
      runTimer = null;
      $("runStatus").textContent = "Climb completed. Review the results.";
      $("continueBtn").style.display = "inline-flex";
    }
  }, 1000);
}

function renderHikerDots() {
  const g = $("mountainSvgRun").getElementById("hikerDots");
  g.innerHTML = "";

  const hikers = [
    { id: "ell", color: "var(--gold)", label: "M" },
    { id: "dys", color: "var(--slate)", label: "J" },
    { id: "rly", color: "var(--ember)", label: "R" },
    { id: "sam", color: "var(--forest-dim)", label: "S" }
  ];

  hikers.forEach(h => {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "g");
    dot.setAttribute("id", "dot-" + h.id);
    dot.setAttribute("class", "climb-marker");
    dot.setAttribute("transform", "translate(" + START_COORD.x + "," + START_COORD.y + ")");

    dot.innerHTML = '<circle cx="0" cy="0" r="10" fill="' + h.color + '" class="marker-ring"></circle>' +
                    '<text x="0" y="3" font-family="var(--mono)" font-size="9px" font-weight="700" fill="#fff" text-anchor="middle">' + h.label + '</text>';
    g.appendChild(dot);
  });
}

function animateDot(id, target, wiggle) {
  const dot = $("mountainSvgRun").getElementById("dot-" + id);
  if (!dot) return;
  dot.setAttribute("transform", "translate(" + target.x + "," + target.y + ")");
  if (wiggle) {
    dot.classList.add("wiggling");
  } else {
    dot.classList.remove("wiggling");
  }
}

function drawHaltMarker(id, coord) {
  const svg = $("mountainSvgRun");
  const cross = document.createElementNS("http://www.w3.org/2000/svg", "g");
  cross.innerHTML = '<line x1="' + (coord.x - 7) + '" y1="' + (coord.y - 7) + '" x2="' + (coord.x + 7) + '" y2="' + (coord.y + 7) + '" stroke="var(--ember)" stroke-width="3"></line>' +
                    '<line x1="' + (coord.x + 7) + '" y1="' + (coord.y - 7) + '" x2="' + (coord.x - 7) + '" y2="' + (coord.y + 7) + '" stroke="var(--ember)" stroke-width="3"></line>';
  svg.appendChild(cross);
}

function plantSummitFlag(id, flagType) {
  const svg = $("mountainSvgRun");
  const coord = NODES_COORDS[7]; // Peak
  const flagColor = flagType === "gray" ? "var(--dim)" : "var(--ember)";
  const flagLabel = id.toUpperCase().slice(0,1);

  const flag = document.createElementNS("http://www.w3.org/2000/svg", "g");
  flag.innerHTML = '<line x1="' + coord.x + '" y1="' + coord.y + '" x2="' + coord.x + '" y2="' + (coord.y - 20) + '" stroke="' + flagColor + '" stroke-width="2"></line>' +
                   '<polygon points="' + coord.x + ',' + (coord.y - 20) + ' ' + (coord.x + 14) + ',' + (coord.y - 15) + ' ' + coord.x + ',' + (coord.y - 10) + '" fill="' + flagColor + '"></polygon>' +
                   '<text x="' + (coord.x + 4) + '" y="' + (coord.y - 13) + '" font-family="var(--mono)" font-size="6px" fill="#fff" font-weight="700">' + flagLabel + '</text>';
  svg.appendChild(flag);
}

function drawPathsOnSvg(svgId) {
  const svg = $(svgId);
  // Remove any old path traces
  svg.querySelectorAll(".trace-path").forEach(p => p.remove());

  const hikers = ["ell", "dys", "rly", "sam"];
  hikers.forEach(h => {
    const coords = S.hikerPaths[h];
    if (coords.length < 2) return;

    let d = "M " + coords[0].x + "," + coords[0].y;
    for (let k = 1; k < coords.length; k++) {
      d += " L " + coords[k].x + "," + coords[k].y;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "trace-path trace-" + h);
    
    // Insert behind nodes
    const nodesG = svg.getElementById("trailNodes");
    svg.insertBefore(path, nodesG);
  });
}

function renderHikerStatuses() {
  const grid = $("statusGrid");
  grid.innerHTML = "";

  const data = [
    { id: "ell", name: "Maya", class: "active-walk" },
    { id: "dys", name: "Jordan", class: "active-walk" },
    { id: "rly", name: "Riley", class: "active-walk" },
    { id: "sam", name: "Sam", class: "active-walk" }
  ];

  data.forEach(h => {
    const card = document.createElement("div");
    const pos = S.hikerPositions[h.id];
    const state = S.hikerStates[h.id];
    
    let stateClass = "active-walk";
    let actionLabel = "Climbing";
    let segLabel = "Trailhead";

    if (pos >= 0 && pos <= 7) {
      segLabel = "Seg " + (pos + 1) + ": " + SEGMENTS[pos].name;
    } else if (pos === 8) {
      segLabel = "Summit";
    }

    if (state === "idle") {
      actionLabel = pos === 8 ? "Summited" : "Preparing";
    } else if (state === "struggle") {
      stateClass = "active-struggle";
      actionLabel = "Struggling ⚠";
    } else if (state === "halt") {
      stateClass = "active-halt";
      actionLabel = "Gated ✖";
      segLabel = "Blocked on Seg " + (S.hikerHaltSeg[h.id] + 1);
    } else if (state === "zip") {
      stateClass = "active-zip";
      actionLabel = "Bypassing (Gondola)";
    }

    card.className = "status-card " + stateClass;
    card.innerHTML = '<span class="s-head">' + h.name + '</span>' +
                     '<span class="s-seg">' + segLabel + '</span>' +
                     '<span class="s-action">' + actionLabel + '</span>';
    grid.appendChild(card);
  });
}

/* ---------- debriefing page ---------- */

function showDebrief() {
  showScreen("debrief");
  $("debriefHeading").textContent = "Attempt " + S.attempt + " Analysis";
  
  // Clone current SVG state for debrief
  const clone = $("mountainSvgRun").cloneNode(true);
  clone.id = "mountainSvgDebrief";
  const container = $("mountainSvgDebrief").parentNode;
  container.innerHTML = "";
  container.appendChild(clone);

  // Compute metrics
  const walkedSteps = [];
  const hikers = ["ell", "dys", "rly", "sam"];
  let totalSuccessfulSummits = 0;

  hikers.forEach(h => {
    // h is the string id ("ell"|"dys"|"rly"|"sam") — state objects are keyed by it directly
    const pos = S.hikerPositions[h];
    // A gray flag means Sam arrived by gondola: reached the summit, did none of the climb.
    if (pos === 8 && S.hikerSummitFlag[h] !== "gray") totalSuccessfulSummits++;

    // Track challenges along their path
    const limit = S.hikerHaltSeg[h] !== null ? S.hikerHaltSeg[h] : 7;
    for (let i = 0; i <= limit; i++) {
      if (h === "sam" && S.hikerSummitFlag.sam === "gray") {
        // Sam on gondola experienced 0 challenge
        walkedSteps.push(0);
        break;
      }
      
      const seg = SEGMENTS[i];
      const support = S.supports[i];
      let challenge = seg.baseChallenge;

      if (support === "frames") challenge = 65; // sentence frames ease challenge
      else if (support === "glossary" && h === "ell") challenge = 70; // glossary eases challenge
      else if (support === "bridge" && h === "dys") challenge = 70; // dictation eases challenge
      else if (support === "belay" && h === "rly") challenge = 65; // peer talk eases challenge
      
      walkedSteps.push(challenge);
    }
  });

  const avgChallenge = Math.round(walkedSteps.reduce((a,b)=>a+b, 0) / walkedSteps.length);
  const totalHalts = Object.values(S.hikerHaltSeg).filter(v => v !== null).length;
  const barrierLevel = Math.round((totalHalts / 4) * 100);

  $("statSummit").textContent = totalSuccessfulSummits + " / 4";
  $("statChallenge").textContent = avgChallenge + "%";
  $("statBarrier").textContent = barrierLevel + "%";

  // Build detail outcomes list
  const list = $("crossingsList");
  list.innerHTML = "";

  const details = [
    { id: "ell", name: "Maya", desc: "Multilingual Learner" },
    { id: "dys", name: "Jordan", desc: "Dysgraphia profile" },
    { id: "rly", name: "Riley", desc: "Anxious Speaker" },
    { id: "sam", name: "Sam", desc: "Bypass-defaulter" }
  ];

  details.forEach(h => {
    const li = document.createElement("li");
    const pos = S.hikerPositions[h.id];
    const flag = S.hikerSummitFlag[h.id];

    if (pos === 8) {
      if (flag === "color") {
        li.className = "x-ok";
        li.innerHTML = '<b>' + h.name + ' (' + h.desc + ')</b> successfully walked the entire trail, negotiating productive struggles to plant a colored summit flag.';
      } else {
        li.className = "x-zip";
        li.innerHTML = '<b>' + h.name + ' (' + h.desc + ')</b> took the AI Gondola shortcut directly to the top, planting a hollow gray flag and bypassing all learning.';
      }
    } else {
      li.className = "x-stop";
      li.innerHTML = '<b>' + h.name + ' (' + h.desc + ')</b> was gated by an exclusionary barrier and halted on Segment ' + (S.hikerHaltSeg[h.id] + 1) + ' (' + SEGMENTS[S.hikerHaltSeg[h.id]].name + ').';
    }
    list.appendChild(li);
  });

  // Reset reflection block
  $("reflectionText").value = "";
  $("reflectionBox").style.display = "block";
  $("frameworkMapping").style.display = "none";

  // Framework Thesis Statement
  $("thesisStatement").innerHTML = '<strong>Guide Thesis:</strong> Scaffolds should remove exclusionary barriers to participation without removing the cognitive work itself. When we lock down the environment, we block accessibility; when we automate the labor, we eliminate learning.';

  // Check attempt limits
  if (S.attempt < 3 && totalSuccessfulSummits < 4) {
    $("replayBtn").textContent = "Design Attempt " + (S.attempt + 1) + " &rarr;";
  } else {
    $("replayBtn").textContent = "Start Over &rarr;";
  }

  // Save progress in S.history
  S.history.push({
    attempt: S.attempt,
    summits: totalSuccessfulSummits,
    challenge: avgChallenge,
    barriers: barrierLevel
  });
}

// Kickoff
document.addEventListener("DOMContentLoaded", init);
