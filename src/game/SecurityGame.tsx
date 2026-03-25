import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Category,
  Scenario,
  GameState,
  DEFAULT_POWERUPS,
  SECURITY_CATEGORIES,
  CATEGORY_DEFINITIONS,
  TEAM_OPTIONS,
  boardSpaces,
  scenarios,
  QUESTION_TIME,
} from "./gameScenarios";
import {
  Sparkles,
  Users,
} from "lucide-react";

// ============================================================
// SOUND EFFECTS - Web Audio API
// ============================================================
const useGameSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playTone = (
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.3,
  ) => {
    const ctx = getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration,
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  return {
    playDiceRoll: () => {
      for (let i = 0; i < 8; i++) {
        setTimeout(
          () => playTone(200 + Math.random() * 400, 0.05, "square", 0.15),
          i * 60,
        );
      }
    },
    playCorrect: () => {
      playTone(523, 0.15, "sine", 0.25);
      setTimeout(() => playTone(659, 0.15, "sine", 0.25), 100);
      setTimeout(() => playTone(784, 0.3, "sine", 0.25), 200);
    },
    playWrong: () => {
      playTone(400, 0.2, "sawtooth", 0.2);
      setTimeout(() => playTone(300, 0.3, "sawtooth", 0.2), 150);
    },
    playVictory: () => {
      [523, 659, 784, 1047, 784, 1047].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.2, "sine", 0.25), i * 150);
      });
    },
    playTick: () => playTone(800, 0.05, "square", 0.1),
    playUrgent: () => {
      playTone(600, 0.1, "square", 0.15);
      setTimeout(() => playTone(600, 0.1, "square", 0.15), 150);
    },
    playPowerUp: () => {
      playTone(400, 0.1, "sine", 0.2);
      setTimeout(() => playTone(600, 0.1, "sine", 0.2), 80);
      setTimeout(() => playTone(800, 0.15, "sine", 0.2), 160);
    },
    playStreak: () => {
      playTone(880, 0.1, "sine", 0.3);
      setTimeout(() => playTone(1100, 0.2, "sine", 0.3), 100);
    },
  };
};

// ============================================================
// CONFETTI ANIMATION
// ============================================================
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null;

  const colors = ["#00D9FF", "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181"];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 animate-confetti"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { top: -10%; opacity: 1; transform: translateX(0) rotate(0deg); }
          100% { top: 110%; opacity: 0; transform: translateX(100px) rotate(720deg); }
        }
        .animate-confetti { animation: confetti linear forwards; }
      `}</style>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SecurityGame() {
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 0,
    players: [
      {
        id: 1,
        name: "OPERATOR ALPHA",
        color: "bg-gold-accent",
        position: 0,
        score: 0,
        budget: 1000000,
        streak: 0,
        powerUps: JSON.parse(JSON.stringify(DEFAULT_POWERUPS)),
      },
      {
        id: 2,
        name: "OPERATOR OMEGA",
        color: "bg-orange-500",
        position: 0,
        score: 0,
        budget: 1000000,
        streak: 0,
        powerUps: JSON.parse(JSON.stringify(DEFAULT_POWERUPS)),
      },
    ],
    isRolling: false,
    diceValue: null,
    showScenario: false,
    currentScenario: null,
    selectedAnswer: null,
    showFeedback: false,
    gameOver: false,
    winner: null,
    turnPhase: "roll",
    hiddenOptions: [],
    timerFrozen: false,
    doublePoints: false,
    timeRemaining: QUESTION_TIME,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [team1Selection, setTeam1Selection] = useState(0);
  const [team2Selection, setTeam2Selection] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [spaceNotice, setSpaceNotice] = useState<{ type: 'bonus' | 'skip'; playerName: string } | null>(null);

  const sounds = useGameSounds();

  // Timer effect
  useEffect(() => {
    if (!gameState.showScenario || gameState.showFeedback || gameState.timerFrozen) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 1) {
          if (soundEnabled) sounds.playWrong();
          return {
            ...prev,
            showFeedback: true,
            timeRemaining: 0,
            selectedAnswer: prev.selectedAnswer ?? -1,
            players: prev.players.map((p, i) =>
              i === prev.currentPlayer ? { ...p, streak: 0 } : p,
            ),
          };
        }
        if (prev.timeRemaining <= 10 && prev.timeRemaining > 5 && soundEnabled) sounds.playTick();
        if (prev.timeRemaining <= 5 && soundEnabled) sounds.playUrgent();
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.showScenario, gameState.showFeedback, gameState.timerFrozen, soundEnabled, sounds]);

  // Victory effect
  useEffect(() => {
    if (gameState.gameOver && gameState.winner) {
      setShowConfetti(true);
      if (soundEnabled) sounds.playVictory();
      submitFinalScore(gameState.winner.score);
      fetchLeaderboard();
    }
  }, [gameState.gameOver, gameState.winner, soundEnabled, sounds]);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("learner_token");
      const resp = await fetch("/api/security-game/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  const submitFinalScore = async (finalScore: number) => {
    try {
      const token = localStorage.getItem("learner_token");
      await fetch("/api/security-game/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          score: finalScore,
          category: categoryFilter,
          board_position: gameState.winner?.position || 19,
        }),
      });
    } catch (err) {
      console.error("Failed to submit score", err);
    }
  };

  const getScenarioForSpace = (spaceType: string): Scenario => {
    let available = scenarios;
    if (!["mixed", "bonus", "skip", "start", "finish"].includes(spaceType)) {
      available = scenarios.filter((s) => s.category === spaceType);
    }
    if (categoryFilter !== "all") {
      available = scenarios.filter((s) => s.category === categoryFilter);
    }
    if (available.length === 0) available = scenarios;
    return available[Math.floor(Math.random() * available.length)];
  };

  const usePowerUp = (id: string) => {
    if (soundEnabled) sounds.playPowerUp();
    const cp = gameState.players[gameState.currentPlayer];
    const pu = cp.powerUps.find((p) => p.id === id && !p.used);
    if (!pu || !gameState.currentScenario) return;

    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p, i) =>
        i === prev.currentPlayer
          ? {
              ...p,
              powerUps: p.powerUps.map((x) => (x.id === id ? { ...x, used: true } : x)),
            }
          : p,
      );

      if (id === "fifty-fifty") {
        const wrong = prev.currentScenario!.options
          .map((opt, i) => ({ correct: opt.correct, index: i }))
          .filter((o) => !o.correct)
          .map((o) => o.index);
        return { ...prev, hiddenOptions: wrong.slice(0, 2), players: updatedPlayers };
      }
      if (id === "time-freeze") return { ...prev, timerFrozen: true, players: updatedPlayers };
      if (id === "double-points") return { ...prev, doublePoints: true, players: updatedPlayers };
      return { ...prev, players: updatedPlayers };
    });
  };

  const rollDice = () => {
    if (gameState.isRolling || gameState.turnPhase !== "roll") return;
    if (soundEnabled) sounds.playDiceRoll();
    setGameState((prev) => ({ ...prev, isRolling: true }));

    let rolls = 0;
    const interval = setInterval(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setGameState((prev) => ({ ...prev, diceValue: value }));
      rolls++;

      if (rolls >= 10) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * 6) + 1;
        setGameState((prev) => {
          const p = prev.players[prev.currentPlayer];
          const nextPos = Math.min(p.position + final, 19);
          const space = boardSpaces[nextPos];
          const updated = prev.players.map((x, i) =>
            i === prev.currentPlayer ? { ...x, position: nextPos } : x,
          );

          if (nextPos >= 19) {
            return {
              ...prev,
              isRolling: false,
              diceValue: final,
              players: updated,
              gameOver: true,
              winner: { ...p, position: nextPos },
            };
          }

          if (space.type === "bonus") {
            const bonusPlayers = updated.map((x, i) =>
              i === prev.currentPlayer ? { ...x, score: x.score + 5 } : x,
            );
            const nextPlayer = (prev.currentPlayer + 1) % prev.players.length;
            const playerName = prev.players[prev.currentPlayer].name;
            setTimeout(() => {
              setSpaceNotice(null);
              setGameState(s => ({ ...s, players: bonusPlayers, currentPlayer: nextPlayer }));
            }, 1800);
            setSpaceNotice({ type: 'bonus', playerName });
            return { ...prev, isRolling: false, diceValue: final, players: bonusPlayers };
          }

          if (space.type === "skip") {
            const nextPlayer = (prev.currentPlayer + 1) % prev.players.length;
            const playerName = prev.players[prev.currentPlayer].name;
            setTimeout(() => {
              setSpaceNotice(null);
              setGameState(s => ({ ...s, players: updated, currentPlayer: nextPlayer }));
            }, 1800);
            setSpaceNotice({ type: 'skip', playerName });
            return { ...prev, isRolling: false, diceValue: final, players: updated };
          }

          return {
            ...prev,
            isRolling: false,
            diceValue: final,
            players: updated,
            showScenario: true,
            currentScenario: getScenarioForSpace(space.type),
            selectedAnswer: null,
            showFeedback: false,
            turnPhase: "scenario",
            hiddenOptions: [],
            timerFrozen: false,
            doublePoints: false,
            timeRemaining: QUESTION_TIME,
          };
        });
      }
    }, 100);
  };

  const selectAnswer = (i: number) => {
    if (!gameState.showFeedback) setGameState((prev) => ({ ...prev, selectedAnswer: i }));
  };

  const submitAnswer = () => {
    if (gameState.selectedAnswer === null || !gameState.currentScenario) return;
    const isCorrect = gameState.currentScenario.options[gameState.selectedAnswer].correct;
    let pts = isCorrect ? gameState.currentScenario.points : 0;

    if (gameState.doublePoints && isCorrect) pts *= 2;
    const streak = gameState.players[gameState.currentPlayer].streak;
    if (isCorrect && streak >= 2) {
      pts += streak * 2;
      if (soundEnabled) sounds.playStreak();
    }

    if (isCorrect) {
      if (soundEnabled) sounds.playCorrect();
    } else {
      if (soundEnabled) sounds.playWrong();
    }

    const impact = gameState.currentScenario.impact || (gameState.currentScenario.points * 5000);
    const damage = isCorrect ? 0 : impact;

    setGameState((prev) => ({
      ...prev,
      showFeedback: true,
      players: prev.players.map((p, i) =>
        i === prev.currentPlayer
          ? {
              ...p,
              score: p.score + pts,
              budget: Math.max(0, p.budget - damage),
              streak: isCorrect ? p.streak + 1 : 0,
            }
          : p,
      ),
    }));
  };

  const nextTurn = () => {
    setGameState((prev) => ({
      ...prev,
      showScenario: false,
      currentScenario: null,
      selectedAnswer: null,
      showFeedback: false,
      currentPlayer: (prev.currentPlayer + 1) % prev.players.length,
      turnPhase: "roll",
    }));
  };

  const resetGame = () => {
    setShowConfetti(false);
    setGameState({
      currentPlayer: 0,
      players: [
        {
          id: 1,
          name: "OPERATOR ALPHA",
          color: "bg-gold-accent",
          position: 0,
          score: 0,
          budget: 1000000,
          streak: 0,
          powerUps: JSON.parse(JSON.stringify(DEFAULT_POWERUPS)),
        },
        {
          id: 2,
          name: "OPERATOR OMEGA",
          color: "bg-orange-500",
          position: 0,
          score: 0,
          budget: 1000000,
          streak: 0,
          powerUps: JSON.parse(JSON.stringify(DEFAULT_POWERUPS)),
        },
      ],
      isRolling: false,
      diceValue: null,
      showScenario: false,
      currentScenario: null,
      selectedAnswer: null,
      showFeedback: false,
      gameOver: false,
      winner: null,
      turnPhase: "roll",
      hiddenOptions: [],
      timerFrozen: false,
      doublePoints: false,
      timeRemaining: QUESTION_TIME,
    });
    setGameStarted(false);
    setShowSetup(false);
  };

  const startGameWithTeams = () => {
    const t1 = TEAM_OPTIONS[team1Selection];
    const t2 = TEAM_OPTIONS[team2Selection];
    setGameState((prev) => ({
      ...prev,
      players: [
        {
          id: 1,
          name: team1Name || t1.name,
          color: t1.color,
          position: 0,
          score: 0,
          budget: 1000000,
          streak: 0,
          powerUps: JSON.parse(JSON.stringify(DEFAULT_POWERUPS)),
        },
        {
          id: 2,
          name: team2Name || t2.name,
          color: t2.color,
          position: 0,
          score: 0,
          budget: 1000000,
          streak: 0,
          powerUps: JSON.parse(JSON.stringify(DEFAULT_POWERUPS)),
        },
      ],
    }));
    setShowSetup(false);
    setGameStarted(true);
  };

  if (gameState.gameOver && gameState.winner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 font-mono">
        <Confetti active={showConfetti} />
        <div className="tactical-console p-12 rounded-lg border-2 border-gold-accent bg-black/80 backdrop-blur-xl max-w-4xl w-full">
          <h1 className="text-6xl font-black tactical-glitch mb-4 text-gold-accent">MISSION: VALIDATED</h1>
          <div className="text-2xl mb-8 text-gray-400 uppercase tracking-widest">
            OPERATIONAL CLEARANCE ESTABLISHED
          </div>
          <div
            className={`inline-block px-10 py-5 rounded-sm ${gameState.winner.color} text-white text-4xl font-black mb-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-2 border-white/20`}
          >
            {gameState.winner.name.toUpperCase()} WINS
          </div>
          <div className="flex justify-center gap-10 mb-10">
            {gameState.players.map((p) => (
              <div key={p.id} className="text-center">
                <div className="text-gray-500 text-xs mb-1 uppercase">{p.name}</div>
                <div className="text-4xl font-bold text-gold-accent">
                  {p.score}
                  <span className="text-sm text-gray-600 ml-1">PTS</span>
                </div>
              </div>
            ))}
          </div>

          {/* GLOBAL LEADERBOARD */}
          <div className="mb-10 p-6 bg-white/5 border border-white/5 rounded-lg max-w-lg mx-auto">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-4 text-center">
              Global Command Rankings
            </h3>
            <div className="space-y-2">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-gold-accent/50 w-4">#{i + 1}</span>
                      <span className="font-bold text-gray-300">{entry.name}</span>
                      <span className="text-gray-600 text-[8px] uppercase">{entry.company}</span>
                    </div>
                    <div className="font-mono text-gold-accent">{entry.score} PTS</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-[10px] text-gray-600 py-4 uppercase">
                  Synchronizing records...
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gold-accent text-black font-bold uppercase tracking-tighter hover:bg-gold-accent"
            >
              New Mission
            </button>
            <Link
              to="/learn/dashboard"
              className="px-8 py-3 border border-gold-accent/50 text-gold-accent font-bold uppercase tracking-tighter hover:bg-gold-accent/10"
            >
              Exit to Academy
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="dark" className="fade-in max-w-7xl mx-auto p-4 font-mono">
      <style>{`
        .tactical-console { 
          background: linear-gradient(135deg, var(--bg-canvas) 0%, var(--bg-surface) 100%); 
          border: 1px solid var(--border-default); 
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4); 
          position: relative; 
          overflow: hidden; 
        }
        .tactical-console::after { 
          content: ''; 
          position: absolute; 
          inset: 0; 
          background: radial-gradient(circle at 50% 50%, rgba(125, 211, 252, 0.03) 0%, transparent 70%); 
          pointer-events: none; 
        }
        .tactical-glitch { 
          font-weight: 900;
          letter-spacing: -0.05em;
          color: #fff;
        }
        .cyber-panel { 
          background: rgba(10, 19, 32, 0.6); 
          backdrop-filter: blur(12px); 
          border: 1px solid rgba(255, 255, 255, 0.05); 
          border-radius: 12px;
        }
        .gold-accent { color: #F59E0B; }
        .navy-bg { background: var(--bg-canvas); }
        .slate-border { border-color: rgba(148, 163, 184, 0.1); }
      `}</style>

      {/* Space notice overlay */}
      {spaceNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className="px-8 py-5 rounded-2xl text-center font-mono shadow-2xl"
            style={{
              background: spaceNotice.type === 'bonus' ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.12)',
              border: `2px solid ${spaceNotice.type === 'bonus' ? '#F59E0B' : 'rgba(148,163,184,0.4)'}`,
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="text-3xl mb-2">{spaceNotice.type === 'bonus' ? '⚡' : '⏭'}</div>
            <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: spaceNotice.type === 'bonus' ? '#F59E0B' : '#94a3b8' }}>
              {spaceNotice.type === 'bonus' ? 'Bonus Space' : 'Skip Space'}
            </div>
            <div className="text-sm font-semibold text-white">
              {spaceNotice.type === 'bonus'
                ? `${spaceNotice.playerName} earns +5 points`
                : `${spaceNotice.playerName} skips this turn`}
            </div>
          </div>
        </div>
      )}

      <div className="scan-line"></div>

      <div className="flex justify-between items-center mb-8 border-b slate-border pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight tactical-glitch flex items-center gap-3">
            <span className="text-white">CYBER QUEST</span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-gold-accent/10 text-gold-accent border border-gold-accent/20 rounded">
              GLOBAL_FREIGHT_EDITION
            </span>
          </h1>
          <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-[0.2em] flex items-center">
            Personnel Training Simulation // <span className="text-emerald-glow ml-1">Live Feed Synchronized</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-gold-accent/50 hover:text-gold-accent transition"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
          <button
            onClick={resetGame}
            className="px-4 py-1.5 border border-red-500/50 text-red-500 text-[10px] uppercase font-bold hover:bg-red-500/10 transition"
          >
            Abort Mission
          </button>
        </div>
      </div>

      {!gameStarted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
          <div className="tactical-console p-10 rounded-lg flex flex-col items-center justify-center text-center">
            <div className="text-7xl mb-6">🛡️</div>
            <h2 className="text-4xl font-black mb-2 uppercase">Ready for Deployment?</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Standardized cybersecurity engagement simulation for Five Eyes personnel.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setGameStarted(true)}
                className="px-10 py-4 bg-gold-accent text-black font-black uppercase tracking-tighter hover:bg-gold-accent transition-all transform hover:scale-105"
              >
                Quick Deploy
              </button>
              <button
                onClick={() => setShowSetup(true)}
                className="px-10 py-4 border border-gold-accent/50 text-gold-accent font-black uppercase tracking-tighter hover:bg-gold-accent/10 transition-all"
              >
                Manual Config
              </button>
            </div>
          </div>
          <div className="cyber-panel p-8 rounded-lg">
            <h3 className="text-sm font-bold text-gold-accent uppercase mb-4">Operational Intelligence</h3>
            <div className="space-y-4">
              {Object.entries(SECURITY_CATEGORIES).map(([key, info]) => (
                <div
                  key={key}
                  className="flex items-center gap-4 p-3 bg-white/5 rounded border border-white/5 hover:border-white/10 transition-all group cursor-pointer"
                  onClick={() => setSelectedCategory(key as Category)}
                >
                  <div className="text-2xl">{info.icon}</div>
                  <div className="flex-1">
                    <div className={`text-xs font-bold ${info.color}`}>{info.name}</div>
                    <div className="text-[10px] text-gray-500">{info.description}</div>
                  </div>
                  <div className="text-gold-accent opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          {/* PERSONNEL TRACKING */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="tactical-console p-4 rounded-lg">
              <h3 className="text-[10px] font-bold text-gold-accent uppercase tracking-widest mb-4 flex justify-between items-center">
                <span>Personnel Tracking</span> <Users className="w-3 h-3" />
              </h3>
              <div className="space-y-3">
                {gameState.players.map((p, i) => (
                  <div
                    key={p.id}
                    className={`p-3 border transition-all ${
                      i === gameState.currentPlayer
                        ? "border-gold-accent bg-gold-accent/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        : "border-white/5 bg-black/40 opacity-60"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-xs uppercase">{p.name}</div>
                      <div
                        className={`w-2 h-2 rounded-full ${p.color} ${
                          i === gameState.currentPlayer ? "animate-pulse shadow-[0_0_8px_cyan]" : ""
                        }`}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-1 bg-black/50 rounded flex flex-col gap-1">
                        <span className="opacity-50">LIQUIDITY:</span>
                        <span className={p.budget < 200000 ? "text-red-400 animate-pulse" : "text-emerald-400"}>
                          ${p.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-1 bg-black/50 rounded flex flex-col gap-1">
                        <span className="opacity-50">SCORE:</span>
                        <span className="text-gold-accent">{p.score} PTS</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tactical-console p-4 rounded-lg hidden lg:block">
              <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-4 flex justify-between items-center">
                <span>Tactical Assets</span> <Sparkles className="w-3 h-3" />
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {gameState.players[gameState.currentPlayer].powerUps.map((pu) => (
                  <button
                    key={pu.id}
                    onClick={() => usePowerUp(pu.id)}
                    disabled={pu.used || !gameState.showScenario || gameState.showFeedback}
                    className={`aspect-square flex flex-col items-center justify-center p-1 rounded border transition-all ${
                      pu.used
                        ? "opacity-20 grayscale border-white/5"
                        : "border-orange-500/30 bg-black/40 hover:border-orange-500"
                    }`}
                    title={pu.description}
                  >
                    <span className="text-lg">{pu.icon}</span>
                    <span className="text-[9px] mt-1 font-bold uppercase truncate w-full text-center">
                      {pu.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* OPS CENTER */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {!gameState.showScenario ? (
              <div className="tactical-console p-10 rounded-xl text-center h-[550px] flex flex-col items-center justify-center">
                <div className="text-9xl mb-12 transform -rotate-6 opacity-80" style={{ filter: 'drop-shadow(0 0 30px rgba(125, 211, 252, 0.2))' }}>
                  {gameState.diceValue ? `🎲 ${gameState.diceValue}` : "🎲"}
                </div>
                <div className="mb-10 text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-[0.4em] mb-4">
                    Active Director
                  </div>
                  <div className="text-5xl font-black text-white uppercase tracking-tight">
                    {gameState.players[gameState.currentPlayer].name}
                  </div>
                </div>
                <button
                  onClick={rollDice}
                  disabled={gameState.isRolling}
                  className={`px-16 py-5 bg-gold-accent text-white font-black uppercase tracking-widest hover:bg-gold-accent transform transition-all hover:scale-105 active:scale-95 shadow-xl ${
                    gameState.isRolling ? "opacity-30 grayscale cursor-not-allowed" : ""
                  }`}
                >
                  {gameState.isRolling ? "INITIALIZING..." : "COMMENCE SIMULATION"}
                </button>

                <div className="mt-12 flex gap-3 justify-center">
                  {boardSpaces.map((s, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                        gameState.players.some((p) => p.position === i)
                          ? "bg-gold-accent scale-150 shadow-[0_0_10px_#7dd3fc] animate-pulse"
                          : "bg-white/5"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="tactical-console p-8 rounded-lg border-2 border-gold-accent/40 min-h-[550px] flex flex-col">
                <div className="flex items-start justify-between mb-8 border-b border-white/10 pb-6">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-3xl">
                        {SECURITY_CATEGORIES[gameState.currentScenario!.category].icon}
                      </span>
                      <h2 className="text-3xl font-black uppercase text-white tracking-tight">
                        {gameState.currentScenario!.title}
                      </h2>
                    </div>
                    <div className="flex gap-6 text-[10px] uppercase font-bold tracking-[0.2em]">
                      <span className={SECURITY_CATEGORIES[gameState.currentScenario!.category].color}>
                        {gameState.currentScenario!.category}
                      </span>
                      <span className="text-gray-700">|</span>
                      <span
                        className={
                          gameState.currentScenario!.difficulty === "advanced"
                            ? "text-orange-400"
                            : "text-gold-accent"
                        }
                      >
                        {gameState.currentScenario!.difficulty}
                      </span>
                      <span className="text-gray-700">|</span>
                      <span className="text-yellow-400">
                        {gameState.doublePoints
                          ? gameState.currentScenario!.points * 2
                          : gameState.currentScenario!.points}{" "}
                        PTS
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                      Extraction Window
                    </div>
                    <div
                      className={`text-4xl font-black ${
                        gameState.timeRemaining <= 10 ? "text-orange-500 animate-pulse" : "text-gold-accent"
                      }`}
                    >
                      {gameState.timeRemaining}S
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-8">
                  <div>
                    <div className="text-[10px] text-gold-accent/50 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                      <span className="w-6 h-[1px] bg-gold-accent/50"></span> Tactical Briefing
                    </div>
                    <div className="p-8 bg-black/40 border border-white/5 rounded-sm italic text-xl text-gray-100 leading-relaxed font-sans shadow-inner">
                      "{gameState.currentScenario!.situation}"
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-8 tracking-tight border-l-4 border-gold-accent pl-4 uppercase">
                      Action Required: {gameState.currentScenario!.question}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {gameState.currentScenario!.options.map((opt, i) => {
                        const hidden = gameState.hiddenOptions.includes(i);
                        if (hidden && !gameState.showFeedback) {
                          return (
                            <div
                              key={i}
                              className="p-5 border border-white/5 bg-black/60 opacity-20 text-[10px] flex items-center italic uppercase tracking-widest"
                            >
                              [ Signal Redacted ]
                            </div>
                          );
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => selectAnswer(i)}
                            disabled={gameState.showFeedback || hidden}
                            className={`p-5 text-left border-2 transition-all flex items-start gap-5 group relative overflow-hidden ${
                              gameState.selectedAnswer === i
                                ? "border-gold-accent bg-gold-accent/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                                : "border-white/5 bg-black/40 hover:border-white/20"
                            } ${
                              gameState.showFeedback && opt.correct ? "border-green-500 bg-green-500/10" : ""
                            } ${
                              gameState.showFeedback && gameState.selectedAnswer === i && !opt.correct
                                ? "border-orange-500 bg-orange-500/10"
                                : ""
                            }`}
                          >
                            <span
                              className={`w-8 h-8 flex items-center justify-center border-2 text-xs font-black transition-colors ${
                                gameState.selectedAnswer === i
                                  ? "border-gold-accent text-gold-accent"
                                  : "border-white/10 text-gray-600"
                              } ${gameState.showFeedback && opt.correct ? "border-green-500 text-green-500" : ""}`}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-base font-medium text-gray-200 mt-1">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
                  <div className="flex-1 pr-10">
                    {gameState.showFeedback && gameState.selectedAnswer !== null && (
                      <div
                        className={`flex items-start gap-4 p-4 rounded bg-black/40 border-l-4 shadow-lg ${
                          gameState.currentScenario!.options[gameState.selectedAnswer].correct
                            ? "border-green-500 text-green-400"
                            : "border-orange-500 text-orange-400"
                        }`}
                      >
                        <span className="text-3xl mt-1">
                          {gameState.currentScenario!.options[gameState.selectedAnswer].correct
                            ? "✓"
                            : "✗"}
                        </span>
                        <div>
                          <div className="text-xs font-black uppercase mb-1 tracking-widest">
                            {gameState.currentScenario!.options[gameState.selectedAnswer].correct
                              ? "Critical Analysis Validated"
                              : "Tactical Execution Error"}
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {gameState.currentScenario!.options[gameState.selectedAnswer].feedback}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    {!gameState.showFeedback ? (
                      <button
                        onClick={submitAnswer}
                        disabled={gameState.selectedAnswer === null}
                        className={`px-12 py-4 bg-gold-accent text-black font-black uppercase tracking-tighter hover:bg-gold-accent shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all ${
                          gameState.selectedAnswer === null ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                      >
                        Authorize Action
                      </button>
                    ) : (
                      <button
                        onClick={nextTurn}
                        className="px-12 py-4 bg-white text-black font-black uppercase tracking-tighter hover:bg-gray-200 shadow-xl transition-all"
                      >
                        Next Objective →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INTELLIGENCE MODAL */}
      {selectedCategory && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          onClick={() => setSelectedCategory(null)}
        >
          <div
            className="tactical-console max-w-2xl w-full p-10 border-gold-accent/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-6 mb-10 border-b border-white/10 pb-8">
              <div className="text-6xl">{SECURITY_CATEGORIES[selectedCategory].icon}</div>
              <div>
                <h2
                  className={`text-5xl font-black tactical-glitch tracking-tighter ${SECURITY_CATEGORIES[selectedCategory].color}`}
                >
                  {SECURITY_CATEGORIES[selectedCategory].name.toUpperCase()}
                </h2>
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mt-2">
                  Threat Profile Overview
                </div>
              </div>
            </div>
            <div className="space-y-8 text-sm mb-12">
              <div>
                <h3 className="text-gold-accent text-[10px] font-bold uppercase mb-3 tracking-widest">
                  Strategic Briefing
                </h3>
                <p className="text-gray-300 leading-relaxed font-sans text-base shadow-sm p-4 bg-white/5 border border-white/5">
                  {CATEGORY_DEFINITIONS[selectedCategory].definition}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <h3 className="text-orange-500 text-[10px] font-bold uppercase mb-4 tracking-widest">
                    Known Vectors
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-400">
                    {CATEGORY_DEFINITIONS[selectedCategory].examples.map((ex, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-orange-500/50 rounded-full"></span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-green-500 text-[10px] font-bold uppercase mb-4 tracking-widest">
                    Countermeasures
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-400">
                    {CATEGORY_DEFINITIONS[selectedCategory].tips.map((tip, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-full py-5 border-2 border-gold-accent/40 text-gold-accent font-black uppercase hover:bg-gold-accent/10 transition-all tracking-widest active:scale-95"
            >
              Confirm Awareness
            </button>
          </div>
        </div>
      )}

      {/* TEAM CONFIGURATION */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-4 backdrop-blur-2xl">
          <div className="tactical-console max-w-4xl w-full p-12 border-white/10">
            <h2 className="text-5xl font-black text-white mb-12 tracking-tighter text-center uppercase">
              Tactical Deployment Configuration
            </h2>
            <div className="grid grid-cols-2 gap-16 mb-16 text-center">
              <div className="space-y-6">
                <div className="text-[10px] text-gold-accent font-black uppercase tracking-[0.3em] mb-4">
                  Personnel Unit 01
                </div>
                <input
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder="Enter Callsign..."
                  className="w-full bg-black/40 border-2 border-white/10 p-5 text-white font-black text-xl text-center focus:border-gold-accent focus:outline-none transition-all placeholder:text-gray-700"
                />
                <div className="flex justify-center gap-4 pt-4">
                  {TEAM_OPTIONS.map((o, i) => (
                    <button
                      key={i}
                      onClick={() => setTeam1Selection(i)}
                      className={`w-14 h-14 border-4 transition-all ${
                        team1Selection === i
                          ? "border-gold-accent scale-125 shadow-[0_0_15px_cyan]"
                          : "border-white/10 opacity-30 hover:opacity-100"
                      }`}
                      style={{ background: o.color.replace("bg-", "").replace("emerald", "#10b981").replace("blue", "#3b82f6").replace("orange", "#f97316").replace("purple", "#a855f7") }}
                    ></button>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em] mb-4">
                  Personnel Unit 02
                </div>
                <input
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder="Enter Callsign..."
                  className="w-full bg-black/40 border-2 border-white/10 p-5 text-white font-black text-xl text-center focus:border-orange-500 focus:outline-none transition-all placeholder:text-gray-700"
                />
                <div className="flex justify-center gap-4 pt-4">
                  {TEAM_OPTIONS.map((o, i) => (
                    <button
                      key={i}
                      onClick={() => setTeam2Selection(i)}
                      className={`w-14 h-14 border-4 transition-all ${
                        team2Selection === i
                          ? "border-orange-500 scale-125 shadow-[0_0_15px_#f97316]"
                          : "border-white/10 opacity-30 hover:opacity-100"
                      }`}
                      style={{ background: o.color.replace("bg-", "").replace("emerald", "#10b981").replace("blue", "#3b82f6").replace("orange", "#f97316").replace("purple", "#a855f7") }}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <button
                onClick={() => setShowSetup(false)}
                className="flex-1 py-5 border border-white/10 text-gray-500 font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Discard Intel
              </button>
              <button
                onClick={startGameWithTeams}
                className="flex-1 py-5 bg-gold-accent text-black font-black uppercase tracking-tighter hover:bg-gold-accent shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all transform active:scale-95"
              >
                Authorize Deployment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMY LINK */}
      <div className="mt-12 text-center">
        <Link
          to="/learn/dashboard"
          className="text-gold-accent/50 hover:text-gold-accent text-xs uppercase tracking-[0.4em] transition-all font-bold"
        >
          [ Return to Headquarters ]
        </Link>
      </div>
    </div>
  );
}
