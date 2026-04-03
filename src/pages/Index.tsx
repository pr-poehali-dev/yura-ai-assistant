import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type GameType = "reaction" | "quiz" | "wordguess";

interface Message {
  id: number;
  type: "user" | "bot" | "game";
  text?: string;
  gameType?: GameType;
  timestamp: Date;
}

const QUIZ_QUESTIONS = [
  { q: "Сколько планет в Солнечной системе?", options: ["7", "8", "9", "10"], correct: 1 },
  { q: "Какой самый большой океан?", options: ["Атлантический", "Индийский", "Тихий", "Северный Ледовитый"], correct: 2 },
  { q: "Столица Австралии?", options: ["Сидней", "Мельбурн", "Канберра", "Брисбен"], correct: 2 },
  { q: "Символ Au — это...?", options: ["Серебро", "Платина", "Золото", "Алюминий"], correct: 2 },
];

const WORDS = ["КОШКА", "ЗОНТИК", "ПИРОГ", "ОБЛАКО", "ФОНАРЬ", "МУЗЫКА", "РАДУГА", "РАКЕТА"];

// --- Reaction Game ---
function ReactionGame({ onResult }: { onResult: (ms: number) => void }) {
  const [phase, setPhase] = useState<"wait" | "ready" | "done">("wait");
  const [ms, setMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    timerRef.current = setTimeout(() => setPhase("ready"), 1000 + Math.random() * 2500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (phase === "ready") startRef.current = Date.now();
  }, [phase]);

  const handleClick = () => {
    if (phase === "done") return;
    if (phase === "wait") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("done");
      setMs(-1);
      onResult(-1);
    } else {
      const elapsed = Date.now() - startRef.current;
      setMs(elapsed);
      setPhase("done");
      onResult(elapsed);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full h-28 rounded-2xl font-semibold text-base transition-all duration-200 select-none ${
        phase === "wait"
          ? "bg-amber-50 border-2 border-amber-200 text-amber-700"
          : phase === "ready"
          ? "bg-primary text-white scale-[1.02] shadow-md"
          : "bg-muted text-muted-foreground cursor-default"
      }`}
    >
      {phase === "wait" && "Жди зелёного..."}
      {phase === "ready" && "ЖМИ СЕЙЧАС! ⚡"}
      {phase === "done" && (ms === -1 ? "Слишком рано! 🙈" : `${ms} мс`)}
    </button>
  );
}

// --- Quiz Game ---
function QuizGame({ onResult }: { onResult: (correct: boolean) => void }) {
  const [q] = useState(() => QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)]);
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setTimeout(() => onResult(i === q.correct), 700);
  };

  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm text-foreground">{q.q}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`p-2.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
              selected === null
                ? "border-border bg-secondary hover:bg-accent text-foreground"
                : i === q.correct
                ? "border-primary bg-accent text-primary"
                : selected === i
                ? "border-destructive bg-red-50 text-destructive"
                : "border-border bg-muted text-muted-foreground"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Word Guess Game ---
function WordGuessGame({ onResult }: { onResult: (won: boolean) => void }) {
  const [word] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const maxWrong = 6;
  const wrongLetters = guessed.filter(l => !word.includes(l));
  const won = word.split("").every(l => guessed.includes(l));
  const lost = wrongLetters.length >= maxWrong;

  useEffect(() => {
    if (won) setTimeout(() => onResult(true), 400);
    if (lost) setTimeout(() => onResult(false), 400);
  }, [won, lost]);

  const handleGuess = () => {
    const letter = input.toUpperCase().trim();
    if (!letter || guessed.includes(letter)) { setInput(""); return; }
    setGuessed(prev => [...prev, letter]);
    setInput("");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 justify-center flex-wrap">
        {word.split("").map((l, i) => (
          <div key={i} className="w-8 h-9 border-b-2 border-foreground/30 flex items-end justify-center pb-0.5">
            <span className="font-bold text-base text-foreground">
              {guessed.includes(l) ? l : ""}
            </span>
          </div>
        ))}
      </div>
      {wrongLetters.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Ошибки ({wrongLetters.length}/{maxWrong}): <span className="text-destructive/70">{wrongLetters.join(" ")}</span>
        </p>
      )}
      {!won && !lost && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value.slice(0, 1))}
            onKeyDown={e => e.key === "Enter" && handleGuess()}
            maxLength={1}
            placeholder="Буква..."
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-secondary text-foreground text-sm outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleGuess}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Ввод
          </button>
        </div>
      )}
    </div>
  );
}

// --- Game Bubble ---
function GameBubble({ gameType, onComplete }: { gameType: GameType; onComplete: (msg: string) => void }) {
  const [done, setDone] = useState(false);

  const titles: Record<GameType, string> = {
    reaction: "⚡ Реакция",
    quiz: "🧠 Викторина",
    wordguess: "🔤 Угадай слово",
  };

  const handleReaction = (ms: number) => {
    setDone(true);
    if (ms === -1) onComplete("Ой, нажал слишком рано! Попробуй ещё раз 😄");
    else if (ms < 200) onComplete(`Невероятно — ${ms} мс! Космические рефлексы 🚀`);
    else if (ms < 350) onComplete(`Отлично! ${ms} мс — ты быстрый ⚡`);
    else onComplete(`${ms} мс — неплохо! Тренируйся 💪`);
  };

  const handleQuiz = (correct: boolean) => {
    setDone(true);
    onComplete(correct ? "Правильно! Отличный результат 🎉" : "Не угадал, но это нормально 😊");
  };

  const handleWord = (won: boolean) => {
    setDone(true);
    onComplete(won ? "Ура! Слово угадано — ты молодец 🏆" : "Не угадал на этот раз, но это было сложно 💙");
  };

  return (
    <div className="chat-bubble-bot p-4 w-72 animate-fade-in">
      <p className="text-xs font-semibold text-primary mb-3">{titles[gameType]}</p>
      {done ? (
        <p className="text-xs text-muted-foreground">Подводим итоги...</p>
      ) : (
        <>
          {gameType === "reaction" && <ReactionGame onResult={handleReaction} />}
          {gameType === "quiz" && <QuizGame onResult={handleQuiz} />}
          {gameType === "wordguess" && <WordGuessGame onResult={handleWord} />}
        </>
      )}
    </div>
  );
}

const GAME_CHIPS: { type: GameType; emoji: string; label: string; desc: string }[] = [
  { type: "reaction", emoji: "⚡", label: "Реакция", desc: "Скорость нажатия" },
  { type: "quiz", emoji: "🧠", label: "Викторина", desc: "Ответь на вопрос" },
  { type: "wordguess", emoji: "🔤", label: "Угадай слово", desc: "Буква за буквой" },
];

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: "bot", text: "Привет! Я здесь, чтобы скрасить твой день 😊 Можем поболтать или сыграть в игру — выбирай!", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = (msg: Omit<Message, "id" | "timestamp">) =>
    setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random(), timestamp: new Date() }]);

  const botReply = (text: string, delay = 700) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ type: "bot", text });
    }, delay + Math.random() * 300);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    addMessage({ type: "user", text });
    setInput("");

    const lower = text.toLowerCase();
    if (lower.includes("игр")) {
      botReply("Выбери игру снизу и я запущу её прямо здесь! 🎮");
    } else if (lower.match(/привет|здорово|хай|hi|hello/)) {
      botReply("Привет-привет! 👋 Как дела?");
    } else if (lower.match(/как дела|как ты|как жизнь/)) {
      botReply("Отлично, спасибо! Готов веселиться 🎉 А у тебя как?");
    } else if (lower.includes("скуч")) {
      botReply("Давай поиграем! Нажми на карточку игры снизу 🎮");
    } else {
      const r = ["Интересно! Расскажи больше 😊", "Понял тебя! А ещё — хочешь сыграть? 🎮", "Здорово! Как настроение сегодня?", "Ха! 😄 Можем ещё и поиграть, если хочешь"];
      botReply(r[Math.floor(Math.random() * r.length)]);
    }
  };

  const startGame = (type: GameType) => {
    const g = GAME_CHIPS.find(c => c.type === type)!;
    addMessage({ type: "user", text: `Хочу сыграть в «${g.label}»` });
    setTimeout(() => addMessage({ type: "game", gameType: type }), 400);
  };

  const handleGameComplete = (text: string) => botReply(text, 400);

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card sticky top-0 z-10">
        <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-base">З</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-sm text-foreground leading-tight">Здорова</h1>
          <p className="text-xs text-muted-foreground">чат и мини-игры</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-2 h-2 bg-primary rounded-full" />
          <span className="text-xs text-muted-foreground">онлайн</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 animate-fade-in ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.type !== "user" && (
              <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mb-0.5">
                <span className="text-primary-foreground font-bold text-xs">З</span>
              </div>
            )}
            <div className="max-w-[78%]">
              {msg.type === "game" && msg.gameType ? (
                <GameBubble gameType={msg.gameType} onComplete={handleGameComplete} />
              ) : (
                <div className={`px-4 py-2.5 text-sm leading-relaxed ${msg.type === "user" ? "chat-bubble-user" : "chat-bubble-bot"}`}>
                  {msg.text}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs">З</span>
            </div>
            <div className="chat-bubble-bot px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft" style={{ animationDelay: "200ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft" style={{ animationDelay: "400ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Game panel */}
      <div className="px-4 pt-2 pb-1 border-t border-border bg-card">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Мини-игры</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {GAME_CHIPS.map(g => (
            <button
              key={g.type}
              onClick={() => startGame(g.type)}
              className="game-card flex-shrink-0 px-3 py-2.5 flex items-center gap-2.5"
            >
              <span className="text-xl">{g.emoji}</span>
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground whitespace-nowrap">{g.label}</p>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap">{g.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex gap-2 items-center bg-card border-t border-border">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Напиши что-нибудь..."
          className="flex-1 px-4 py-2.5 rounded-2xl border border-border bg-secondary text-foreground text-sm outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-default transition-all active:scale-95"
        >
          <Icon name="Send" size={16} />
        </button>
      </div>
    </div>
  );
}
