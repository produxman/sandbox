const { useState, useEffect, useRef } = React;

/* ─── Constants ─── */
const REST_DEFAULT = 90;
const imgCache = {};
const DB_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const DB_JSON = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
let exerciseDB = null;

const EFFORT_OPTIONS = [
  { emoji: "\u{1F60C}", label: "Easy" },
  { emoji: "\u{1F924}", label: "Moderate" },
  { emoji: "\u{1F975}", label: "Hard" },
];

const SAMPLE = `## Day 1 - Push
- Bench Press: 4x8
- Overhead Press: 3x10
- Lateral Raises: 3x15
- Tricep Pushdown: 3x12

## Day 2 - Pull
- Deadlift: 3x5
- Pull-ups: 4x8
- Barbell Row: 3x8
- Bicep Curls: 3x12

## Day 3 - Legs
- Squat: 4x6
- Romanian Deadlift: 3x10
- Leg Press: 3x12
- Calf Raises: 4x15`;

/* ─── Data helpers ─── */
async function loadDB() {
  if (exerciseDB) return exerciseDB;
  const res = await fetch(DB_JSON);
  exerciseDB = await res.json();
  return exerciseDB;
}

async function fetchExerciseImages(name) {
  if (imgCache[name] !== undefined) return imgCache[name];
  const db = await loadDB();
  const q = name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const words = q.split(" ").filter(w => w.length > 2);
  let best = null, bestScore = 0;
  for (const ex of db) {
    const exName = ex.name.toLowerCase();
    const score = words.filter(w => exName.includes(w)).length;
    if (score > bestScore) { bestScore = score; best = ex; }
  }
  const result = best && bestScore > 0 && best.images?.length
    ? { imgs: best.images.map(i => `${DB_BASE}${i}`), id: best.id, name: best.name }
    : { imgs: [], id: null, name: null };
  imgCache[name] = result;
  return result;
}

function parseTimedReps(reps) {
  const r = String(reps).toLowerCase().trim();
  const minMatch = r.match(/^(\d+(?:\.\d+)?)\s*min$/);
  if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60);
  const secMatch = r.match(/^(\d+(?:\.\d+)?)\s*s(?:ec(?:s)?)?$/);
  if (secMatch) return Math.round(parseFloat(secMatch[1]));
  const colonMatch = r.match(/^(\d+):(\d{2})$/);
  if (colonMatch) return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);
  return null;
}

function formatDuration(secs) {
  return secs >= 60 ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}` : `${secs}s`;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function parseWorkout(text) {
  const days = [];
  let currentDay = null;
  for (let line of text.split("\n")) {
    line = line.trim();
    if (!line) continue;
    const dayMatch = line.match(/^#{1,3}\s*(.*)/) || line.match(/^(Day\s+\d+\b[^:]*?)$/i);
    if (dayMatch) {
      currentDay = { title: dayMatch[1].trim(), exercises: [] };
      days.push(currentDay);
      continue;
    }
    if (!currentDay) {
      currentDay = { title: "Workout", exercises: [] };
      days.push(currentDay);
    }
    const exMatch = line.match(/^[-*\u2022]?\s*(.+?):\s*(\d+)\s*[xX\u00D7]\s*(\d+(?:[-.:}\d+)?(?:[a-zA-Z]+)?)\s*(?:\(([\d.]+)\s*kg\))?\s*$/);
    if (exMatch) {
      const sets = parseInt(exMatch[2]);
      const suggestedWeight = exMatch[4] ? parseFloat(exMatch[4]) : null;
      currentDay.exercises.push({
        id: Math.random().toString(36).slice(2),
        name: exMatch[1].trim(),
        sets,
        reps: exMatch[3],
        suggestedWeight,
        completedSets: Array(sets).fill(false),
      });
    }
  }
  return days.filter(d => d.exercises.length > 0);
}

/* ─── Alert Sound ─── */
function playAlert() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    // second beep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1100;
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.45);
    setTimeout(() => ctx.close(), 600);
  } catch (e) {}
}

/* ─── RestTimer ─── */
function RestTimer({ onDone }) {
  const endTimeRef = useRef(Date.now() + REST_DEFAULT * 1000);
  const [secs, setSecs] = useState(REST_DEFAULT);
  const ref = useRef();

  useEffect(() => {
    const tick = () => {
      const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
      if (remaining <= 0) { clearInterval(ref.current); setSecs(0); onDone(); }
      else setSecs(remaining);
    };
    ref.current = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(ref.current); document.removeEventListener("visibilitychange", tick); };
  }, []);

  const pct = secs / REST_DEFAULT;
  const r = 16, circ = 2 * Math.PI * r;

  return (
    React.createElement("div", { className: "rest-timer" },
      React.createElement("svg", { width: 40, height: 40 },
        React.createElement("circle", { cx: 20, cy: 20, r, fill: "none", stroke: "var(--separator)", strokeWidth: 3 }),
        React.createElement("circle", { cx: 20, cy: 20, r, fill: "none", stroke: "var(--accent)", strokeWidth: 3,
          strokeDasharray: circ, strokeDashoffset: circ * (1 - pct), strokeLinecap: "round",
          transform: "rotate(-90 20 20)", style: { transition: "stroke-dashoffset 0.3s" } }),
        React.createElement("text", { x: 20, y: 24, textAnchor: "middle", fontSize: 9, fontWeight: 700, fill: "var(--accent)" }, secs + "s")
      ),
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
        React.createElement("span", { className: "rest-timer__label" }, "Rest"),
        React.createElement("button", { className: "rest-timer__skip", onClick: () => { clearInterval(ref.current); onDone(); } }, "Skip")
      )
    )
  );
}

/* ─── ExerciseIllustration ─── */
function ExerciseIllustration({ name }) {
  const [result, setResult] = useState(null);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  const load = async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    try { setResult(await fetchExerciseImages(name)); }
    catch (e) { setError(e.message || "Failed to load"); }
    setLoading(false);
  };

  const toggle = () => {
    if (!expanded && !fetchedRef.current) load();
    setExpanded(e => !e);
  };

  const prev = () => setIdx(i => (i - 1 + result.imgs.length) % result.imgs.length);
  const next = () => setIdx(i => (i + 1) % result.imgs.length);
  const folderUrl = result?.id
    ? `https://github.com/yuhonas/free-exercise-db/tree/main/exercises/${encodeURIComponent(result.id)}`
    : null;

  return (
    React.createElement("div", { style: { marginBottom: 12 } },
      React.createElement("button", { className: "demo-toggle", onClick: toggle },
        expanded ? "\u25B2 Hide demo" : "\u25BC Show demo"),
      expanded && React.createElement("div", { className: "demo-panel" },
        loading
          ? React.createElement("div", { className: "loading-state" },
              React.createElement("div", { className: "spinner" }),
              React.createElement("span", { className: "loading-state__text" }, "Loading\u2026"))
          : error
          ? React.createElement("p", { className: "error-text" }, error)
          : result?.imgs.length
          ? React.createElement(React.Fragment, null,
              React.createElement("img", { src: result.imgs[idx], alt: name + " step " + (idx + 1) }),
              result.imgs.length > 1 && React.createElement("div", { className: "demo-nav" },
                React.createElement("button", { className: "demo-nav__btn", onClick: prev }, "\u2039"),
                React.createElement("span", { className: "demo-nav__counter" }, (idx + 1) + " / " + result.imgs.length),
                React.createElement("button", { className: "demo-nav__btn", onClick: next }, "\u203A")
              ),
              React.createElement("div", { className: "demo-match" },
                "Matched: ",
                React.createElement("a", { href: folderUrl, target: "_blank", rel: "noopener noreferrer" }, result.id)
              )
            )
          : React.createElement("p", { className: "empty-text" }, "No image found for \u201C" + name + "\u201D")
      )
    )
  );
}

/* ─── TimerPanel ─── */
function TimerPanel({ setIndex, totalSets, durationSecs, onComplete, onClose }) {
  const [paused, setPaused] = useState(false);
  const [secs, setSecs] = useState(durationSecs);
  const endTimeRef = useRef(Date.now() + durationSecs * 1000);
  const remainingOnPauseRef = useRef(durationSecs);
  const intervalRef = useRef();

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (paused) {
      remainingOnPauseRef.current = secs;
      return;
    }
    endTimeRef.current = Date.now() + remainingOnPauseRef.current * 1000;
    const tick = () => {
      const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
      if (remaining <= 0) { clearInterval(intervalRef.current); setSecs(0); playAlert(); onComplete(); }
      else setSecs(remaining);
    };
    intervalRef.current = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(intervalRef.current); document.removeEventListener("visibilitychange", tick); };
  }, [paused]);

  const pct = secs / durationSecs;
  const r = 22, circ = 2 * Math.PI * r;

  return (
    React.createElement("div", { className: "timer-panel " + (paused ? "timer-panel--paused" : "timer-panel--running") },
      React.createElement("svg", { width: 56, height: 56 },
        React.createElement("circle", { cx: 28, cy: 28, r, fill: "none", stroke: "var(--separator)", strokeWidth: 4 }),
        React.createElement("circle", { cx: 28, cy: 28, r, fill: "none",
          stroke: paused ? "var(--text-tertiary)" : "var(--accent)", strokeWidth: 4,
          strokeDasharray: circ, strokeDashoffset: circ * (1 - pct),
          strokeLinecap: "round", transform: "rotate(-90 28 28)",
          style: { transition: "stroke-dashoffset 0.3s" } }),
        React.createElement("text", { x: 28, y: 32, textAnchor: "middle", fontSize: 11, fontWeight: 700,
          fill: paused ? "var(--text-secondary)" : "var(--accent)" }, formatDuration(secs))
      ),
      React.createElement("div", { className: "timer-panel__info" },
        React.createElement("div", { className: "timer-panel__set-label" },
          "Set " + (setIndex + 1) + " of " + totalSets + (paused ? " \u00B7 Paused" : "")),
        React.createElement("div", { className: "timer-panel__controls" },
          React.createElement("button", { className: "btn btn--icon-circle", onClick: onClose, title: "Reset" },
            React.createElement("i", { className: "fa-solid fa-rotate-left" })),
          React.createElement("button", {
            className: "btn btn--icon-circle" + (paused ? " active" : ""),
            onClick: () => setPaused(p => !p),
            title: paused ? "Resume" : "Pause"
          }, React.createElement("i", { className: paused ? "fa-solid fa-play" : "fa-solid fa-pause" })),
          React.createElement("button", {
            className: "btn btn--icon-circle active",
            onClick: () => { clearInterval(intervalRef.current); onComplete(); },
            title: "Complete"
          }, React.createElement("i", { className: "fa-solid fa-check" }))
        )
      )
    )
  );
}

/* ─── WeightInput ─── */
function WeightInput({ currentWeight, onSave }) {
  const [val, setVal] = useState(currentWeight != null ? String(currentWeight) : "");
  const [effort, setEffort] = useState(null);
  const validNum = val !== "" && !isNaN(parseFloat(val)) && parseFloat(val) >= 0;
  const canCommit = effort !== null;

  const commit = () => { if (canCommit) onSave(validNum ? parseFloat(val) : null, effort); };

  return (
    React.createElement("div", { className: "weight-input" },
      React.createElement("div", { className: "weight-input__title" }, "How was this exercise?"),
      React.createElement("div", { className: "weight-input__row" },
        React.createElement("input", {
          type: "number", min: "0", step: "0.5", value: val,
          onChange: e => setVal(e.target.value),
          onKeyDown: e => e.key === "Enter" && commit(),
          placeholder: "0.0",
          className: "weight-input__field"
        }),
        React.createElement("span", { className: "weight-input__unit" }, "kg")
      ),
      React.createElement("div", { className: "weight-input__effort-row" },
        EFFORT_OPTIONS.map(opt =>
          React.createElement("button", {
            key: opt.label,
            className: "effort-btn" + (effort === opt.label ? " effort-btn--selected" : ""),
            onClick: () => setEffort(effort === opt.label ? null : opt.label),
            title: opt.label
          }, opt.emoji)
        ),
        React.createElement("button", {
          className: "weight-input__save",
          onClick: commit,
          disabled: !canCommit
        }, "Save")
      )
    )
  );
}

/* ─── ExerciseCard ─── */
function ExerciseCard({ ex, onChange, index, isResting, onStartRest, onEndRest }) {
  const [activeTimerIdx, setActiveTimerIdx] = useState(null);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const allDone = !ex.skipped && ex.completedSets.every(Boolean);
  const durationSecs = parseTimedReps(ex.reps);
  const isTimed = durationSecs !== null;

  const toggleSet = i => {
    if (ex.skipped) return;
    const updated = [...ex.completedSets];
    const wasComplete = updated[i];
    updated[i] = !updated[i];
    onChange({ ...ex, completedSets: updated });
    if (!wasComplete) {
      onStartRest(ex.id);
      if (updated.every(Boolean)) setShowWeightInput(true);
    }
  };

  const completeTimedSet = i => {
    const updated = [...ex.completedSets];
    if (!updated[i]) {
      updated[i] = true;
      onChange({ ...ex, completedSets: updated });
      setActiveTimerIdx(null);
      onStartRest(ex.id);
      if (updated.every(Boolean)) setShowWeightInput(true);
    }
  };

  const handleSkip = () => {
    if (ex.skipped) {
      onChange({ ...ex, skipped: false, completedSets: Array(ex.sets).fill(false) });
    } else {
      onChange({ ...ex, skipped: true, completedSets: Array(ex.sets).fill(false) });
      onEndRest();
      setActiveTimerIdx(null);
      setShowWeightInput(false);
    }
  };

  const cardClass = ex.skipped ? "exercise-card exercise-card--skipped"
    : allDone ? "exercise-card exercise-card--done"
    : "exercise-card";

  return (
    React.createElement("div", {
      className: cardClass,
      style: { animationDelay: (index * 0.05) + "s" }
    },
      React.createElement("div", { className: "exercise-card__header" },
        React.createElement("div", null,
          React.createElement("div", { className: "exercise-card__name" },
            allDone && React.createElement("span", { className: "check-icon" }, "\u2713"),
            ex.skipped && React.createElement("span", { className: "skip-icon" }, "\u2715"),
            React.createElement("span", { style: ex.skipped ? { textDecoration: "line-through", opacity: 0.5 } : null },
              toTitleCase(ex.name))
          ),
          React.createElement("div", { className: "exercise-card__meta" },
            ex.skipped
              ? React.createElement("span", { className: "exercise-card__skipped-tag" }, "Skipped")
              : React.createElement(React.Fragment, null,
                  ex.sets + " \u00D7 " + ex.reps,
                  ex.suggestedWeight != null && ex.weight == null
                    ? React.createElement("span", { className: "exercise-card__suggested-tag" },
                        "(" + ex.suggestedWeight + "kg suggested)")
                    : null,
                  ex.weight != null
                    ? React.createElement("span", { className: "exercise-card__weight-tag" }, ex.weight + "kg")
                    : null,
                  ex.effort
                    ? React.createElement("span", null, EFFORT_OPTIONS.find(o => o.label === ex.effort)?.emoji)
                    : null
                )
          )
        ),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
          !allDone && React.createElement("button", {
            className: "btn-skip" + (ex.skipped ? " btn-skip--active" : ""),
            onClick: handleSkip,
            title: ex.skipped ? "Undo skip" : "Skip exercise"
          }, ex.skipped ? "Undo" : "Skip"),
          !ex.skipped && React.createElement("div", { className: "exercise-card__counter" },
            ex.completedSets.filter(Boolean).length + "/" + ex.sets + " sets")
        )
      ),
      !ex.skipped && React.createElement(ExerciseIllustration, { name: ex.name }),
      !ex.skipped && React.createElement("div", { className: "sets-row" },
        ex.completedSets.map((done, i) => {
          const isActive = isTimed && activeTimerIdx === i;
          return React.createElement("button", {
            key: i,
            className: "set-btn" + (done ? " set-btn--done" : "") + (isActive ? " set-btn--active" : ""),
            onClick: () => {
              if (isTimed) { if (!done) setActiveTimerIdx(isActive ? null : i); }
              else toggleSet(i);
            }
          }, done ? "\u2713" : i + 1);
        }),
        isResting && React.createElement(RestTimer, { onDone: () => onEndRest() })
      ),
      !ex.skipped && isTimed && activeTimerIdx !== null && React.createElement(TimerPanel, {
        key: activeTimerIdx, setIndex: activeTimerIdx, totalSets: ex.sets,
        durationSecs, onComplete: () => completeTimedSet(activeTimerIdx),
        onClose: () => setActiveTimerIdx(null)
      }),
      !ex.skipped && showWeightInput && !ex.weightLogged && React.createElement(WeightInput, {
        currentWeight: ex.suggestedWeight ?? null,
        onSave: (w, effort) => {
          onChange({ ...ex, weight: w, effort, weightLogged: true });
          setShowWeightInput(false);
        }
      })
    )
  );
}

/* ─── CopyStatsButton ─── */
function CopyStatsButton({ days }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const sections = days.map(day => {
      const lines = day.exercises.map(ex => {
        if (ex.skipped) return "- " + toTitleCase(ex.name) + ": Skipped";
        const weightStr = ex.weight != null ? ex.weight + " kg" : "no weights";
        const effortStr = ex.effort ? " " + (EFFORT_OPTIONS.find(o => o.label === ex.effort)?.emoji) + " " + ex.effort : "";
        return "- " + toTitleCase(ex.name) + ": " + ex.sets + "x" + ex.reps + " (" + weightStr + ")" + effortStr;
      });
      return day.title + "\n" + lines.join("\n");
    });
    const text = "I just completed my workout for today, Log workout weights below:\n\n" + sections.join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return React.createElement("button", {
    className: "btn btn--copy" + (copied ? " copied" : ""),
    onClick: handleCopy
  }, copied ? "\u2713 Copied!" : "\uD83D\uDCCB Copy Stats");
}

/* ─── WorkoutDay ─── */
function WorkoutDay({ day, onUpdate }) {
  const [restingExId, setRestingExId] = useState(null);
  const total = day.exercises.reduce((a, e) => a + e.sets, 0);
  const done = day.exercises.reduce((a, e) => a + (e.skipped ? e.sets : e.completedSets.filter(Boolean).length), 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    React.createElement("div", null,
      React.createElement("div", { className: "progress-section" },
        React.createElement("div", { className: "progress-meta" },
          React.createElement("span", null, done + "/" + total + " sets"),
          React.createElement("span", null, pct + "%")
        ),
        React.createElement("div", { className: "progress-track" },
          React.createElement("div", { className: "progress-fill", style: { width: pct + "%" } })
        )
      ),
      day.exercises.map((ex, i) =>
        React.createElement(ExerciseCard, {
          key: ex.id, ex, index: i,
          isResting: restingExId === ex.id,
          onStartRest: id => setRestingExId(id),
          onEndRest: () => setRestingExId(null),
          onChange: updated => onUpdate({
            ...day,
            exercises: day.exercises.map(e => e.id === updated.id ? updated : e)
          })
        })
      )
    )
  );
}

/* ─── App ─── */
function App() {
  const [screen, setScreen] = useState(() => {
    try { return JSON.parse(localStorage.getItem("workout_state"))?.screen || "paste"; }
    catch { return "paste"; }
  });
  const [text, setText] = useState(() => {
    try { return JSON.parse(localStorage.getItem("workout_state"))?.text || ""; }
    catch { return ""; }
  });
  const [days, setDays] = useState(() => {
    try { return JSON.parse(localStorage.getItem("workout_state"))?.days || []; }
    catch { return []; }
  });
  const [activeDay, setActiveDay] = useState(() => {
    try { return JSON.parse(localStorage.getItem("workout_state"))?.activeDay || 0; }
    catch { return 0; }
  });

  useEffect(() => {
    localStorage.setItem("workout_state", JSON.stringify({ screen, text, days, activeDay }));
  }, [screen, text, days, activeDay]);

  const handleLoad = t => {
    const parsed = parseWorkout(t);
    if (!parsed.length) { alert("Couldn\u2019t parse any exercises. Check the format and try again."); return; }
    setDays(parsed);
    setActiveDay(0);
    setScreen("workout");
  };

  /* ── Paste screen ── */
  if (screen === "paste") {
    return (
      React.createElement("div", { className: "content content--centered" },
        React.createElement("div", { className: "paste-screen" },

          React.createElement("div", { className: "paste-header" },
            React.createElement("img", { className: "paste-header__icon", src: "img/icon.png", alt: "Pandamonium" }),
            React.createElement("h1", { className: "paste-header__title" }, "Pandamonium"),
            React.createElement("p", { className: "paste-header__subtitle" }, "Paste your workout plan to get started")
          ),

          React.createElement("div", { className: "paste-card" },
            React.createElement("div", { className: "paste-card__label" }, "Your Workout Plan"),
            React.createElement("textarea", {
              className: "paste-card__textarea",
              value: text,
              onChange: e => setText(e.target.value),
              placeholder: "Paste your plan here. Example:\n\n## Day 1 - Push\n- Bench Press: 4x8\n- Overhead Press: 3x10\n\n## Day 2 - Pull\n- Pull-ups: 4x8"
            }),
            React.createElement("div", { className: "paste-actions" },
              React.createElement("button", {
                className: "btn btn--primary",
                onClick: () => handleLoad(text),
                disabled: !text.trim()
              }, "LFG \uD83D\uDD25"),
              React.createElement("button", {
                className: "btn btn--secondary",
                onClick: () => navigator.clipboard.readText().then(t => { if (t) setText(t); })
              }, "\uD83D\uDCCB Paste"),
              text.trim() && React.createElement("button", {
                className: "btn btn--secondary",
                onClick: () => setText("")
              }, "Clear")
            ),
          ),

          React.createElement("p", { className: "paste-hint" },
            "Format: ",
            React.createElement("code", null, "- Exercise Name: 3x10")
          )
        )
      )
    );
  }

  /* ── Workout screen ── */
  const day = days[activeDay];
  const allDaysComplete = days.every(d =>
    d.exercises.every(ex => ex.skipped || ex.completedSets.every(Boolean))
  );
  return (
    React.createElement("div", { style: { minHeight: "100vh", minHeight: "100dvh", background: "var(--bg)" } },

      React.createElement("div", { className: "nav-bar" },
        React.createElement("div", { className: "nav-bar__brand" },
          React.createElement("img", { className: "nav-bar__brand-icon", src: "img/icon.png", alt: "" }),
          "Pandamonium"
        ),
        React.createElement("button", {
          className: "nav-bar__action",
          onClick: () => {
            localStorage.removeItem("workout_state");
            setScreen("paste");
            setText("");
            setDays([]);
          }
        }, "\u2190 New Plan")
      ),

      days.length > 1 && React.createElement("div", { className: "day-tabs" },
        days.map((d, i) =>
          React.createElement("button", {
            key: i,
            className: "day-tab" + (i === activeDay ? " day-tab--active" : ""),
            onClick: () => setActiveDay(i)
          }, d.title)
        )
      ),

      React.createElement("div", { className: "content" },
        React.createElement("h2", { className: "day-title" }, day.title),
        React.createElement(WorkoutDay, {
          day,
          onUpdate: updated => setDays(days.map((d, i) => i === activeDay ? updated : d))
        }),
        allDaysComplete && React.createElement("div", { className: "completion-banner" },
          React.createElement("div", { className: "completion-banner__emoji" }, "\uD83C\uDF89"),
          React.createElement("div", { className: "completion-banner__text" }, "All done! Great work!"),
          React.createElement(CopyStatsButton, { days })
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
