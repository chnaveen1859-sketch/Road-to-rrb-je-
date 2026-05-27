import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Clock, 
  Brain, 
  Compass, 
  Award, 
  Sparkles, 
  Plus, 
  Sliders,
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Paperclip, 
  Send, 
  X, 
  ExternalLink, 
  Save, 
  Download, 
  Upload,
  Layers,
  Flame,
  Check,
  AlertCircle,
  TrendingUp,
  Maximize2,
  Minimize2,
  BookMarked,
  RotateCw,
  Zap,
  HelpCircle,
  Settings,
  Search
} from 'lucide-react';
import { 
  DayEntry, 
  PlaylistMap, 
  DayStudyVault, 
  Flashcard, 
  WeaknessEntry, 
  QuizAttempt, 
  syllabus_blueprint, 
  SubjectKeys, 
  subjectsArray 
} from './types';
import { generateProceduralQuiz, Question } from './utils/quizFactory';

// Backup memory in case localStorage fails
let memoryBackupStorage: Record<string, string> = {};

// Helper tool to render mathematical unicode fallback if KaTeX fails to load
export function fallbackMathRenderer(latex: string): string {
  if (!latex) return "";
  let result = latex;

  // Replace fractions: \frac{a}{b} -> (a) / (b)
  result = result.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1) / ($2)");

  // Replace square roots: \sqrt{a} -> √(a)
  result = result.replace(/\\sqrt\{([^}]*)\}/g, "√($1)");

  // Replace subscripts: x_{n} or x_n -> x[n] or x_n
  result = result.replace(/_\{([^}]*)\}/g, "_$1");
  // Replace power/exponents: x^{y} -> x^(y)
  result = result.replace(/\^\{([^}]*)\}/g, "^($1)");

  // Greek letters definitions
  const greek: Record<string, string> = {
    "\\theta": "θ",
    "\\pi": "π",
    "\\alpha": "α",
    "\\beta": "β",
    "\\gamma": "γ",
    "\\lambda": "λ",
    "\\delta": "δ",
    "\\omega": "ω",
    "\\mu": "μ",
    "\\sigma": "σ",
    "\\phi": "φ",
    "\\epsilon": "ε",
    "\\int": "∫",
    "\\sum": "∑",
    "\\pm": "±",
    "\\times": "×",
    "\\div": "÷",
    "\\neq": "≠",
    "\\approx": "≈",
    "\\infty": "∞",
    "\\le": "≤",
    "\\ge": "≥",
    "\\lim": "lim",
    "\\to": "→",
    "\\cdot": "·",
    "\\partial": "∂",
    "\\nabla": "∇"
  };

  Object.entries(greek).forEach(([key, val]) => {
    const escapedKey = key.replace(/\\/g, "\\\\");
    result = result.replace(new RegExp(escapedKey, "g"), val);
  });

  return result;
}

// Inline/Block KaTeX Real-time Renderer
function MathRenderer({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [katexLoaded, setKatexLoaded] = useState(false);

  useEffect(() => {
    const checkKatex = () => {
      if ((window as any).katex) {
        setKatexLoaded(true);
      }
    };
    checkKatex();
    const interval = setInterval(checkKatex, 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      if (katexLoaded && (window as any).katex) {
        try {
          const lines = text.split("\n");
          containerRef.current.innerHTML = "";
          
          lines.forEach(line => {
            if (!line.trim()) return;
            const lineDiv = document.createElement("div");
            lineDiv.className = "my-1 overflow-x-auto whitespace-nowrap scrollbar-none py-1 block w-full text-center";
            
            (window as any).katex.render(line, lineDiv, {
              displayMode: true,
              throwOnError: false,
              trust: true
            });
            containerRef.current?.appendChild(lineDiv);
          });
          
          if (containerRef.current.innerHTML === "") {
            containerRef.current.innerHTML = '<span class="text-zinc-600 text-xs italic">Live beautiful equations layout preview will render here automatically...</span>';
          }
        } catch (err) {
          containerRef.current.innerText = text;
        }
      } else {
        containerRef.current.innerHTML = "";
        const lines = text.split("\n");
        let hasValue = false;
        lines.forEach(line => {
          if (!line.trim()) return;
          hasValue = true;
          const div = document.createElement("div");
          div.className = "font-mono text-zinc-300 text-xs py-1 whitespace-pre-wrap overflow-x-auto block text-center";
          div.textContent = fallbackMathRenderer(line);
          containerRef.current?.appendChild(div);
        });
        if (!hasValue) {
          containerRef.current.innerHTML = '<span class="text-zinc-600 text-xs italic font-sans">Live beautiful equations layout preview will render here automatically...</span>';
        }
      }
    }
  }, [text, katexLoaded]);

  return (
    <div 
      ref={containerRef} 
      className="rounded-xl bg-zinc-950 p-4 border border-zinc-900 overflow-x-auto text-purple-400 font-mono text-sm shadow-inner min-h-[60px] flex flex-col justify-center items-center w-full" 
    />
  );
}

// Specialised renderer for Leitner Flashcard containing formulas
function FlashcardTextRenderer({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [katexLoaded, setKatexLoaded] = useState(false);

  useEffect(() => {
    const checkKatex = () => {
      if ((window as any).katex) {
        setKatexLoaded(true);
      }
    };
    checkKatex();
    const interval = setInterval(checkKatex, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (katexLoaded && (window as any).katex) {
      try {
        containerRef.current.innerHTML = "";
        const lines = text.split("\n");
        lines.forEach(line => {
          const lineDiv = document.createElement("div");
          lineDiv.className = "my-1 min-h-[16px]";
          
          if (line.includes("FORMULAS:") || line.includes("NOTES:") || line.includes("SHORTCUTS:")) {
            lineDiv.className = "text-[#00E5FF] font-extrabold uppercase text-[10px] tracking-widest mt-4 mb-2 font-mono border-b border-zinc-800 pb-1";
            lineDiv.textContent = line;
          } else if (line.trim() && !line.startsWith("[") && (line.includes("\\") || line.includes("^") || line.includes("_") || line.includes("/") || line.includes("{") || line.includes("}"))) {
            try {
              const mathDiv = document.createElement("div");
              mathDiv.className = "p-2.5 bg-black/40 rounded-xl border border-zinc-850 my-1 font-mono text-purple-300 overflow-x-auto text-xs w-full";
              (window as any).katex.render(line, mathDiv, {
                displayMode: false,
                throwOnError: false
              });
              lineDiv.appendChild(mathDiv);
            } catch (err) {
              lineDiv.className = "text-zinc-300 font-mono text-xs whitespace-pre-wrap pl-2 leading-relaxed";
              lineDiv.textContent = line;
            }
          } else {
            lineDiv.className = "text-zinc-300 font-sans text-xs whitespace-pre-wrap leading-relaxed";
            lineDiv.textContent = line;
          }
          containerRef.current?.appendChild(lineDiv);
        });
      } catch (e) {
        containerRef.current.innerText = text;
      }
    } else {
      containerRef.current.innerHTML = "";
      const lines = text.split("\n");
      lines.forEach(line => {
        const div = document.createElement("div");
        if (line.includes("FORMULAS:") || line.includes("NOTES:") || line.includes("SHORTCUTS:")) {
          div.className = "text-[#00E5FF] font-extrabold uppercase text-[10px] tracking-widest mt-4 mb-2 font-mono border-b border-zinc-800 pb-1";
          div.textContent = line;
        } else {
          div.className = "text-zinc-300 font-mono text-xs whitespace-pre-wrap leading-relaxed";
          div.textContent = fallbackMathRenderer(line);
        }
        containerRef.current?.appendChild(div);
      });
    }
  }, [text, katexLoaded]);

  return <div ref={containerRef} className="space-y-1 w-full text-left" />;
}

export default function App() {
  // Global States
  const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistMap>({
    "Mathematics": "",
    "General Intelligence & Reasoning": "",
    "General Science": "",
    "General Awareness": "",
  });
  const [studyVault, setStudyVault] = useState<Record<number, DayStudyVault>>({});
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [weaknessVault, setWeaknessVault] = useState<WeaknessEntry[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  
  // Navigation & Interactive UI States
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Study Batch, 1: Playlists, 2: Gemini AI, 3: Study Vault, 4: Revision
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1); // Page 1 of 20 (20 days per page)
  const [localEmergencyBackupPressed, setLocalEmergencyBackupPressed] = useState<boolean>(false);
  const [showBackupAlert, setShowBackupAlert] = useState<boolean>(false);

  // Selector Modal States
  const [activeDayForTopicSelection, setActiveDayForTopicSelection] = useState<number | null>(null);
  const [selectionModalStage, setSelectionModalStage] = useState<1 | 2>(1);
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState<SubjectKeys | null>(null);

  // Fullscreen Notebook Overlay States
  const [activeDayForVaultEdit, setActiveDayForVaultEdit] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState<string>("");
  const [tempFormulas, setTempFormulas] = useState<string>("");
  const [tempShortcuts, setTempShortcuts] = useState<string>("");
  const [vaultSaveStatus, setVaultSaveStatus] = useState<string>("All changes saved");

  // Flashcards Learning Deck States
  const [activeLeitnerReview, setActiveLeitnerReview] = useState<boolean>(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState<boolean>(false);
  const [activeLeitnerBoxFilter, setActiveLeitnerBoxFilter] = useState<1 | 2 | 3 | 0>(0); // 0 = all

  // Pomodoro States
  const [pomodoroMinutes, setPomodoroMinutes] = useState<number>(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(0);
  const [pomodoroActive, setPomodoroActive] = useState<boolean>(false);
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);

  // Customizable Focus Mode States
  const [customFocusMinutes, setCustomFocusMinutes] = useState<number>(25);
  const [customRestMinutes, setCustomRestMinutes] = useState<number>(5);
  const [pomodoroMode, setPomodoroMode] = useState<"focus" | "rest">("focus");
  const [activeFocusDay, setActiveFocusDay] = useState<number>(1);

  // Active Quiz Modal States
  const [activeQuiz, setActiveQuiz] = useState<{
    day: number;
    type: "daily" | "weekly" | "grand";
    topic: string;
    subject: string;
    questions: Question[];
    currentIdx: number;
    userAnswers: Record<number, number>; // questionIdx -> selectedOptionIdx
    timeLeft: number | null; // in seconds
    isSubmitted: boolean;
  } | null>(null);
  const [globalQuizTimeLimit, setGlobalQuizTimeLimit] = useState<boolean>(true);

  // References and helper utilities for Math equations support
  const formulasTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Inject KaTeX CSS and JS dynamic CDN loads
  useEffect(() => {
    // Append KaTeX CSS
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      document.head.appendChild(link);
    }
    // Append KaTeX JS
    if (!document.getElementById('katex-js')) {
      const script = document.createElement('script');
      script.id = 'katex-js';
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const insertMath = (latex: string) => {
    const textarea = formulasTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newValue = before + latex + after;
    setTempFormulas(newValue);
    if (activeDayForVaultEdit !== null) {
      saveVaultEntry(activeDayForVaultEdit, tempNotes, newValue, tempShortcuts);
    }
    
    // Put focus back and move cursor inside brackets or after template
    setTimeout(() => {
      textarea.focus();
      let cursorOffset = latex.length;
      if (latex.includes('{')) {
        cursorOffset = latex.indexOf('{') + 1;
      }
      const newCursorPos = start + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Instant Revision & Cheat-Sheet Engine State
  const [revisionSearchQuery, setRevisionSearchQuery] = useState<string>("");
  const [selectedFilterSubject, setSelectedFilterSubject] = useState<string>("All");

  // Load from LocalStorage or pre-populate
  useEffect(() => {
    try {
      const storedDays = localStorage.getItem("rrb_day_entries");
      if (storedDays) {
        setDayEntries(JSON.parse(storedDays));
      } else {
        const prepopulated: DayEntry[] = Array.from({ length: 400 }, (_, i) => ({
          day: i + 1,
          topic: "",
          subject: "",
          dateLogged: "",
          quizCompleted: false,
        }));
        setDayEntries(prepopulated);
      }

      const storedPlaylists = localStorage.getItem("rrb_playlists");
      if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));

      const storedVault = localStorage.getItem("rrb_study_vault");
      if (storedVault) setStudyVault(JSON.parse(storedVault));

      const storedCards = localStorage.getItem("rrb_flashcards");
      if (storedCards) setFlashcards(JSON.parse(storedCards));

      const storedWeakness = localStorage.getItem("rrb_weakness_vault");
      if (storedWeakness) setWeaknessVault(JSON.parse(storedWeakness));

      const storedAttempts = localStorage.getItem("rrb_quiz_attempts");
      if (storedAttempts) setQuizAttempts(JSON.parse(storedAttempts));

      const storedPomodoros = localStorage.getItem("rrb_pomodoro_count");
      if (storedPomodoros) setPomodoroCount(Number(storedPomodoros));

      const storedFocusMin = localStorage.getItem("rrb_custom_focus_minutes");
      if (storedFocusMin) {
        setCustomFocusMinutes(Number(storedFocusMin));
        setPomodoroMinutes(Number(storedFocusMin));
      }
      const storedRestMin = localStorage.getItem("rrb_custom_rest_minutes");
      if (storedRestMin) setCustomRestMinutes(Number(storedRestMin));

      const storedPomoMode = localStorage.getItem("rrb_pomodoro_mode");
      if (storedPomoMode === "rest") {
        setPomodoroMode("rest");
      } else {
        setPomodoroMode("focus");
      }

      const storedActiveFocusDay = localStorage.getItem("rrb_active_focus_day");
      if (storedActiveFocusDay) setActiveFocusDay(Number(storedActiveFocusDay));

    } catch (err) {
      console.error("Failed to load initial localStorage", err);
      setShowBackupAlert(true);
    }
  }, []);

  // Safe State Persistent Wrapper
  const handlePersist = (key: string, data: any) => {
    try {
      const dataStr = JSON.stringify(data);
      localStorage.setItem(key, dataStr);
    } catch (err) {
      console.error("Local storage persistent bottle-neck detected", err);
      // fallback memory dump
      memoryBackupStorage[key] = JSON.stringify(data);
      setShowBackupAlert(true);
    }
  };

  // Helper trigger to save studyVault entries
  const saveVaultEntry = (day: number, notes: string, formulas: string, shortcuts: string) => {
    setVaultSaveStatus("Saving...");
    const updated = {
      ...studyVault,
      [day]: {
        personalNotes: notes,
        formulas: formulas,
        speedShortcuts: shortcuts
      }
    };
    setStudyVault(updated);
    handlePersist("rrb_study_vault", updated);
    setTimeout(() => {
      setVaultSaveStatus("All changes saved");
    }, 400);
  };

  // Export state to rrb_progress.json
  const exportProgress = () => {
    const backupObj = {
      dayEntries,
      playlists,
      studyVault,
      flashcards,
      weaknessVault,
      quizAttempts,
      pomodoroCount,
      timestamp: new Date().toISOString()
    };
    try {
      const jsonStr = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "rrb_progress.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Fail to export backup safely.");
    }
  };

  // Import state from rrb_progress.json
  const importProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.dayEntries && Array.isArray(parsed.dayEntries)) {
          setDayEntries(parsed.dayEntries);
          handlePersist("rrb_day_entries", parsed.dayEntries);

          if (parsed.playlists) {
            setPlaylists(parsed.playlists);
            handlePersist("rrb_playlists", parsed.playlists);
          }
          if (parsed.studyVault) {
            setStudyVault(parsed.studyVault);
            handlePersist("rrb_study_vault", parsed.studyVault);
          }
          if (parsed.flashcards) {
            setFlashcards(parsed.flashcards);
            handlePersist("rrb_flashcards", parsed.flashcards);
          }
          if (parsed.weaknessVault) {
            setWeaknessVault(parsed.weaknessVault);
            handlePersist("rrb_weakness_vault", parsed.weaknessVault);
          }
          if (parsed.quizAttempts) {
            setQuizAttempts(parsed.quizAttempts);
            handlePersist("rrb_quiz_attempts", parsed.quizAttempts);
          }
          if (parsed.pomodoroCount !== undefined) {
            setPomodoroCount(Number(parsed.pomodoroCount));
            handlePersist("rrb_pomodoro_count", parsed.pomodoroCount);
          }
          alert("Progress loaded successfully! All metrics refreshed instantly.");
        } else {
          alert("Invalid backup file: Day entries block is missing.");
        }
      } catch (err) {
        alert("Fail to parse backup file. Check file integrity.");
      }
    };
    reader.readAsText(file);
  };

  // Calculate Progress Metrics
  const metrics = useMemo(() => {
    const totalDays = 400;
    const selectedDaysCount = dayEntries.filter(d => d.topic !== "").length;
    const quizzesPassedCount = dayEntries.filter(d => d.quizCompleted).length;

    // Scale percentage Completed and Remaining
    // Let's count completion as quizzes completed, scaled out of 400
    const finishedPercentage = parseFloat(((quizzesPassedCount / totalDays) * 100).toFixed(1));
    const remainingPercentage = parseFloat((100 - finishedPercentage).toFixed(1));

    // Accuracy calculation: rolling average of last 5 test scores including 1/3 penalty
    // we fetch from quizAttempts
    const last5 = quizAttempts.slice(-5);
    let avgAccuracy = 0;
    if (last5.length > 0) {
      const sum = last5.reduce((acc, curr) => {
        // e.g. Score correct out of total
        // penalty = correct - (total - correct) * 1/3
        const correct = curr.score;
        const incorrect = curr.total - curr.score;
        const penaltyScore = correct - incorrect / 3;
        const pct = Math.max(0, (penaltyScore / curr.total) * 100);
        return acc + pct;
      }, 0);
      avgAccuracy = parseFloat((sum / last5.length).toFixed(1));
    }

    // Active Focus Hours
    const focusHrs = parseFloat(((pomodoroCount * 25) / 60).toFixed(1));

    // Dynamic Streak calculation
    // Calculate continuous blocks of completed days that have both topic selection and finished quizzes
    let maxStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < 400; i++) {
      const entry = dayEntries[i];
      if (entry && entry.topic && entry.quizCompleted) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }

    return {
      finishedPct: finishedPercentage,
      remainingPct: remainingPercentage,
      selectedDaysCount,
      quizzesPassedCount,
      accuracy: last5.length > 0 ? avgAccuracy : 100.0,
      focusHours: focusHrs,
      streak: maxStreak
    };
  }, [dayEntries, quizAttempts, pomodoroCount]);

  // Pomodoro native timer logic with iframe-safe synthesizer support
  useEffect(() => {
    let interval: any = null;
    if (pomodoroActive) {
      interval = setInterval(() => {
        setPomodoroSeconds((prevSec) => {
          if (prevSec > 0) {
            return prevSec - 1;
          } else {
            setPomodoroMinutes((prevMin) => {
              if (prevMin > 0) {
                setPomodoroSeconds(59);
                return prevMin - 1;
              } else {
                // Completed!
                clearInterval(interval);
                handlePomodoroCompletion();
                return 0;
              }
            });
            return 0;
          }
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroMode, customFocusMinutes, customRestMinutes, activeFocusDay]);

  const changeCustomFocusMinutes = (mins: number) => {
    const val = Math.max(1, Math.min(240, mins));
    setCustomFocusMinutes(val);
    localStorage.setItem("rrb_custom_focus_minutes", String(val));
    if (!pomodoroActive && pomodoroMode === "focus") {
      setPomodoroMinutes(val);
      setPomodoroSeconds(0);
    }
  };

  const changeCustomRestMinutes = (mins: number) => {
    const val = Math.max(1, Math.min(120, mins));
    setCustomRestMinutes(val);
    localStorage.setItem("rrb_custom_rest_minutes", String(val));
    if (!pomodoroActive && pomodoroMode === "rest") {
      setPomodoroMinutes(val);
      setPomodoroSeconds(0);
    }
  };

  const handlePomodoroCompletion = () => {
    setPomodoroActive(false);
    setPomodoroSeconds(0);

    // Beep sound trigger
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Chime block", e);
    }

    // Flash animation signal
    const flashElement = document.getElementById("focus-wave-glow");
    if (flashElement) {
      flashElement.classList.add("glow-blue");
      flashElement.classList.add("ring-8");
      flashElement.classList.add("ring-emerald-500/50");
      setTimeout(() => {
        flashElement.classList.remove("glow-blue");
        flashElement.classList.remove("ring-8");
        flashElement.classList.remove("ring-emerald-500/50");
      }, 3000);
    }

    if (pomodoroMode === "focus") {
      // 1. Award focus completion badge to that active day row
      const updatedDays = dayEntries.map((d) => 
        d.day === activeFocusDay ? { ...d, focusCompleted: true } : d
      );
      setDayEntries(updatedDays);
      handlePersist("rrb_day_entries", updatedDays);

      // 2. Increment pomodoroCount state and persist
      const updatedCount = pomodoroCount + 1;
      setPomodoroCount(updatedCount);
      handlePersist("rrb_pomodoro_count", updatedCount);

      // 3. Transition automatically to BREAK TIME utilizing the value from [Rest Time]
      setPomodoroMode("rest");
      localStorage.setItem("rrb_pomodoro_mode", "rest");
      setPomodoroMinutes(customRestMinutes);
      
      // Auto-start rest interval countdown
      setTimeout(() => {
        setPomodoroActive(true);
      }, 100);

      alert(`Concentration period resolved! Focus Badge awarded to Day ${activeFocusDay} in list. Entering BREAK TIME interval countdown...`);
    } else {
      // Transition back to FOCUS Mode countdown utilizing the value from [Focus Time]
      setPomodoroMode("focus");
      localStorage.setItem("rrb_pomodoro_mode", "focus");
      setPomodoroMinutes(customFocusMinutes);

      alert("Rest interval completed! Focus Mode reset for your next productive streak.");
    }
  };

  // Quiz Countdown Timer
  useEffect(() => {
    let quizInterval: any = null;
    if (activeQuiz && activeQuiz.timeLeft !== null && !activeQuiz.isSubmitted) {
      quizInterval = setInterval(() => {
        setActiveQuiz((prev) => {
          if (!prev || prev.timeLeft === null) return prev;
          if (prev.timeLeft <= 1) {
            clearInterval(quizInterval);
            // auto submit
            return {
              ...prev,
              timeLeft: 0,
              isSubmitted: true
            };
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          };
        });
      }, 1000);
    }
    return () => {
      if (quizInterval) clearInterval(quizInterval);
    };
  }, [activeQuiz]);

  // Handle active sub-topic selection automations
  const selectTopicAndAutomate = (topicText: string) => {
    if (activeDayForTopicSelection === null || !selectedSubjectForModal) return;

    const dayNum = activeDayForTopicSelection;
    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase().replace(/ /g, '-'); // e.g. 26-MAY-2026

    const updatedDays = dayEntries.map((d) => {
      if (d.day === dayNum) {
        return {
          ...d,
          topic: topicText,
          subject: selectedSubjectForModal,
          dateLogged: formattedDate,
        };
      }
      return d;
    });

    setDayEntries(updatedDays);
    handlePersist("rrb_day_entries", updatedDays);

    // Smoothly clean up topic selector modals
    setActiveDayForTopicSelection(null);
    setSelectedSubjectForModal(null);
    setSelectionModalStage(1);
    
    // Switch view to Study Vault automatically so user can review the notes layout if desired
    // Or keep them on Tab 1
  };

  // Convert Notebook items to Flashcard
  const convertToFlashcard = (dayNum: number, topic: string) => {
    const notesData = studyVault[dayNum];
    if (!notesData) {
      alert("Please log notes or formulas first before generating a flashcard!");
      return;
    }
    const frontText = `Day ${dayNum}: ${topic}`;
    const backText = `NOTES:\n${notesData.personalNotes || "N/A"}\n\nFORMULAS:\n${notesData.formulas || "N/A"}\n\nSHORTCUTS:\n${notesData.speedShortcuts || "N/A"}`;

    const newCard: Flashcard = {
      id: `fc-${Date.now()}`,
      day: dayNum,
      front: frontText,
      back: backText,
      box: 1
    };

    const updated = [...flashcards, newCard];
    setFlashcards(updated);
    handlePersist("rrb_flashcards", updated);
    alert(`Successfully compiled to Leitner review card! Assigned to Box 1.`);
  };

  // Leitner Spaced Repetition card movement
  const moveFlashcardLeitner = (cardId: string, targetBox: 1 | 2 | 3) => {
    const updated = flashcards.map((fc) => {
      if (fc.id === cardId) {
        return { ...fc, box: targetBox, lastReviewed: new Date().toLocaleDateString() };
      }
      return fc;
    });
    setFlashcards(updated);
    handlePersist("rrb_flashcards", updated);

    // Advanced index
    if (currentFlashcardIndex < filteredFlashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    } else {
      setCurrentFlashcardIndex(0);
    }
    setIsFlashcardFlipped(false);
  };

  const filteredFlashcards = useMemo(() => {
    if (activeLeitnerBoxFilter === 0) return flashcards;
    return flashcards.filter(fc => fc.box === activeLeitnerBoxFilter);
  }, [flashcards, activeLeitnerBoxFilter]);

  // Quiz execution launch
  const launchProceduralQuiz = (dayNum: number, type: "daily" | "weekly" | "grand") => {
    const entry = dayEntries[dayNum - 1];
    if (!entry || !entry.topic) {
      alert("No topic entered for this day. Complete study topic selection first!");
      return;
    }

    let questionsCount = 5;
    let secondsLimit: number | null = null;

    if (type === "daily") {
      questionsCount = 5;
      if (globalQuizTimeLimit) secondsLimit = 300; // 5 minutes
    } else if (type === "weekly") {
      questionsCount = 6;
      if (globalQuizTimeLimit) secondsLimit = 360; // 6 minutes
    } else {
      questionsCount = 50;
      if (globalQuizTimeLimit) secondsLimit = 3000; // 50 minutes
    }

    // Generate deterministic procedural questions based on topic and subject
    const generated = generateProceduralQuiz(entry.subject, entry.topic, questionsCount, dayNum);

    setActiveQuiz({
      day: dayNum,
      type: type,
      topic: entry.topic,
      subject: entry.subject,
      questions: generated,
      currentIdx: 0,
      userAnswers: {},
      timeLeft: secondsLimit,
      isSubmitted: false
    });
  };

  // Submit Active Quiz
  const handleQuizSubmit = () => {
    if (!activeQuiz) return;

    const { day, type, questions, userAnswers } = activeQuiz;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      if (userAns === undefined) {
        unattemptedCount++;
      } else if (userAns === q.answerIndex) {
        correctCount++;
      } else {
        incorrectCount++;
        // Automatically isolate failed concepts in the Weakness Vault
        const newWeakness: WeaknessEntry = {
          subject: activeQuiz.subject,
          topic: activeQuiz.topic,
          question: q.question,
          userAnswer: q.options[userAns],
          correctAnswer: q.options[q.answerIndex],
          explanation: q.explanation,
          dateFailed: new Date().toLocaleDateString()
        };
        // Avoid duplicate entries
        setWeaknessVault((prev) => {
          const duplicate = prev.some(w => w.question === q.question);
          if (duplicate) return prev;
          const updated = [...prev, newWeakness];
          handlePersist("rrb_weakness_vault", updated);
          return updated;
        });
      }
    });

    // Score according to official RRB JE: correct minus 1/3 penalty per wrong answer
    const netCorrect = correctCount - incorrectCount * (1/3);
    const finalPct = Math.max(0, parseFloat(((netCorrect / questions.length) * 100).toFixed(1)));

    // Mark completed in main day entries list if daily
    if (type === "daily") {
      const updatedDays = dayEntries.map((d) => {
        if (d.day === day) {
          return {
            ...d,
            quizCompleted: true,
            quizScore: finalPct
          };
        }
        return d;
      });
      setDayEntries(updatedDays);
      handlePersist("rrb_day_entries", updatedDays);
    }

    // Save attempt globally
    const newAttempt: QuizAttempt = {
      day: day,
      type: type,
      score: correctCount,
      total: questions.length,
      earnedPoints: netCorrect
    };
    const updatedAttempts = [...quizAttempts, newAttempt];
    setQuizAttempts(updatedAttempts);
    handlePersist("rrb_quiz_attempts", updatedAttempts);

    // Set quiz as submitted to render results layout
    setActiveQuiz((prev) => prev ? { ...prev, isSubmitted: true } : null);
  };

  // Custom Playlists URL log
  const savePlaylistUrl = (subj: SubjectKeys, url: string) => {
    const updated = {
      ...playlists,
      [subj]: url
    };
    setPlaylists(updated);
    handlePersist("rrb_playlists", updated);
    alert(`Resource URL saved for ${subj}! Links mapped securely.`);
  };

  // Delete all weakness tags
  const clearWeakness = (idxToDelete: number) => {
    const updated = weaknessVault.filter((_, idx) => idx !== idxToDelete);
    setWeaknessVault(updated);
    handlePersist("rrb_weakness_vault", updated);
  };

  // Lookup topic shortcut in offline revision cheat-sheets engine
  const askAIShortcut = (topic: string, subject: string) => {
    setRevisionSearchQuery(topic);
    setSelectedFilterSubject("All");
    setActiveTab(2); // toggle local search tab
  };

  // Slice paginated day index
  const paginatedDays = useMemo(() => {
    const startIdx = (currentPage - 1) * 20;
    const endIdx = currentPage * 20;
    return dayEntries.slice(startIdx, endIdx);
  }, [dayEntries, currentPage]);

  // Memoized search results scanning study blueprint and local studyVault contents
  const searchResults = useMemo(() => {
    const rawQuery = revisionSearchQuery.trim().toLowerCase();
    const list: Array<{
      topic: string;
      subject: string;
      dayNum: number | null;
      notes: string;
      formulas: string;
      shortcuts: string;
      hasSavedContent: boolean;
    }> = [];

    // 1. Gather all topics from hardcoded syllabus blueprint
    Object.entries(syllabus_blueprint).forEach(([subject, topics]) => {
      topics.forEach((topic) => {
        const scheduledDayObj = dayEntries.find((d) => d.topic === topic);
        const dayNum = scheduledDayObj ? scheduledDayObj.day : null;
        const vault = dayNum ? studyVault[dayNum] : null;
        
        const notes = vault?.personalNotes || "";
        const formulas = vault?.formulas || "";
        const shortcuts = vault?.speedShortcuts || "";
        const hasSavedContent = !!(notes.trim() || formulas.trim() || shortcuts.trim());

        list.push({
          topic,
          subject,
          dayNum,
          notes,
          formulas,
          shortcuts,
          hasSavedContent,
        });
      });
    });

    // 2. Also append other custom topics logged by users in dayEntries that might not match standard syllabus
    dayEntries.forEach((dayUnit) => {
      if (dayUnit.topic && dayUnit.topic.trim()) {
        const alreadyAdded = list.some(item => item.topic.toLowerCase() === dayUnit.topic.toLowerCase());
        if (!alreadyAdded) {
          const vault = studyVault[dayUnit.day];
          const notes = vault?.personalNotes || "";
          const formulas = vault?.formulas || "";
          const shortcuts = vault?.speedShortcuts || "";
          const hasSavedContent = !!(notes.trim() || formulas.trim() || shortcuts.trim());

          list.push({
            topic: dayUnit.topic,
            subject: dayUnit.subject || "General Study",
            dayNum: dayUnit.day,
            notes,
            formulas,
            shortcuts,
            hasSavedContent,
          });
        }
      }
    });

    // 3. Filter by Subject Category first if applicable
    let filtered = list;
    if (selectedFilterSubject !== "All") {
      filtered = list.filter((item) => {
        const sNorm = item.subject.toLowerCase();
        const fNorm = selectedFilterSubject.toLowerCase();
        return sNorm.includes(fNorm) || fNorm.includes(sNorm);
      });
    }

    // 4. Apply search match filter query
    if (rawQuery) {
      filtered = filtered.filter((item) => {
        return (
          item.topic.toLowerCase().includes(rawQuery) ||
          item.subject.toLowerCase().includes(rawQuery) ||
          item.notes.toLowerCase().includes(rawQuery) ||
          item.formulas.toLowerCase().includes(rawQuery) ||
          item.shortcuts.toLowerCase().includes(rawQuery)
        );
      });
    }

    return filtered;
  }, [revisionSearchQuery, selectedFilterSubject, dayEntries, studyVault]);

  return (
    <div className="min-h-screen w-full bg-black text-gray-100 flex flex-col p-2 md:p-4 select-none font-sans overflow-x-hidden" id="focus-wave-glow">
      
      {/* Network bottleneck safe-fail warning banner */}
      {showBackupAlert && (
        <div className="bg-red-950 border-2 border-red-500 p-3 mb-3 rounded-lg flex flex-col md:flex-row items-center justify-between gap-3 text-red-100 text-xs shadow-lg glow-blue animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <span className="font-extrabold uppercase">Local Storage bottleneck detected.</span> Data fails to save smoothly in browser cache. Please download a rescue backup file to prevent losing your study milestones.
            </div>
          </div>
          <button 
            onClick={() => {
              exportProgress();
              setLocalEmergencyBackupPressed(true);
            }}
            className="bg-white hover:bg-gray-200 text-black px-4 py-1.5 rounded font-black uppercase text-[10px]"
          >
            Emergency Backup Export
          </button>
        </div>
      )}

      {/* GLOBAL HEADER HEADER */}
      {!focusMode && (
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00E5FF] rounded-lg flex items-center justify-center font-black text-black text-base shadow-md shadow-cyan-900/30">
              JE
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase flex items-center gap-2 text-white">
                Road to RRB JE <span className="text-[#00E5FF] font-mono">(CBT-1)</span>
              </h1>
              <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
                Syllabus Version 4.0 // Production Ready // Non-Technical Focus Only
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 xl:gap-6 bg-zinc-950 p-2 md:p-3 rounded-xl border border-zinc-900">
            {/* Total Syllabus Progress Bar Widget */}
            <div className="flex flex-col w-44 md:w-56">
              <div className="flex justify-between w-full mb-1">
                <span className="text-[10px] text-zinc-400 font-black tracking-wider">TOTAL COMPLETED</span>
                <span className="text-[10px] text-[#00E5FF] font-black">{metrics.finishedPct}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="bg-[#00E5FF] h-full transition-all duration-300"
                  style={{ width: `${metrics.finishedPct}%` }}
                ></div>
              </div>
            </div>

            {/* Backups Panel */}
            <div className="flex flex-wrap gap-2 items-center">
              <button 
                onClick={exportProgress}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-[#00E5FF] hover:text-black border border-zinc-800 hover:border-[#00E5FF] text-[10px] font-black rounded transition-all flex items-center gap-1 uppercase"
              >
                <Download className="w-3 h-3" />
                Export Progress
              </button>
              
              <label className="px-3 py-1.5 bg-zinc-900 hover:bg-[#00E5FF] hover:text-black border border-zinc-800 hover:border-[#00E5FF] text-[10px] font-black rounded transition-all cursor-pointer flex items-center gap-1 uppercase">
                <Upload className="w-3 h-3" />
                Import Progress
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={importProgress} 
                  className="hidden" 
                />
              </label>

              {/* Focus Mode button */}
              <button 
                onClick={() => setFocusMode(true)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-red-500 hover:text-white border border-zinc-800 hover:border-red-500 text-[10px] font-black rounded transition-all flex items-center gap-1 uppercase text-[#00E5FF]"
              >
                <Zap className="w-3 h-3 text-[#00E5FF]" />
                Focus Mode Timer
              </button>
            </div>
          </div>
        </header>
      )}

      {/* CORE FRAMEWORK WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-[500px]">
        
        {/* SIDEBAR NAVIGATION (Desktop side selection panel or mobile-responsive bottom tabs) */}
        {!focusMode && (
          <nav className="lg:w-20 lg:flex lg:flex-col gap-3 items-center py-4 bg-zinc-950 rounded-2xl border border-zinc-900 justify-start h-auto lg:h-full hidden">
            <button 
              onClick={() => setActiveTab(0)}
              className={`p-3.5 rounded-xl transition-all relative ${activeTab === 0 ? 'bg-[#00E5FF] text-black shadow-lg shadow-cyan-950/40' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100'}`}
              title="Study Batch"
            >
              <Layers className="w-6 h-6" />
              {metrics.selectedDaysCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono font-bold text-[8px] px-1 rounded-full">
                  {metrics.selectedDaysCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab(1)}
              className={`p-3.5 rounded-xl transition-all ${activeTab === 1 ? 'bg-[#00E5FF] text-black shadow-lg shadow-cyan-950/40' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100'}`}
              title="YouTube Playlists"
            >
              <Compass className="w-6 h-6" />
            </button>

            <button 
              onClick={() => setActiveTab(2)}
              className={`p-3.5 rounded-xl transition-all ${activeTab === 2 ? 'bg-[#00E5FF] text-black shadow-lg shadow-cyan-950/40' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100'}`}
              title="Revision & Cheat-Sheets"
            >
              <Search className="w-6 h-6" />
            </button>

            <button 
              onClick={() => setActiveTab(3)}
              className={`p-3.5 rounded-xl transition-all ${activeTab === 3 ? 'bg-[#00E5FF] text-black shadow-lg shadow-cyan-950/40' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100'}`}
              title="Study Vault"
            >
              <BookOpen className="w-6 h-6" />
            </button>

            <button 
              onClick={() => setActiveTab(4)}
              className={`p-3.5 rounded-xl transition-all relative ${activeTab === 4 ? 'bg-[#00E5FF] text-black shadow-lg shadow-cyan-950/40' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100'}`}
              title="Revision & Tests"
            >
              <Award className="w-6 h-6" />
              {weaknessVault.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono font-bold text-[9px] px-1.5 rounded-full">
                  {weaknessVault.length}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* CONTAINER FOR MAIN DATA PANELS */}
        <main className="flex-1 flex flex-col gap-4 overflow-hidden">
          
          {/* FOCUS MODE VIEW */}
          {focusMode ? (
            <div className={`flex-1 rounded-2xl p-6 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500 border ${
              pomodoroMode === "rest" 
                ? "bg-emerald-950/30 border-emerald-500/80 shadow-lg shadow-emerald-950/50 glow-green" 
                : "bg-zinc-950 border-zinc-900"
            }`}>
              <div className="absolute top-4 right-4 animate-fade-in">
                <button 
                  onClick={() => setFocusMode(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 hover:text-white transition"
                >
                  <Minimize2 className="w-4 h-4" />
                  Exit Focus Mode
                </button>
              </div>

              <div className="mb-6 max-w-xl">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                  pomodoroMode === "focus" 
                    ? "bg-cyan-950 text-[#00E5FF] border-cyan-800" 
                    : "bg-emerald-950 text-emerald-400 border-emerald-800"
                }`}>
                  {pomodoroMode === "focus" ? "⚡ FOCUS CONCENTRATION" : "🌴 REST INTERVAL ACTIVE"}
                </span>
                
                <h2 className="text-3xl font-black text-white uppercase mt-4 mb-2 tracking-tight">
                  Single-Tasking Zone
                </h2>
                <p className="text-xs text-zinc-400">
                  Focus purely on the current task. All navigation, dashboards, and stats panels are temporarily hidden to clear mental bandwidth. Work with the ticking countdown clock.
                </p>
              </div>

              {/* Dynamic State Banner */}
              <div className="mb-6 z-10">
                {pomodoroMode === "focus" ? (
                  <div className="flex flex-col items-center gap-1 animate-pulse">
                    <span className="text-2xl md:text-3xl font-black tracking-widest text-[#00E5FF] font-mono">
                      FOCUSING
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono tracking-wide uppercase">
                      Commit mind fully to the active curriculum block
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 animate-pulse">
                    <span className="text-2xl md:text-3xl font-black tracking-widest text-emerald-400 font-mono">
                      BREAK TIME
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono tracking-wide uppercase">
                      Relax and breathe. Rest count matches your rest template setting.
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive target day details selector */}
              <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl max-w-md w-full mb-6 flex flex-col md:flex-row items-center justify-between gap-3 text-left">
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    Target Day Session
                  </span>
                  <div className="text-xs font-black text-white mt-1 uppercase flex flex-col">
                    <span className="truncate max-w-[260px]">Day {activeFocusDay}: {dayEntries[activeFocusDay - 1]?.topic || "Unscheduled Topic"}</span>
                    {dayEntries[activeFocusDay - 1]?.focusCompleted && (
                      <span className="text-amber-400 text-[10px] mt-0.5 flex items-center gap-1 font-bold">
                        ★ Focus Completion Badge Unlocked
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    type="button"
                    onClick={() => {
                      const newDay = Math.max(1, activeFocusDay - 1);
                      setActiveFocusDay(newDay);
                      localStorage.setItem("rrb_active_focus_day", String(newDay));
                    }}
                    className="p-1.5 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded font-bold text-[10px] text-zinc-300 transition-all active:scale-95 text-center uppercase font-mono"
                  >
                    Prev Day
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const newDay = Math.min(400, activeFocusDay + 1);
                      setActiveFocusDay(newDay);
                      localStorage.setItem("rrb_active_focus_day", String(newDay));
                    }}
                    className="p-1.5 px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded font-bold text-[10px] text-zinc-300 transition-all active:scale-95 text-center uppercase font-mono"
                  >
                    Next Day
                  </button>
                </div>
              </div>

              {/* Customizable Pomodoro Timer Configuration Row */}
              <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl max-w-md w-full mb-6 flex flex-col gap-3">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest font-mono text-center">
                  ⚙️ Customizable Session Configuration
                </span>
                <div className="grid grid-cols-2 gap-4">
                  {/* Focus Time Control */}
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] font-black uppercase text-[#00E5FF] tracking-wider font-mono">
                      [Focus Time]
                    </label>
                    <div className="flex items-center bg-black border border-zinc-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => changeCustomFocusMinutes(customFocusMinutes - 1)}
                        className="w-8 h-8 flex items-center justify-center text-xs font-black text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
                        disabled={pomodoroActive}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="240"
                        value={customFocusMinutes}
                        onChange={(e) => changeCustomFocusMinutes(parseInt(e.target.value) || 25)}
                        disabled={pomodoroActive}
                        className="w-full text-center bg-transparent border-0 text-white font-black text-sm p-1 focus:ring-0 focus:outline-none focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => changeCustomFocusMinutes(customFocusMinutes + 1)}
                        className="w-8 h-8 flex items-center justify-center text-xs font-black text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
                        disabled={pomodoroActive}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Rest Time Control */}
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] font-black uppercase text-emerald-400 tracking-wider font-mono">
                      [Rest Time]
                    </label>
                    <div className="flex items-center bg-black border border-zinc-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => changeCustomRestMinutes(customRestMinutes - 1)}
                        className="w-8 h-8 flex items-center justify-center text-xs font-black text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
                        disabled={pomodoroActive}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={customRestMinutes}
                        onChange={(e) => changeCustomRestMinutes(parseInt(e.target.value) || 5)}
                        disabled={pomodoroActive}
                        className="w-full text-center bg-transparent border-0 text-white font-black text-sm p-1 focus:ring-0 focus:outline-none focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => changeCustomRestMinutes(customRestMinutes + 1)}
                        className="w-8 h-8 flex items-center justify-center text-xs font-black text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
                        disabled={pomodoroActive}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                {pomodoroActive && (
                  <p className="text-[9px] text-[#00E5FF]/80 font-mono text-center mt-1 uppercase tracking-wider animate-pulse">
                     Configuration Locked While Timer Runs
                  </p>
                )}
              </div>

              {/* Big clock timer */}
              <div className="relative flex items-center justify-center mb-8">
                <div className={`w-64 h-64 rounded-full border-4 border-dashed flex flex-col justify-center items-center scale-up bg-black transition-all duration-300 ${
                  pomodoroMode === "rest" 
                    ? "border-emerald-500/80 glow-green shadow-lg shadow-emerald-500/10" 
                    : "border-[#00E5FF]/60 glow-blue shadow-lg shadow-[#00E5FF]/10"
                }`}>
                  <span className="text-6xl font-black font-mono text-white tracking-widest">
                    {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
                  </span>
                  <span className={`text-[10px] font-bold uppercase mt-2 tracking-widest ${
                    pomodoroMode === "rest" ? "text-emerald-400" : "text-zinc-500"
                  }`}>
                    {pomodoroMode === "rest" ? "🧘 ACTIVE BREAK" : "⚡ TOTAL CONCENTRATION"}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 z-10">
                <button 
                  onClick={() => setPomodoroActive(!pomodoroActive)}
                  className={`px-8 py-3.5 rounded-xl font-black text-sm uppercase transition-all flex items-center gap-2 ${
                    pomodoroActive 
                      ? 'bg-amber-500 text-black hover:bg-amber-400' 
                      : pomodoroMode === 'rest' 
                        ? 'bg-emerald-400 text-black hover:bg-emerald-300' 
                        : 'bg-[#00E5FF] text-black hover:bg-cyan-400'
                  }`}
                >
                  {pomodoroActive ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      Pause Timer
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      {pomodoroMode === "focus" ? "Start Focus Session" : "Start Rest Session"}
                    </>
                  )}
                </button>

                <button 
                  onClick={() => {
                    setPomodoroActive(false);
                    setPomodoroMinutes(pomodoroMode === "focus" ? customFocusMinutes : customRestMinutes);
                    setPomodoroSeconds(0);
                  }}
                  className="p-3.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all"
                  title={`Reset timer to config (${pomodoroMode === "focus" ? customFocusMinutes : customRestMinutes}m)`}
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Guided dynamic breathing assistant */}
              <div className="mt-12 text-zinc-500 text-xs flex items-center justify-center gap-2 animate-pulse">
                <div className={`w-2.5 h-2.5 rounded-full ${pomodoroMode === "rest" ? "bg-emerald-500" : "bg-cyan-500"}`}></div>
                <span>Inhale deeply as the circular container expands. Exhale slowly. Badges auto-credited when time reaches 00:00.</span>
              </div>
            </div>
          ) : (
            <>
              {/* COMPACT ANALYTICS PANEL (Row structure) */}
              <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-stretch">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      400-Day Consistency Heatmap Grid
                    </span>
                    <span className="text-[10px] text-[#00E5FF] font-black uppercase flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 inline text-amber-500 animate-pulse" />
                      STREAK: {metrics.streak} DAYS UNLOCKED
                    </span>
                  </div>

                  {/* High Density Consistency heatmap matrix (10 rows x 40 elements) */}
                  <div className="bg-black/40 p-2.5 rounded-xl border border-zinc-900">
                    <div className="grid grid-flow-col grid-rows-10 gap-1 overflow-x-auto no-scrollbar max-h-56">
                      {dayEntries.map((day) => {
                        const isLogged = day.topic !== "";
                        const isQuizDone = day.quizCompleted;
                        let bgColor = "bg-zinc-900 border border-zinc-800/60";
                        let titleText = `Day ${day.day}: Unscheduled`;
                        if (isLogged && isQuizDone) {
                          bgColor = "bg-emerald-500 shadow-sm shadow-emerald-500/20";
                          titleText = `Day ${day.day}: ${day.topic} [PASSED]`;
                        } else if (isLogged) {
                          bgColor = "bg-cyan-950/60 border border-cyan-800";
                          titleText = `Day ${day.day}: ${day.topic} [QUIZ PENDING]`;
                        }
                        
                        return (
                          <div 
                            key={day.day}
                            className={`w-2.5 h-2.5 rounded-sm transition-all cursor-crosshair ${bgColor}`}
                            title={titleText}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="w-px bg-zinc-900 hidden md:block"></div>

                {/* Vertical numerical metrics */}
                <div className="flex flex-row md:flex-col justify-around gap-2 md:min-w-[200px]">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase block tracking-widest">
                      FOCUS DURATION RECORD
                    </span>
                    <span className="text-2xl font-black text-white flex items-baseline gap-1 font-mono">
                      {metrics.focusHours}
                      <span className="text-[10px] text-[#00E5FF] font-bold">HOURS LOGGED</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase block tracking-widest">
                      ACCURACY VELOCITY
                    </span>
                    <span className="text-2xl font-black text-white flex items-baseline gap-1 font-mono">
                      {metrics.accuracy}%
                      <span className="text-[10px] text-emerald-500 font-bold">AVERAGE</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ----------------- TAB 1: MY STUDY BATCH ----------------- */}
              <div className={`flex-1 flex-col overflow-hidden ${activeTab === 0 ? 'flex' : 'hidden'}`}>
                <div className="bg-white text-black rounded-2xl flex-1 flex flex-col overflow-hidden shadow-xl">
                  
                  {/* Tab header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 shrink-0">
                    <div>
                      <h2 className="text-black font-black uppercase text-sm tracking-tight flex items-center gap-1.5">
                        Day Tracker Timelines
                        <span className="text-gray-400 font-mono font-medium text-xs">
                          // Page {currentPage} of 20
                        </span>
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-bold hidden md:inline">
                        Render: {currentPage * 20 - 19}-{currentPage * 20} of 400 Days
                      </span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <ChevronLeft className="w-4 h-4 text-black" />
                        </button>
                        <button 
                          onClick={() => setCurrentPage(prev => Math.min(20, prev + 1))}
                          disabled={currentPage === 20}
                          className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Days Table List */}
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-[10px] text-gray-500 font-black uppercase tracking-widest text-left border-b border-gray-200 shrink-0">
                          <th className="p-3.5 pl-6">Timeline</th>
                          <th className="p-3.5">Study Topic Selection (Interactive Selector Zone)</th>
                          <th className="p-3.5">Categorization</th>
                          <th className="p-3.5">Date Logged</th>
                          <th className="p-3.5 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-black font-medium text-xs">
                        {paginatedDays.map((day) => {
                          const hasTopicObj = day.topic !== "";
                          return (
                            <tr 
                              key={day.day} 
                              className={`border-b border-gray-100/80 hover:bg-zinc-50 transition-colors ${day.quizCompleted ? 'bg-emerald-50/40 font-semibold' : ''}`}
                            >
                              <td className="p-3.5 pl-6 font-black text-gray-400 tracking-wider">
                                DAY {String(day.day).padStart(2, '0')}
                              </td>
                              
                              <td className="p-3.5">
                                {hasTopicObj ? (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between group">
                                      <span className="text-black font-bold text-sm tracking-tight">
                                        {day.topic}
                                      </span>
                                      <button 
                                        onClick={() => {
                                          // Simple reset wrapper
                                          const reset = dayEntries.map(d => d.day === day.day ? { ...d, topic: "", subject: "", dateLogged: "", quizCompleted: false, focusCompleted: false } : d);
                                          setDayEntries(reset);
                                          handlePersist("rrb_day_entries", reset);
                                        }}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                                        title="Clear entry"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    {day.focusCompleted && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit uppercase font-mono shadow-sm animate-pulse">
                                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                        Focus Badge Unlocked
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div 
                                    onClick={() => {
                                      setActiveDayForTopicSelection(day.day);
                                      setSelectionModalStage(1);
                                    }}
                                    className="px-3 py-1.5 border-2 border-dashed border-[#00E5FF] bg-cyan-50/50 text-[#00E5FF] font-black text-[11px] rounded hover:bg-cyan-100/40 text-center cursor-pointer transition-all uppercase tracking-wide"
                                  >
                                    + SELECT SYLLABUS TOPIC (No Typing)
                                  </div>
                                )}
                              </td>

                              <td className="p-3.5 uppercase font-black font-mono text-[9px]">
                                {day.subject ? (
                                  <span className={`px-2 py-0.5 rounded text-white ${day.subject === 'Mathematics' ? 'bg-blue-600' : day.subject === 'General Science' ? 'bg-purple-600' : day.subject === 'General Intelligence & Reasoning' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                                    {day.subject.replace("General Intelligence & ", "")}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">---</span>
                                )}
                              </td>

                              <td className="p-3.5 font-mono text-[10px] text-gray-400">
                                {day.dateLogged || <span className="italic text-gray-300">PENDING...</span>}
                              </td>

                              <td className="p-3.5 pr-6 text-right">
                                {hasTopicObj ? (
                                  <div className="flex justify-end gap-2 items-center text-left">
                                    {/* Direct Focus Launch */}
                                    <button 
                                      onClick={() => {
                                        setActiveFocusDay(day.day);
                                        localStorage.setItem("rrb_active_focus_day", String(day.day));
                                        setPomodoroMinutes(customFocusMinutes);
                                        setPomodoroSeconds(0);
                                        setPomodoroMode("focus");
                                        setFocusMode(true);
                                      }}
                                      className="p-1 px-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-700 hover:text-amber-850 rounded flex items-center gap-1 transition-all"
                                      title="Launch Focus Session for this Day"
                                    >
                                      <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                                      <span className="text-[9px] font-black uppercase font-mono">Focus</span>
                                    </button>

                                    <button 
                                      onClick={() => launchProceduralQuiz(day.day, "daily")}
                                      className={`text-[10px] font-black px-2.5 py-1 rounded border uppercase tracking-wider transition ${day.quizCompleted ? 'text-emerald-700 border-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-blue-600 border-blue-500 bg-blue-50 hover:bg-blue-100'}`}
                                    >
                                      {day.quizCompleted ? `Passed (${day.quizScore || 100}%)` : "Take Daily Quiz"}
                                    </button>

                                    {/* Notebook shortcut */}
                                    <button 
                                      onClick={() => {
                                        setActiveDayForVaultEdit(day.day);
                                        const existing = studyVault[day.day];
                                        setTempNotes(existing?.personalNotes || "");
                                        setTempFormulas(existing?.formulas || "");
                                        setTempShortcuts(existing?.speedShortcuts || "");
                                      }}
                                      className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded"
                                      title="Edit Notes & Shortcuts"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-black text-gray-300 uppercase select-none">
                                    Quiz Locked
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Interactive timeline details */}
                  <div className="p-4 bg-gray-100 border-t border-gray-200 block text-black text-xs font-mono shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                      <span className="text-[10px] font-black text-gray-500">
                        * Weekly 6-Question Quiz triggers automatically on every 7th day milestones.
                      </span>
                      <span className="text-[10px] font-extrabold text-[#00E5FF] bg-black px-2.5 py-1 rounded uppercase">
                        Syllabus tracker completes up to day 400
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------- TAB 2: MY CUSTOM PLAYLISTS ----------------- */}
              <div className={`flex-1 flex-col overflow-hidden ${activeTab === 1 ? 'flex' : 'hidden'}`}>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 overflow-y-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-white uppercase flex items-center gap-2">
                      <Compass className="w-6 h-6 text-[#00E5FF]" />
                      My Custom Playlists / Lecture Library
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                      Save custom lecture paths or stream playlists for each CBT-1 Core Pillar. Resources persist locally in your browser cache to construct a personalized lecture environment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subjectsArray.map((subj) => {
                      const savedUrl = playlists[subj] || "";
                      const isYoutube = savedUrl.includes("youtube.com") || savedUrl.includes("youtu.be");
                      let embedId = "";
                      if (isYoutube) {
                        try {
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                          const match = savedUrl.match(regExp);
                          if (match && match[2].length === 11) {
                            embedId = match[2];
                          }
                        } catch (e) {}
                      }

                      return (
                        <div key={subj} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                          <div>
                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black font-mono text-white ${subj === 'Mathematics' ? 'bg-blue-600' : subj === 'General Science' ? 'bg-purple-600' : subj === 'General Intelligence & Reasoning' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                              {subj.replace("General Intelligence & ", "")}
                            </span>
                            <h3 className="text-base font-extrabold text-white uppercase mt-2 mb-4 tracking-tight">
                              Core pillar: {subj}
                            </h3>

                            {/* Saved visual preview state */}
                            {savedUrl ? (
                              <div className="mb-4">
                                {embedId ? (
                                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 mb-2">
                                    <iframe 
                                      className="w-full h-full"
                                      src={`https://www.youtube.com/embed/${embedId}`}
                                      title={subj}
                                      allowFullScreen
                                    ></iframe>
                                  </div>
                                ) : (
                                  <div className="p-3 bg-zinc-950 text-xs rounded border border-zinc-800 text-zinc-300 break-all mb-2 flex items-center justify-between gap-1">
                                    <span className="truncate">{savedUrl}</span>
                                    <a href={savedUrl} target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] hover:underline shrink-0 flex items-center gap-0.5">
                                      Visit <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-8 mb-4 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-opacity-30 hover:bg-opacity-65 hover:border-zinc-700 hover-subtle-bounce">
                                <span className="text-xs text-zinc-600 uppercase font-bold">No playlist saved yet</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-400 font-bold block mb-1">
                              Paste YouTube Playlist/Video URL Here
                            </span>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="https://www.youtube.com/watch?v=..."
                                defaultValue={savedUrl}
                                id={`input-playlist-${subj}`}
                                className="bg-black border border-zinc-800 hover:border-zinc-700 text-xs text-white placeholder-zinc-700 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-[#00E5FF]"
                              />
                              <button 
                                onClick={() => {
                                  const el = document.getElementById(`input-playlist-${subj}`) as HTMLInputElement;
                                  if (el) {
                                    savePlaylistUrl(subj, el.value.trim());
                                  }
                                }}
                                className="bg-[#00E5FF] hover:bg-cyan-400 text-black text-xs font-black px-4 py-2 rounded-lg transition uppercase flex items-center gap-1 shrink-0"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ----------------- TAB 3: LOCAL REVISION & CHEAT-SHEET ENGINE ----------------- */}
              <div className={`flex-1 flex-col overflow-hidden ${activeTab === 2 ? 'flex' : 'hidden'}`}>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl flex-1 flex flex-col overflow-hidden p-6">
                  
                  {/* Revision section header banner */}
                  <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 shrink-0">
                    <div>
                      <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                        <Search className="w-5 h-5 text-[#00E5FF]" />
                        Offline Revision & Cheat-Sheet Engine
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Instantly query and review formulas, speed tactics, and core shortcuts saved within your Study Vault.
                      </p>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-center">
                      <div className="text-xs font-black text-[#00E5FF] font-mono uppercase">
                        {dayEntries.filter(d => studyVault[d.day] && (studyVault[d.day].personalNotes?.trim() || studyVault[d.day].formulas?.trim() || studyVault[d.day].speedShortcuts?.trim())).length} / 400 Days
                      </div>
                      <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
                        Notebooks Filled
                      </div>
                    </div>
                  </div>

                  {/* Search Bar and Filters Form */}
                  <div className="space-y-4 shrink-0 mb-5">
                    <div className="relative flex items-center">
                      <Search className="absolute left-4 w-4 h-4 text-zinc-500" />
                      <input 
                        type="text"
                        value={revisionSearchQuery}
                        onChange={(e) => setRevisionSearchQuery(e.target.value)}
                        placeholder="Search formulas or shortcuts instantly..."
                        className="w-full bg-black border border-zinc-800 focus:border-[#00E5FF] text-white placeholder-zinc-700 text-xs rounded-xl py-3.5 pl-11 pr-11 focus:outline-none transition-all"
                      />
                      {revisionSearchQuery && (
                        <button 
                          onClick={() => setRevisionSearchQuery("")}
                          className="absolute right-4 text-zinc-500 hover:text-white transition-all p-1"
                          title="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Subject Filter Pill Selectors */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wide mr-2">Filter Subjects:</span>
                      {["All", "Mathematics", "General Intelligence & Reasoning", "General Science", "General Awareness"].map((subjectName) => {
                        const isSelected = selectedFilterSubject === subjectName;
                        const labelText = subjectName === "General Intelligence & Reasoning" ? "Reasoning" : subjectName;
                        return (
                          <button
                            key={subjectName}
                            onClick={() => setSelectedFilterSubject(subjectName)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all ${
                              isSelected 
                                ? "bg-[#00E5FF] text-black border-[#00E5FF]" 
                                : "bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
                            }`}
                          >
                            {labelText}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search Results Display Area */}
                  <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px] pr-1">
                    {searchResults.length === 0 ? (
                      <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-xl text-center text-zinc-600 text-xs font-bold uppercase">
                        No matches found. Try refining your query.
                      </div>
                    ) : (
                      searchResults.map((item, idx) => {
                        // Color styling for different subjects
                        const subjectColors = {
                          "Mathematics": { text: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-950/20", labelBg: "bg-blue-600" },
                          "General Intelligence & Reasoning": { text: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-950/20", labelBg: "bg-amber-600" },
                          "General Science": { text: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-950/20", labelBg: "bg-purple-600" },
                          "General Awareness": { text: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-950/20", labelBg: "bg-emerald-600" },
                        };
                        const colors = subjectColors[item.subject as keyof typeof subjectColors] || { text: "text-zinc-400", border: "border-zinc-500/20", bg: "bg-zinc-950/20", labelBg: "bg-zinc-600" };

                        if (!item.hasSavedContent) {
                          // Fallback container card clicked toggles directly to Tab 4 (Study Vault) in edit state!
                          return (
                            <div 
                              key={`${item.topic}-${idx}`}
                              onClick={() => {
                                // Trigger automated scheduling & open notebook editor in Tab 4
                                let targetDayNum = item.dayNum;
                                if (!targetDayNum) {
                                  const firstEmptyDay = dayEntries.find(d => !d.topic);
                                  targetDayNum = firstEmptyDay ? firstEmptyDay.day : 1;

                                  const formattedDate = new Date().toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  }).toUpperCase().replace(/ /g, '-');

                                  const updatedDays = dayEntries.map((d) => {
                                    if (d.day === targetDayNum) {
                                      return {
                                        ...d,
                                        topic: item.topic,
                                        subject: item.subject,
                                        dateLogged: formattedDate
                                      };
                                    }
                                    return d;
                                  });

                                  setDayEntries(updatedDays);
                                  handlePersist("rrb_day_entries", updatedDays);
                                }

                                const existingNotes = studyVault[targetDayNum];
                                setTempNotes(existingNotes?.personalNotes || "");
                                setTempFormulas(existingNotes?.formulas || "");
                                setTempShortcuts(existingNotes?.speedShortcuts || "");
                                setActiveDayForVaultEdit(targetDayNum);
                                setActiveTab(3); // switch to Tab 4 MY STUDY VAULT
                              }}
                              className="p-5 border border-dashed border-zinc-800 hover:border-[#00E5FF]/40 bg-zinc-950/50 hover:bg-zinc-900/60 rounded-xl transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left group"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase text-white ${colors.labelBg}`}>
                                    {item.subject.replace("General Intelligence & ", "")}
                                  </span>
                                  {item.dayNum && (
                                    <span className="text-[10px] font-bold text-zinc-500 font-mono">DAY {item.dayNum}</span>
                                  )}
                                </div>
                                <h4 className="text-sm font-black text-zinc-400 group-hover:text-white transition mt-1 uppercase">
                                  {item.topic}
                                </h4>
                                <p className="text-xs text-zinc-500 mt-1">
                                  No local notes found for this topic. Tap here to jump to your Study Vault and add them.
                                </p>
                              </div>
                              <div className="shrink-0 flex items-center justify-center p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl group-hover:bg-[#00E5FF]/10 group-hover:border-[#00E5FF]/30 transition">
                                <Plus className="w-5 h-5 text-zinc-500 group-hover:text-[#00E5FF] transition" />
                              </div>
                            </div>
                          );
                        }

                        // Render highly polished local bento notes cards when the student actually filled this block of notes!
                        return (
                          <div 
                            key={`${item.topic}-${idx}`}
                            className={`p-5 border rounded-xl bg-zinc-900/75 flex flex-col gap-4 border-zinc-800/80`}
                          >
                            <div className="flex justify-between items-start gap-2 border-b border-zinc-800 pb-3">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase text-white ${colors.labelBg}`}>
                                    {item.subject.replace("General Intelligence & ", "")}
                                  </span>
                                  <span className="text-[10px] font-extrabold text-zinc-500 font-mono">
                                    DAY {String(item.dayNum).padStart(2, '0')}
                                  </span>
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-tight mt-1.5">
                                  {item.topic}
                                </h3>
                              </div>

                              <button 
                                onClick={() => {
                                  if (item.dayNum) {
                                    const existing = studyVault[item.dayNum];
                                    setTempNotes(existing?.personalNotes || "");
                                    setTempFormulas(existing?.formulas || "");
                                    setTempShortcuts(existing?.speedShortcuts || "");
                                    setActiveDayForVaultEdit(item.dayNum);
                                    setActiveTab(3); // switch to Tab 4 Study Vault
                                  }
                                }}
                                className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-[10px] text-[#00E5FF] rounded border border-zinc-800 hover:border-[#00E5FF]/30 font-black uppercase transition-all"
                              >
                                Edit Notebook
                              </button>
                            </div>

                            {/* Cards content inner bento-rows */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* 1. Concepts & Notes */}
                              <div className="bg-black/40 border border-zinc-900 rounded-lg p-3">
                                <h5 className="text-[9px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1 mb-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                                  Core Concepts & Notes
                                </h5>
                                {item.notes ? (
                                  <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">{item.notes}</p>
                                ) : (
                                  <span className="text-[10px] italic text-zinc-600 block pt-1">No notes added. Click edit to add.</span>
                                )}
                              </div>

                              {/* 2. Key Formulas */}
                              <div className="bg-black/40 border border-zinc-900 rounded-lg p-3">
                                <h5 className="text-[9px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1 mb-1.5">
                                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                                  Key Formulas
                                </h5>
                                {item.formulas ? (
                                  <p className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">{item.formulas}</p>
                                ) : (
                                  <span className="text-[10px] italic text-zinc-600 block pt-1">No formulas added. Click edit to add.</span>
                                )}
                              </div>

                              {/* 3. Speed Tactics & Shortcuts */}
                              <div className="bg-black/40 border border-zinc-900 rounded-lg p-3">
                                <h5 className="text-[9px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1 mb-1.5">
                                  <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                  Speed Shortcuts
                                </h5>
                                {item.shortcuts ? (
                                  <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">{item.shortcuts}</p>
                                ) : (
                                  <span className="text-[10px] italic text-zinc-600 block pt-1">No shortcut tactics added. Click edit to add.</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* ----------------- TAB 4: MY STUDY VAULT ----------------- */}
              <div className={`flex-1 flex-col overflow-hidden ${activeTab === 3 ? 'flex' : 'hidden'}`}>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 overflow-y-auto flex-1 flex flex-col">
                  
                  {/* Spaced review banner block */}
                  <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 shrink-0">
                    <div>
                      <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                        <BookMarked className="w-5 h-5 text-[#00E5FF]" />
                        Spaced Repetition & Notebook Desk
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Review your conceptual formulas, speed tactics and log cards with standard Leitner Spacing cards.
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        if (flashcards.length === 0) {
                          alert("Convert your study topic logs into flashcards first (use the notebook edit page on logged days!).");
                          return;
                        }
                        setActiveLeitnerReview(true);
                        setCurrentFlashcardIndex(0);
                        setIsFlashcardFlipped(false);
                      }}
                      className="px-5 py-2.5 bg-[#00E5FF] hover:bg-cyan-400 text-black text-xs font-black uppercase rounded-lg transition flex items-center gap-1.5 self-stretch md:self-auto text-center justify-center"
                    >
                      <Brain className="w-4 h-4 inline" />
                      Study Active Flashcards ({flashcards.length} Cards)
                    </button>
                  </div>

                  {/* Notebook Day Listing Rows */}
                  <div className="flex-1 overflow-y-auto min-h-[250px]">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">
                        Your Logged Days Notebooks
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Day 1 - Day 400
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {dayEntries.filter(d => d.topic !== "").length === 0 ? (
                        <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-xl text-center text-zinc-600 text-xs font-bold uppercase">
                          No logged study topics yet. Choose topics on Tab 1 first to unlock notebooks.
                        </div>
                      ) : (
                        dayEntries.filter(d => d.topic !== "").map((day) => {
                          const userVault = studyVault[day.day];
                          const hasContent = userVault && (userVault.personalNotes || userVault.formulas || userVault.speedShortcuts);
                          return (
                            <div 
                              key={day.day}
                              className="bg-zinc-900/80 border border-zinc-800/80 hover:border-[#00E5FF]/40 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-zinc-500 font-mono uppercase">
                                    DAY {String(day.day).padStart(2, '0')}
                                  </span>
                                  <span className={`text-[8px] font-black px-1.5 rounded uppercase text-white ${day.subject === 'Mathematics' ? 'bg-blue-600' : day.subject === 'General Science' ? 'bg-purple-600' : day.subject === 'General Intelligence & Reasoning' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                                    {day.subject?.replace("General Intelligence & ", "")}
                                  </span>
                                </div>
                                <h4 className="text-sm font-extrabold text-white uppercase mt-1 tracking-tight">
                                  {day.topic}
                                </h4>
                                <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                                  {hasContent ? "✓ Notebook contains written cards" : "✎ No conceptual cards written yet"}
                                </p>
                              </div>

                              <div className="flex gap-2 w-full sm:w-auto">
                                <button 
                                  onClick={() => {
                                    setActiveDayForVaultEdit(day.day);
                                    const existing = studyVault[day.day];
                                    setTempNotes(existing?.personalNotes || "");
                                    setTempFormulas(existing?.formulas || "");
                                    setTempShortcuts(existing?.speedShortcuts || "");
                                  }}
                                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 rounded border border-zinc-800 hover:border-zinc-700 font-black uppercase text-center flex-1 sm:flex-none"
                                >
                                  Open Notebook
                                </button>

                                <button 
                                  onClick={() => convertToFlashcard(day.day, day.topic)}
                                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-[#00E5FF] text-xs font-black uppercase rounded border border-cyan-800/60 text-center flex-1 sm:flex-none"
                                >
                                  Make Flashcard
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------- TAB 5: REVISION TEST SERIES ----------------- */}
              <div className={`flex-1 flex-col overflow-hidden ${activeTab === 4 ? 'flex' : 'hidden'}`}>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 overflow-y-auto flex-1 flex flex-col">
                  
                  <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase flex items-center gap-2">
                        <Award className="w-6 h-6 text-[#00E5FF]" />
                        CBT-1 Non-Technical Revision Test Series
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Test your speed under official 1/3 negative marking guidelines. Track procedural generated grand MCQs and revise failed concepts in the Weakness Vault.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        Clock Penalty Option:
                      </span>
                      <button 
                        onClick={() => setGlobalQuizTimeLimit(!globalQuizTimeLimit)}
                        className={`text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-widest transition-all ${globalQuizTimeLimit ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-zinc-800 text-zinc-300'}`}
                      >
                        {globalQuizTimeLimit ? "Timed Mode (ON)" : "Normal Mode (Unlimited)"}
                      </button>
                    </div>
                  </div>

                  {/* Multi-layer milestone unlocking tracker */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 shrink-0">
                    <div className="bg-zinc-900 border border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-cyan-950 text-[#00E5FF] border border-cyan-900 rounded text-[9px] font-black font-mono uppercase tracking-widest">
                          Layer 2 Milestone
                        </span>
                        <h4 className="text-base font-extrabold text-white mt-2 mb-1.5 uppercase">
                          Weekly Reviews (6 Questions)
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                          Comprehensive review questions automatically unlocked every 7th day (Day 7, 14, 21, etc.) reviewing topics mastered across preceding 6 days.
                        </p>
                      </div>

                      <div>
                        {/* List available unlocks */}
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg max-h-32 overflow-y-auto space-y-1 text-xs">
                          {Array.from({ length: 57 }, (_, idx) => (idx + 1) * 7).map((d) => {
                            // Find if day has topic to unlock
                            const hasPreviousTopics = dayEntries.slice(Math.max(0, d - 7), d - 1).some(x => x.topic !== "");
                            return (
                              <div key={d} className="flex justify-between items-center text-[11px] p-1.5 border-b border-zinc-900/60">
                                <span className="font-extrabold text-zinc-400 uppercase">Milestone Day {d}</span>
                                {hasPreviousTopics ? (
                                  <button 
                                    onClick={() => launchProceduralQuiz(d, "weekly")}
                                    className="bg-[#00E5FF] hover:bg-cyan-400 text-black px-2 py-0.5 rounded text-[9px] font-black uppercase"
                                  >
                                    Review
                                  </button>
                                ) : (
                                  <span className="text-zinc-600 font-bold text-[9px] uppercase">Pre-requisite Locked</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-905 border border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-amber-950 text-amber-500 border border-amber-900 rounded text-[9px] font-black font-mono uppercase tracking-widest">
                          Layer 3 Grand PYQ Milestone
                        </span>
                        <h4 className="text-base font-extrabold text-white mt-2 mb-1.5 uppercase">
                          Monthly Grand PYQ Test (50 Questions)
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                          Comprehensive 50-question mock exam unlocking at Day 30, 60, 90, and subsequent 30-day blocks. Scans PYQ patterns over the whole monthly timeline.
                        </p>
                      </div>

                      <div>
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg max-h-32 overflow-y-auto space-y-1 text-xs">
                          {Array.from({ length: 13 }, (_, idx) => (idx + 1) * 30).map((d) => {
                            const hasPrevious30 = dayEntries.slice(Math.max(0, d - 30), d - 1).some(x => x.topic !== "");
                            return (
                              <div key={d} className="flex justify-between items-center text-[11px] p-1.5 border-b border-zinc-900/60">
                                <span className="font-extrabold text-zinc-400 uppercase">Grand Mock Block Day {d}</span>
                                {hasPrevious30 ? (
                                  <button 
                                    onClick={() => launchProceduralQuiz(d, "grand")}
                                    className="bg-amber-500 hover:bg-amber-400 text-black px-2.5 py-0.5 rounded text-[9px] font-black uppercase"
                                  >
                                    Take Grand Test
                                  </button>
                                ) : (
                                  <span className="text-zinc-600 font-bold text-[9px] uppercase">Pre-requisite Locked</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weakness Remediation Desk Block */}
                  <div className="flex-1 min-h-[250px] overflow-hidden flex flex-col">
                    <div className="p-3 bg-[#00E5FF]/10 rounded-xl border border-[#00E5FF]/20 flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-[#00E5FF]" />
                        <span className="text-sm font-black text-white uppercase tracking-tight">
                          Weakness Remediation Desk ({weaknessVault.length} Active failed questions)
                        </span>
                      </div>
                      
                      {weaknessVault.length > 0 && (
                        <button 
                          onClick={() => {
                            setWeaknessVault([]);
                            handlePersist("rrb_weakness_vault", []);
                          }}
                          className="text-[9px] font-black bg-red-950/40 hover:bg-red-900 text-red-400 px-3 py-1.5 rounded border border-red-900/50 uppercase"
                        >
                          Clear Desk Log
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 p-1 overflow-y-auto flex-1 bg-black/40 border border-zinc-900 rounded-xl">
                      {weaknessVault.length === 0 ? (
                        <div className="p-12 text-center text-zinc-600 font-bold text-xs uppercase flex flex-col items-center justify-center gap-2">
                          <CheckCircle className="w-10 h-10 text-emerald-500/30" />
                          <span>No failures logged yet! Work with quiz series to diagnose conceptual errors.</span>
                        </div>
                      ) : (
                        weaknessVault.map((item, idx) => (
                          <div key={idx} className="p-4 bg-zinc-905 border border-zinc-850 rounded-xl flex flex-col justify-between gap-3 text-xs">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[9px] font-black uppercase bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded mr-1.5">
                                  {item.subject}
                                </span>
                                <span className="text-white font-extrabold uppercase">
                                  {item.topic}
                                </span>
                              </div>
                              <button 
                                onClick={() => clearWeakness(idx)}
                                className="text-zinc-600 hover:text-zinc-300 font-bold text-[10px]"
                              >
                                Clear
                              </button>
                            </div>

                            <p className="text-zinc-300 bg-black/60 p-2.5 rounded italic leading-relaxed text-[11.5px] border border-zinc-900">
                              Q: {item.question}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                              <div className="p-2 bg-red-950/20 text-red-300 rounded border border-red-950">
                                Your response: {item.userAnswer}
                              </div>
                              <div className="p-2 bg-emerald-950/20 text-emerald-300 rounded border border-emerald-950">
                                Accurate keys: {item.correctAnswer}
                              </div>
                            </div>

                            <p className="text-[11px] text-zinc-400 leading-normal whitespace-pre-line pl-1.5 border-l-2 border-[#00E5FF]">
                              🔬 EXPLANATION: {item.explanation}
                            </p>

                            <div className="flex gap-2">
                              <button 
                                onClick={() => askAIShortcut(item.topic, item.subject)}
                                className="px-3.5 py-1.5 bg-[#00E5FF] hover:bg-cyan-400 text-black text-[10px] font-black uppercase tracking-wider rounded flex items-center gap-1 transition"
                              >
                                <Search className="w-3.5 h-3.5" />
                                Lookup Revision Notes
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ----------------- MOBILE RESPONSIVE BOTTOM NAVIGATION BAR ----------------- */}
      {!focusMode && (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-950 border-t border-zinc-900 flex items-center justify-around px-2 z-40 lg:hidden">
          <button 
            onClick={() => setActiveTab(0)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative ${activeTab === 0 ? 'text-[#00E5FF]' : 'text-zinc-500'}`}
          >
            <Layers className="w-5 h-5 focus:outline-none" />
            <span className="text-[9px] font-bold uppercase mt-1">Tracker</span>
            {metrics.selectedDaysCount > 0 && (
              <span className="absolute top-1.5 right-2 bg-red-500 text-white font-mono font-bold text-[8px] px-1 rounded-full">
                {metrics.selectedDaysCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab(1)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 1 ? 'text-[#00E5FF]' : 'text-zinc-500'}`}
          >
            <Compass className="w-5 h-5 focus:outline-none" />
            <span className="text-[9px] font-bold uppercase mt-1">Playlist</span>
          </button>

          <button 
            onClick={() => setActiveTab(2)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 2 ? 'text-[#00E5FF]' : 'text-zinc-500'}`}
          >
            <Search className="w-5 h-5 focus:outline-none" />
            <span className="text-[9px] font-bold uppercase mt-1">Revision</span>
          </button>

          <button 
            onClick={() => setActiveTab(3)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 3 ? 'text-[#00E5FF]' : 'text-zinc-500'}`}
          >
            <BookOpen className="w-5 h-5 focus:outline-none" />
            <span className="text-[9px] font-bold uppercase mt-1">Vault</span>
          </button>

          <button 
            onClick={() => setActiveTab(4)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative ${activeTab === 4 ? 'text-[#00E5FF]' : 'text-zinc-500'}`}
          >
            <Award className="w-5 h-5 focus:outline-none" />
            <span className="text-[9px] font-bold uppercase mt-1">Tests</span>
            {weaknessVault.length > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white font-mono font-bold text-[8px] px-1 rounded-full">
                {weaknessVault.length}
              </span>
            )}
          </button>
        </nav>
      )}

      {/* spacer to avoid content truncation under bottom bar on mobile view */}
      <div className="h-20 lg:hidden shrink-0"></div>

      {/* TWO-STAGE SUBJECT & MICRO-TOPIC SELECTION OVERLAY MODAL */}
      {activeDayForTopicSelection !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-3 overflow-y-auto">
          <div className="bg-white text-black w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border-4 border-white my-auto flex flex-col max-h-[90vh]">
            
            <div className="bg-black p-4 text-white flex justify-between items-center shrink-0">
              <div>
                <span className="font-extrabold uppercase tracking-tight text-sm block">
                  Day {activeDayForTopicSelection} Selector Dashboard
                </span>
                <span className="text-[10px] text-zinc-400 font-mono tracking-widest block leading-none uppercase">
                  {selectionModalStage === 1 ? "Stage 1: Select Subject Pillar" : `Stage 2: Select ${selectedSubjectForModal}`}
                </span>
              </div>
              <button 
                onClick={() => {
                  setActiveDayForTopicSelection(null);
                  setSelectedSubjectForModal(null);
                  setSelectionModalStage(1);
                }}
                className="text-zinc-400 hover:text-white p-1"
                title="Cancel selection"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
              {selectionModalStage === 1 ? (
                /* STAGE 1: Pillar Choosing Grid */
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      setSelectedSubjectForModal("Mathematics");
                      setSelectionModalStage(2);
                    }}
                    className="p-4 bg-white hover:bg-sky-50 border-2 border-gray-200 hover:border-[#00E5FF] rounded-xl flex flex-col items-center justify-center gap-3 transition-all text-center h-28 hover:scale-[1.02]"
                  >
                    <span className="text-2xl">📐</span>
                    <span className="font-black text-xs text-black uppercase leading-tight">MATHEMATICS</span>
                  </button>

                  <button 
                    onClick={() => {
                      setSelectedSubjectForModal("General Intelligence & Reasoning");
                      setSelectionModalStage(2);
                    }}
                    className="p-4 bg-white hover:bg-amber-50 border-2 border-gray-200 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center gap-3 transition-all text-center h-28 hover:scale-[1.02]"
                  >
                    <span className="text-2xl">💡</span>
                    <span className="font-black text-xs text-black uppercase leading-tight">REASONING</span>
                  </button>

                  <button 
                    onClick={() => {
                      setSelectedSubjectForModal("General Science");
                      setSelectionModalStage(2);
                    }}
                    className="p-4 bg-white hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-500 rounded-xl flex flex-col items-center justify-center gap-3 transition-all text-center h-28 hover:scale-[1.02]"
                  >
                    <span className="text-2xl">🧪</span>
                    <span className="font-black text-xs text-black uppercase leading-tight">GENERAL SCIENCE</span>
                  </button>

                  <button 
                    onClick={() => {
                      setSelectedSubjectForModal("General Awareness");
                      setSelectionModalStage(2);
                    }}
                    className="p-4 bg-white hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center gap-3 transition-all text-center h-28 hover:scale-[1.02]"
                  >
                    <span className="text-2xl">🌏</span>
                    <span className="font-black text-xs text-black uppercase leading-tight">AWARENESS</span>
                  </button>
                </div>
              ) : (
                /* STAGE 2: Micro-Topic selection lists pulled from blueprints */
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <button 
                      onClick={() => setSelectionModalStage(1)}
                      className="text-xs font-black text-gray-500 hover:text-black uppercase tracking-wide flex items-center"
                    >
                      ← Back to Subjects
                    </button>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {syllabus_blueprint[selectedSubjectForModal!].length} Micro-Topics Loaded
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                    {syllabus_blueprint[selectedSubjectForModal!].map((topic) => (
                      <div 
                        key={topic}
                        onClick={() => selectTopicAndAutomate(topic)}
                        className="p-3 bg-white hover:bg-zinc-100 border border-gray-200 hover:border-black rounded-lg cursor-pointer text-xs font-bold text-gray-800 transition uppercase tracking-tight flex items-center justify-between"
                      >
                        <span>{topic}</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-100 shrink-0 text-center text-[10px] text-gray-500 font-mono tracking-tight uppercase">
              No manual text entry required. Instantly automates logging dates.
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN NOTEBOOK OVERLAY PANEL */}
      {activeDayForVaultEdit !== null && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
          
          {/* Header Action bar */}
          <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between shrink-0">
            <div>
              <span className="text-[10px] font-black text-[#00E5FF] font-mono uppercase tracking-widest leading-none block mb-1">
                Day {activeDayForVaultEdit} Notebook Editor
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                {dayEntries[activeDayForVaultEdit - 1]?.topic}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-zinc-500 italic">
                {vaultSaveStatus}
              </span>
              
              <button 
                onClick={() => {
                  saveVaultEntry(activeDayForVaultEdit, tempNotes, tempFormulas, tempShortcuts);
                  setActiveDayForVaultEdit(null);
                }}
                className="bg-white hover:bg-gray-200 text-black px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition duration-150"
              >
                ← Close & Auto-Save
              </button>
            </div>
          </div>

          {/* Three large textareas container */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
            
            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-5 flex flex-col gap-2">
              <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                [Personal Topic Notes] 
                <span className="text-[10px] text-zinc-500 font-normal italic uppercase tracking-normal">
                  - Concept definitions and logic summaries
                </span>
              </label>
              <textarea 
                value={tempNotes}
                onChange={(e) => {
                  setTempNotes(e.target.value);
                  saveVaultEntry(activeDayForVaultEdit, e.target.value, tempFormulas, tempShortcuts);
                }}
                placeholder="Type core conceptual summaries, key properties, and syllogism parameters here..."
                className="w-full h-36 bg-black border border-zinc-850 hover:border-zinc-850 focus:border-[#00E5FF] rounded-xl p-4 text-xs text-white focus:outline-none transition leading-relaxed font-sans"
              />
            </div>

            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-5 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  [Essential Formulas]
                  <span className="text-[10px] text-zinc-500 font-normal italic uppercase tracking-normal">
                    - High-Fidelity Mathematical LaTeX Formulas & Equations
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-purple-950 text-purple-300 font-black px-2 py-0.5 rounded border border-purple-900 uppercase">
                    KaTeX Latency-Free Engine
                  </span>
                </div>
              </div>

              {/* Equation builder WYSIWYG Toolbar */}
              <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest font-mono">
                    WYSIWYG Mathematical Character & Structure Insertion Toolbar
                  </span>
                  <span className="text-[9px] text-[#00E5FF]/80 font-mono font-bold uppercase tracking-wider">
                    Click to insert
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {/* Structures */}
                  <button 
                    type="button"
                    onClick={() => insertMath("\\frac{a}{b}")}
                    className="px-2 py-1 bg-black hover:bg-[#00E5FF]/10 text-xs font-mono font-bold text-[#00E5FF] hover:text-white border border-zinc-800 hover:border-[#00E5FF]/50 rounded transition flex items-center gap-1"
                    title="Fraction: \\frac{a}{b}"
                  >
                    <span className="text-zinc-500 font-sans text-[10px] uppercase font-bold mr-0.5">Frac</span>
                    <span className="text-[#00E5FF] font-black">a/b</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => insertMath("x^{y}")}
                    className="px-2 py-1 bg-black hover:bg-[#00E5FF]/10 text-xs font-mono font-bold text-[#00E5FF] hover:text-white border border-zinc-800 hover:border-[#00E5FF]/50 rounded transition flex items-center gap-1"
                    title="Power / Exponent: x^{y}"
                  >
                    <span className="text-zinc-500 font-sans text-[10px] uppercase font-bold mr-0.5">Exp</span>
                    <span>x<sup>y</sup></span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => insertMath("x_{n}")}
                    className="px-2 py-1 bg-black hover:bg-[#00E5FF]/10 text-xs font-mono font-bold text-[#00E5FF] hover:text-white border border-zinc-800 hover:border-[#00E5FF]/50 rounded transition flex items-center gap-1"
                    title="Subscript: x_{n}"
                  >
                    <span className="text-zinc-500 font-sans text-[10px] uppercase font-bold mr-0.5">Sub</span>
                    <span>x<sub>n</sub></span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => insertMath("\\sqrt{x}")}
                    className="px-2 py-1 bg-black hover:bg-[#00E5FF]/10 text-xs font-mono font-bold text-[#00E5FF] hover:text-white border border-zinc-800 hover:border-[#00E5FF]/50 rounded transition flex items-center gap-1"
                    title="Square Root: \\sqrt{x}"
                  >
                    <span className="text-zinc-500 font-sans text-[10px] uppercase font-bold mr-0.5">Root</span>
                    <span>√x</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => insertMath("\\int_{a}^{b} f(x) \\, dx")}
                    className="px-2 py-1 bg-black hover:bg-[#00E5FF]/10 text-xs font-mono font-bold text-[#00E5FF] hover:text-white border border-zinc-800 hover:border-[#00E5FF]/50 rounded transition flex items-center gap-1"
                    title="Definite Integral: \\int"
                  >
                    <span className="text-zinc-500 font-sans text-[10px] uppercase font-bold mr-0.5">Int</span>
                    <span>∫</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => insertMath("\\sum_{i=1}^{n}")}
                    className="px-2 py-1 bg-black hover:bg-[#00E5FF]/10 text-xs font-mono font-bold text-[#00E5FF] hover:text-white border border-zinc-800 hover:border-[#00E5FF]/50 rounded transition flex items-center gap-1"
                    title="Summation: \\sum"
                  >
                    <span className="text-zinc-500 font-sans text-[10px] uppercase font-bold mr-0.5">Sum</span>
                    <span>∑</span>
                  </button>

                  <div className="h-5 w-[1px] bg-zinc-800 self-center mx-1" />

                  {/* Math symbols */}
                  {["\\theta", "\\pi", "\\alpha", "\\beta", "\\lambda", "\\sigma", "\\infty", "\\pm", "\\approx", "\\neq", "\\le", "\\ge"].map((symbol) => {
                    const charMap: Record<string, string> = {
                      "\\theta": "θ", "\\pi": "π", "\\alpha": "α", "\\beta": "β", 
                      "\\lambda": "λ", "\\sigma": "σ", "\\infty": "∞", "\\pm": "±", 
                      "\\approx": "≈", "\\neq": "≠", "\\le": "≤", "\\ge": "≥"
                    };
                    return (
                      <button 
                        key={symbol}
                        type="button"
                        onClick={() => insertMath(symbol)}
                        className="px-2 py-1 bg-black hover:bg-purple-950 text-xs font-mono font-bold text-purple-400 hover:text-purple-300 border border-zinc-800 hover:border-purple-800 rounded transition"
                        title={symbol}
                      >
                        {charMap[symbol] || symbol}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Math Input Field */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wide font-mono">LaTeX Equation Input Editor (Raw Markup)</span>
                  <textarea 
                    ref={formulasTextareaRef}
                    value={tempFormulas}
                    onChange={(e) => {
                      setTempFormulas(e.target.value);
                      saveVaultEntry(activeDayForVaultEdit, tempNotes, e.target.value, tempShortcuts);
                    }}
                    placeholder="Input essential LaTeX formulas (e.g., x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} or \sin^2 \theta + \cos^2 \theta = 1)"
                    className="w-full h-36 bg-black border border-zinc-850 hover:border-[#00E5FF]/40 focus:border-[#00E5FF] rounded-xl p-4 text-xs text-white focus:outline-none transition leading-relaxed font-mono"
                  />
                </div>

                {/* Real-time Renderer Render Preview Pane */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wide font-mono">High-Fidelity Rendered Math Preview</span>
                  <MathRenderer text={tempFormulas} />
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-5 flex flex-col gap-2">
              <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                [Speed Shortcuts & Tricks]
                <span className="text-[10px] text-zinc-500 font-normal italic uppercase tracking-normal">
                  - Faster methods under negative pricing guidelines
                </span>
              </label>
              <textarea 
                value={tempShortcuts}
                onChange={(e) => {
                  setTempShortcuts(e.target.value);
                  saveVaultEntry(activeDayForVaultEdit, tempNotes, tempFormulas, e.target.value);
                }}
                placeholder="Log specialized rapid calculations, blood relation map links, or shortcut formulas..."
                className="w-full h-36 bg-black border border-zinc-850 hover:border-zinc-850 focus:border-[#00E5FF] rounded-xl p-4 text-xs text-white focus:outline-none transition leading-relaxed font-sans"
              />
            </div>

            <div className="bg-zinc-900/40 p-4 border border-zinc-850 rounded-xl max-w-lg mx-auto flex items-center gap-3 text-xs justify-center font-bold">
              <span>Generate Leitner Cards?</span>
              <button 
                onClick={() => convertToFlashcard(activeDayForVaultEdit, dayEntries[activeDayForVaultEdit - 1]?.topic)}
                className="px-4 py-2 bg-[#00E5FF] hover:bg-cyan-400 text-black text-[11px] font-black uppercase rounded tracking-wide transition"
              >
                Assemble Flashcard Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEITNER CARDS DETAILED STUDY MODE MODULE */}
      {activeLeitnerReview && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
          
          <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-900 flex justify-between items-center shrink-0">
            <div>
              <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase leading-none block mb-1">
                Spaced repetition study core
              </span>
              <h3 className="text-lg font-black text-white uppercase">
                Active Leitner learning cards: {filteredFlashcards.length} items logged
              </h3>
            </div>

            <button 
              onClick={() => setActiveLeitnerReview(false)}
              className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg text-xs font-black uppercase"
            >
              ← Back to Vault Desk
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
            
            {/* Box filters */}
            <div className="flex gap-2 mb-6 shrink-0 flex-wrap justify-center">
              <button 
                onClick={() => {
                  setActiveLeitnerBoxFilter(0);
                  setCurrentFlashcardIndex(0);
                }}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded border ${activeLeitnerBoxFilter === 0 ? 'bg-[#00E5FF] text-black border-[#00E5FF]' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}
              >
                All Cards ({flashcards.length})
              </button>
              <button 
                onClick={() => {
                  setActiveLeitnerBoxFilter(1);
                  setCurrentFlashcardIndex(0);
                }}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded border ${activeLeitnerBoxFilter === 1 ? 'bg-red-950 text-red-400 border-red-900 shadow shadow-red-950/40' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}
              >
                Box 1: Daily ({flashcards.filter(c => c.box === 1).length})
              </button>
              <button 
                onClick={() => {
                  setActiveLeitnerBoxFilter(2);
                  setCurrentFlashcardIndex(0);
                }}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded border ${activeLeitnerBoxFilter === 2 ? 'bg-amber-950 text-amber-500 border-amber-900 shadow shadow-amber-950/40' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}
              >
                Box 2: Weekly ({flashcards.filter(c => c.box === 2).length})
              </button>
              <button 
                onClick={() => {
                  setActiveLeitnerBoxFilter(3);
                  setCurrentFlashcardIndex(0);
                }}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded border ${activeLeitnerBoxFilter === 3 ? 'bg-emerald-950 text-emerald-500 border-emerald-950 shadow shadow-emerald-950/40' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}
              >
                Box 3: Monthly ({flashcards.filter(c => c.box === 3).length})
              </button>
            </div>

            {filteredFlashcards.length === 0 ? (
              <div className="p-12 border border-zinc-850 bg-zinc-905 rounded-2xl text-center w-full">
                <HelpCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <span className="text-zinc-500 font-bold block text-sm uppercase">
                  No active flashcards found in this Box.
                </span>
                <p className="text-xs text-zinc-600 mt-2">
                  Assemble Leitner reviews by editing day logs and logging active conceptual cards.
                </p>
              </div>
            ) : (
              <div className="w-full flex-1 flex flex-col justify-center items-center">
                <span className="text-xs text-zinc-500 font-bold uppercase mb-2">
                  Evaluation: Card {currentFlashcardIndex + 1} of {filteredFlashcards.length}
                </span>

                {/* Main clickable Flashcard container */}
                <div 
                  onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                  className="bg-zinc-900 border-2 border-zinc-800 hover:border-[#00E5FF]/45 p-8 rounded-2xl w-full min-h-[250px] flex flex-col items-center justify-center text-center cursor-pointer transition shadow-xl relative select-none"
                >
                  <div className="absolute top-3 left-3 text-[9px] bg-black text-[#00E5FF] px-2 py-0.5 rounded uppercase font-black">
                    Box {filteredFlashcards[currentFlashcardIndex].box}
                  </div>
                  
                  <span className="text-[9px] text-zinc-500 font-bold uppercase absolute top-3 right-3">
                    Click card to flip
                  </span>

                  {isFlashcardFlipped ? (
                    <div className="text-left w-full">
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wide block mb-2 font-mono">
                        [REVEALED CONCEPT ANSWERS]
                      </span>
                      <FlashcardTextRenderer text={filteredFlashcards[currentFlashcardIndex].back} />
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wide block mb-2 font-mono">
                        [TEST SYLLABUS TOPIC]
                      </span>
                      <h4 className="text-xl font-bold text-white uppercase tracking-tight leading-snug">
                        {filteredFlashcards[currentFlashcardIndex].front}
                      </h4>
                    </div>
                  )}
                </div>

                {/* Interactive grading box triggers */}
                {isFlashcardFlipped && (
                  <div className="mt-8 grid grid-cols-3 gap-3 w-full">
                    <button 
                      onClick={() => moveFlashcardLeitner(filteredFlashcards[currentFlashcardIndex].id, 1)}
                      className="p-3.5 bg-red-950 hover:bg-red-900 text-red-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition text-center border border-red-900/50"
                    >
                      🟥 Struggled
                    </button>
                    <button 
                      onClick={() => moveFlashcardLeitner(filteredFlashcards[currentFlashcardIndex].id, 2)}
                      className="p-3.5 bg-amber-950 hover:bg-amber-900 text-amber-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition text-center border border-amber-900/50"
                    >
                      🟨 Mediocre
                    </button>
                    <button 
                      onClick={() => moveFlashcardLeitner(filteredFlashcards[currentFlashcardIndex].id, 3)}
                      className="p-3.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition text-center border border-emerald-900/50"
                    >
                      🟩 Mastered
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROCEDURAL QUIZ OVERLAY SYSTEM MODAL */}
      {activeQuiz !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-900 text-zinc-100 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="bg-zinc-950 border-b border-zinc-900 p-4 shrink-0 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white ${activeQuiz.type === 'daily' ? 'bg-blue-600' : activeQuiz.type === 'weekly' ? 'bg-purple-600' : 'bg-amber-600'}`}>
                    {activeQuiz.type} MCQs Block
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Day {activeQuiz.day} Test Model
                  </span>
                </div>
                <h4 className="text-white font-extrabold text-sm uppercase mt-1 tracking-tight">
                  {activeQuiz.topic} [CBT-1 Non-tech]
                </h4>
              </div>

              {/* Countdown metrics */}
              {activeQuiz.timeLeft !== null && !activeQuiz.isSubmitted && (
                <div className="bg-red-950 border border-red-900 px-3 py-1.5 rounded-lg flex items-center gap-1 text-red-400 font-mono text-xs">
                  <Clock className="w-4 h-4" />
                  <span>
                    {Math.floor(activeQuiz.timeLeft / 60)}:{String(activeQuiz.timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Content list */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              
              {!activeQuiz.isSubmitted ? (
                /* QUIZ ACTIVE VIEW */
                <div>
                  <div className="flex justify-between items-center mb-4 text-[10px] text-zinc-500 font-mono tracking-wider shrink-0 uppercase">
                    <span>PROGRESS: Question {activeQuiz.currentIdx + 1} of {activeQuiz.questions.length}</span>
                    <span>1/3 NEGATIVE MARKING PENALTY APPLIED</span>
                  </div>

                  <div className="p-4 bg-zinc-905 border border-zinc-850 rounded-xl mb-4 text-sm leading-relaxed text-zinc-200">
                    {activeQuiz.questions[activeQuiz.currentIdx]?.question}
                  </div>

                  <div className="space-y-2">
                    {activeQuiz.questions[activeQuiz.currentIdx]?.options.map((opt, oIdx) => {
                      const isSelected = activeQuiz.userAnswers[activeQuiz.currentIdx] === oIdx;
                      return (
                        <div 
                          key={opt}
                          onClick={() => {
                            setActiveQuiz((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                userAnswers: {
                                  ...prev.userAnswers,
                                  [prev.currentIdx]: oIdx
                                }
                              };
                            });
                          }}
                          className={`p-3.5 border rounded-xl cursor-pointer text-xs font-semibold uppercase tracking-wide transition flex items-center justify-between ${isSelected ? 'border-[#00E5FF] bg-cyan-950/30 text-[#00E5FF]' : 'border-zinc-850 bg-black/30 text-zinc-400 hover:border-zinc-700'}`}
                        >
                          <span>{opt}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#00E5FF] bg-[#00E5FF]' : 'border-zinc-800 bg-zinc-950'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-6 shrink-0 pt-3 border-t border-zinc-900">
                    <button 
                      onClick={() => setActiveQuiz(prev => prev ? { ...prev, currentIdx: Math.max(0, prev.currentIdx - 1) } : prev)}
                      disabled={activeQuiz.currentIdx === 0}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded hover:bg-zinc-800 text-xs font-bold disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {activeQuiz.currentIdx < activeQuiz.questions.length - 1 ? (
                      <button 
                        onClick={() => setActiveQuiz(prev => prev ? { ...prev, currentIdx: Math.min(prev.questions.length - 1, prev.currentIdx + 1) } : prev)}
                        className="px-5 py-2 bg-[#00E5FF] hover:bg-cyan-400 text-black rounded text-xs font-black uppercase tracking-wider"
                      >
                        Next
                      </button>
                    ) : (
                      <button 
                        onClick={handleQuizSubmit}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded text-xs font-black uppercase tracking-widest"
                      >
                        Submit Test
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* QUIZ CORRECTION RESULTS VIEW */
                <div className="space-y-6">
                  {/* Score overview header */}
                  <div className="p-6 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center flex flex-col items-center">
                    <span className="text-[10px] text-[#00E5FF] font-black uppercase tracking-widest">
                      Your test metrics resolved
                    </span>
                    
                    <h3 className="text-3xl font-black text-white uppercase mt-2">
                      Score Card Result
                    </h3>

                    {/* Accurate calculated marks including 1/3 penalty representation */}
                    {(() => {
                      let corrects = 0;
                      let incorrects = 0;
                      activeQuiz.questions.forEach((q, idx) => {
                        const ans = activeQuiz.userAnswers[idx];
                        if (ans !== undefined) {
                          if (ans === q.answerIndex) corrects++;
                          else incorrects++;
                        }
                      });
                      const penaltyScore = corrects - incorrects * (1/3);
                      return (
                        <div className="mt-4 flex flex-col items-center">
                          <span className="text-4xl font-extrabold text-[#00E5FF] font-mono leading-none">
                            {parseFloat(penaltyScore.toFixed(2))} / {activeQuiz.questions.length}
                          </span>
                          <p className="text-xs text-zinc-400 mt-2 font-mono">
                            Correct: {corrects} // Wrong attempts: {incorrects} (Weighted deduction -0.33 per item)
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Mentor diagnostic analysis layout */}
                  <div className="border border-zinc-800 bg-zinc-950 p-4 rounded-xl">
                    <h5 className="text-white text-xs font-black uppercase tracking-tight mb-3 text-left">
                      📋 Detailed Mentor Diagnosis Report
                    </h5>

                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                      {activeQuiz.questions.map((q, idx) => {
                        const userAnsIdx = activeQuiz.userAnswers[idx];
                        const isCorrect = userAnsIdx === q.answerIndex;
                        return (
                          <div key={q.id} className={`p-3 rounded-lg border text-left text-xs ${isCorrect ? 'bg-emerald-950/20 border-emerald-900' : 'bg-red-950/20 border-red-900'}`}>
                            <p className="font-extrabold text-zinc-200">Q{idx + 1}: {q.question}</p>
                            <p className="font-mono text-[10px] text-zinc-400 mt-2">
                              Your answer: {userAnsIdx !== undefined ? q.options[userAnsIdx] : "Unattempted"} 
                              {" // "} Correct key: {q.options[q.answerIndex]}
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-2 whitespace-pre-line leading-relaxed pl-2 border-l border-[#00E5FF]">
                              Explanation: {q.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-center">
                    <button 
                      onClick={() => setActiveQuiz(null)}
                      className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 text-xs font-black uppercase rounded-lg"
                    >
                      Exit Results Desk
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER BAR (Desktop static pomodoro and mobile space metrics) */}
      {!focusMode && (
        <footer className="mt-4 shrink-0 flex items-center justify-between px-4 py-2 bg-[#00E5FF] text-black rounded-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
                Concentration loop:
              </span>
              <span className="text-base font-black font-mono">
                {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
              </span>
            </div>

            <div className="flex gap-1 shrink-0">
              <button 
                onClick={() => setPomodoroActive(!pomodoroActive)}
                className="bg-black text-[10px] font-black text-[#00E5FF] px-3 py-1 rounded hover:bg-zinc-900 uppercase"
              >
                {pomodoroActive ? "Pause" : `Start ${pomodoroMode === "focus" ? customFocusMinutes : customRestMinutes}m`}
              </button>
            </div>
            
            <div className="h-4 w-px bg-black/20 hidden md:block"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">
              Badges unlocked: {metrics.quizzesPassedCount} / 400 Core Days Completed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase font-mono text-right hidden sm:inline">
              Next Unlock Milestone: Day {Math.min(400, Math.ceil(metrics.quizzesPassedCount / 7) * 7)} Weekly Review
            </span>
            <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shrink-0"></div>
          </div>
        </footer>
      )}

    </div>
  );
}
