import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type GameType = "reaction" | "quiz" | "wordguess" | "cityguess" | "aidetective";

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

const JOKES = [
  "Почему программисты не любят природу? Там слишком много багов 🐛",
  "— Доктор, у меня всё болит!\n— Покажите где.\n— Вот, смотрите: тыкаю в ногу — больно, тыкаю в живот — больно...\n— У вас сломан палец 😄",
  "Муж звонит жене: «Дорогая, я выиграл в лотерею миллион! Собирай вещи!» — «Что брать?» — «Что хочешь, я уже уехал» 😂",
  "— Чем отличается мужчина от ребёнка?\n— Ценой игрушек 🎮",
  "Оптимист говорит: стакан наполовину полон. Пессимист: наполовину пуст. Программист: стакан вдвое больше, чем нужно 🥛",
  "— Как дела?\n— Как у Рентгена.\n— Это как?\n— Все просвечиваю, никто не благодарит 😅",
  "Кот смотрит на рыбок в аквариуме и думает: «Телевизор с едой» 🐟",
  "— Папа, а ты умеешь плавать?\n— Умею, сынок.\n— А почему тогда по воде не ходишь? 😄",
  "Wi-Fi пропал. Семья впервые за год увидела друг друга за ужином и выяснила, что у них живёт незнакомый человек 😂",
  "— Дорогой, ты меня любишь?\n— Да.\n— Как сильно?\n— Хватит вопросов, смотри футбол 🙈",
];

const CITIES = [
  { city: "Москва", hints: ["Здесь находится Красная площадь", "Самый большой город России", "Здесь работает метро с 1935 года"] },
  { city: "Санкт-Петербург", hints: ["Город на берегу Финского залива", "Здесь находится Эрмитаж", "Его называют «Северная столица»"] },
  { city: "Казань", hints: ["Столица Татарстана", "Здесь есть Казанский кремль с мечетью Кул-Шариф", "Город двух культур — русской и татарской"] },
  { city: "Новосибирск", hints: ["Крупнейший город Сибири", "Здесь есть знаменитый Академгородок", "Стоит на реке Обь"] },
  { city: "Сочи", hints: ["Курортный город на Черноморском побережье", "Здесь проходили Олимпийские игры 2014 года", "Самый южный крупный город России"] },
  { city: "Владивосток", hints: ["Город у берегов Тихого океана", "Конечная точка Транссибирской магистрали", "Находится дальше Токио по долготе"] },
  { city: "Екатеринбург", hints: ["Стоит на границе Европы и Азии", "Четвёртый город России по численности", "Здесь расстреляли семью Романовых"] },
  { city: "Нижний Новгород", hints: ["Стоит на слиянии Волги и Оки", "Известен знаменитой ярмаркой XIX века", "Родина Максима Горького"] },
  { city: "Калининград", hints: ["Единственный российский эксклав", "Раньше назывался Кёнигсберг", "Стоит на берегу Балтийского моря"] },
  { city: "Ярославль", hints: ["Один из городов Золотого кольца", "Здесь стоит старейший театр России", "Основан Ярославом Мудрым около 1010 года"] },
];

// --- City Guess Game ---
function CityGuessGame({ onResult }: { onResult: (won: boolean, city: string) => void }) {
  const [entry] = useState(() => CITIES[Math.floor(Math.random() * CITIES.length)]);
  const [hintIdx, setHintIdx] = useState(0);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleGuess = () => {
    const guess = input.trim();
    if (!guess) return;
    const correct = guess.toLowerCase() === entry.city.toLowerCase();
    setAttempts(prev => [...prev, guess]);
    setInput("");
    if (correct) {
      setDone(true);
      onResult(true, entry.city);
    } else if (hintIdx < entry.hints.length - 1) {
      setHintIdx(i => i + 1);
    } else {
      setDone(true);
      onResult(false, entry.city);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {entry.hints.slice(0, hintIdx + 1).map((hint, i) => (
          <div key={i} className="flex gap-2 items-start animate-fade-in">
            <span className="text-xs font-bold text-primary flex-shrink-0 mt-0.5">{i + 1}.</span>
            <p className="text-xs text-foreground leading-snug">{hint}</p>
          </div>
        ))}
      </div>
      {hintIdx < entry.hints.length - 1 && !done && (
        <p className="text-[10px] text-muted-foreground">Неверно — открываю следующую подсказку...</p>
      )}
      {attempts.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {attempts.map((a, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-destructive border border-destructive/20">{a}</span>
          ))}
        </div>
      )}
      {!done && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGuess()}
            placeholder="Название города..."
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-secondary text-foreground text-sm outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleGuess}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Ввести
          </button>
        </div>
      )}
    </div>
  );
}

// База городов с признаками для детектива
const AI_CITIES: { name: string; tags: Record<string, boolean> }[] = [
  { name: "Москва",          tags: { столица: true,  миллионник: true,  море: false, сибирь: false, европа: true,  юг: false, север: false, река: true,  порт: false, древний: true  } },
  { name: "Санкт-Петербург", tags: { столица: false, миллионник: true,  море: true,  сибирь: false, европа: true,  юг: false, север: true,  река: true,  порт: true,  древний: true  } },
  { name: "Казань",          tags: { столица: false, миллионник: true,  море: false, сибирь: false, европа: true,  юг: false, север: false, река: true,  порт: false, древний: true  } },
  { name: "Новосибирск",     tags: { столица: false, миллионник: true,  море: false, сибирь: true,  европа: false, юг: false, север: false, река: true,  порт: false, древний: false } },
  { name: "Екатеринбург",    tags: { столица: false, миллионник: true,  море: false, сибирь: false, европа: false, юг: false, север: false, река: true,  порт: false, древний: false } },
  { name: "Сочи",            tags: { столица: false, миллионник: false, море: true,  сибирь: false, европа: true,  юг: true,  север: false, река: false, порт: true,  древний: false } },
  { name: "Владивосток",     tags: { столица: false, миллионник: false, море: true,  сибирь: false, европа: false, юг: false, север: false, река: false, порт: true,  древний: false } },
  { name: "Нижний Новгород", tags: { столица: false, миллионник: true,  море: false, сибирь: false, европа: true,  юг: false, север: false, река: true,  порт: false, древний: true  } },
  { name: "Калининград",     tags: { столица: false, миллионник: false, море: true,  сибирь: false, европа: true,  юг: false, север: false, река: false, порт: true,  древний: true  } },
  { name: "Ярославль",       tags: { столица: false, миллионник: false, море: false, сибирь: false, европа: true,  юг: false, север: false, река: true,  порт: false, древний: true  } },
  { name: "Омск",            tags: { столица: false, миллионник: true,  море: false, сибирь: true,  европа: false, юг: false, север: false, река: true,  порт: false, древний: false } },
  { name: "Красноярск",      tags: { столица: false, миллионник: true,  море: false, сибирь: true,  европа: false, юг: false, север: false, река: true,  порт: false, древний: false } },
  { name: "Ростов-на-Дону",  tags: { столица: false, миллионник: true,  море: false, сибирь: false, европа: true,  юг: true,  север: false, река: true,  порт: false, древний: false } },
  { name: "Астрахань",       tags: { столица: false, миллионник: false, море: true,  сибирь: false, европа: true,  юг: true,  север: false, река: true,  порт: true,  древний: true  } },
  { name: "Мурманск",        tags: { столица: false, миллионник: false, море: true,  сибирь: false, европа: true,  юг: false, север: true,  река: false, порт: true,  древний: false } },
];

const AI_QUESTIONS: { key: keyof typeof AI_CITIES[0]["tags"]; text: string }[] = [
  { key: "столица",  text: "Это столица России?" },
  { key: "миллионник", text: "В этом городе больше миллиона жителей?" },
  { key: "море",     text: "Этот город стоит у моря или океана?" },
  { key: "сибирь",   text: "Этот город находится в Сибири?" },
  { key: "европа",   text: "Этот город в европейской части России?" },
  { key: "юг",       text: "Это южный город (ниже Ростова по широте)?" },
  { key: "север",    text: "Это северный город (севернее Питера)?" },
  { key: "река",     text: "Через город протекает крупная река?" },
  { key: "порт",     text: "Это портовый город?" },
  { key: "древний",  text: "Городу больше 400 лет?" },
];

function AiDetectiveGame({ onResult }: { onResult: (won: boolean) => void }) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState<"asking" | "guessing" | "done">("asking");
  const [guess, setGuess] = useState("");

  const remaining = AI_CITIES.filter(city =>
    Object.entries(answers).every(([key, val]) => city.tags[key as keyof typeof city.tags] === val)
  );

  const nextQuestion = () => {
    // выбираем вопрос, который максимально делит remaining пополам
    const unanswered = AI_QUESTIONS.filter(q => !(q.key in answers));
    if (!unanswered.length || remaining.length <= 1) {
      const top = remaining[0]?.name ?? "Неизвестно";
      setGuess(top);
      setPhase("guessing");
      return;
    }
    const best = unanswered.reduce((prev, cur) => {
      const yes = remaining.filter(c => c.tags[cur.key]).length;
      const balance = Math.abs(yes - remaining.length / 2);
      const prevYes = remaining.filter(c => c.tags[prev.key]).length;
      const prevBalance = Math.abs(prevYes - remaining.length / 2);
      return balance < prevBalance ? cur : prev;
    });
    setQIdx(AI_QUESTIONS.indexOf(best));
  };

  const handleAnswer = (val: boolean) => {
    const key = AI_QUESTIONS[qIdx].key;
    const newAnswers = { ...answers, [key]: val };
    setAnswers(newAnswers);

    const newRemaining = AI_CITIES.filter(city =>
      Object.entries(newAnswers).every(([k, v]) => city.tags[k as keyof typeof city.tags] === v)
    );

    if (newRemaining.length <= 1 || Object.keys(newAnswers).length >= 7) {
      const top = newRemaining[0]?.name ?? "Неизвестно";
      setGuess(top);
      setPhase("guessing");
    } else {
      // пересчитаем следующий вопрос с newAnswers
      const unanswered = AI_QUESTIONS.filter(q => !(q.key in newAnswers));
      if (!unanswered.length) { setGuess(newRemaining[0]?.name ?? "?"); setPhase("guessing"); return; }
      const best = unanswered.reduce((prev, cur) => {
        const yes = newRemaining.filter(c => c.tags[cur.key]).length;
        const balance = Math.abs(yes - newRemaining.length / 2);
        const prevYes = newRemaining.filter(c => c.tags[prev.key]).length;
        const prevBalance = Math.abs(prevYes - newRemaining.length / 2);
        return balance < prevBalance ? cur : prev;
      });
      setQIdx(AI_QUESTIONS.indexOf(best));
    }
  };

  const handleResult = (correct: boolean) => {
    setPhase("done");
    onResult(correct);
  };

  const questionText = AI_QUESTIONS[qIdx]?.text ?? "";
  const askedCount = Object.keys(answers).length;

  return (
    <div className="space-y-3">
      {phase === "asking" && (
        <>
          <p className="text-[10px] text-muted-foreground">Вопрос {askedCount + 1} · осталось городов: {remaining.length}</p>
          <p className="text-sm font-semibold text-foreground leading-snug">{questionText}</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Да ✓
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium border border-border hover:bg-accent transition-colors"
            >
              Нет ✗
            </button>
          </div>
        </>
      )}
      {phase === "guessing" && (
        <>
          <p className="text-sm text-muted-foreground">Я думаю, что это...</p>
          <p className="text-xl font-bold text-primary animate-bounce-in">{guess}?</p>
          <p className="text-xs text-muted-foreground">Угадал?</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleResult(true)}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Да, угадал! 🎉
            </button>
            <button
              onClick={() => handleResult(false)}
              className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium border border-border hover:bg-accent transition-colors"
            >
              Нет 😄
            </button>
          </div>
        </>
      )}
      {phase === "done" && (
        <p className="text-sm text-muted-foreground">Считаем результат...</p>
      )}
    </div>
  );
}

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
    cityguess: "🏙️ Угадай город",
    aidetective: "🤖 ИИ-детектив",
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

  const handleCity = (won: boolean, city: string) => {
    setDone(true);
    onComplete(won ? `Правильно — это ${city}! Отличное знание географии 🗺️` : `Не угадал — это был ${city}. В следующий раз получится 💪`);
  };

  const handleAiDetective = (won: boolean) => {
    setDone(true);
    onComplete(won ? "Угадал! Логика работает на все 100 🤖🎉" : "Не угадал на этот раз — ты перехитрил меня! Уважаю 😄");
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
          {gameType === "cityguess" && <CityGuessGame onResult={handleCity} />}
          {gameType === "aidetective" && <AiDetectiveGame onResult={handleAiDetective} />}
        </>
      )}
    </div>
  );
}

const GAME_CHIPS: { type: GameType; emoji: string; label: string; desc: string }[] = [
  { type: "reaction", emoji: "⚡", label: "Реакция", desc: "Скорость нажатия" },
  { type: "quiz", emoji: "🧠", label: "Викторина", desc: "Ответь на вопрос" },
  { type: "wordguess", emoji: "🔤", label: "Угадай слово", desc: "Буква за буквой" },
  { type: "cityguess", emoji: "🏙️", label: "Угадай город", desc: "По подсказкам" },
  { type: "aidetective", emoji: "🤖", label: "ИИ-детектив", desc: "ИИ угадает твой город" },
];

const JOKE_CHIP = { emoji: "😂", label: "Анекдот", desc: "Случайная шутка" };

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: "bot", text: "Привет! Я здесь, чтобы скрасить твой день 😊 Можем поболтать, сыграть в игру или я расскажу анекдот — пиши «анекдот»!", timestamp: new Date() },
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
    if (lower.match(/анекдот|расскажи|пошути|смешно|смеш|шутк|хаха/)) {
      const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
      botReply(joke);
    } else if (lower.includes("игр")) {
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

  const tellJoke = () => {
    addMessage({ type: "user", text: "Расскажи анекдот 😂" });
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
    botReply(joke, 600);
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
          <button
            onClick={tellJoke}
            className="game-card flex-shrink-0 px-3 py-2.5 flex items-center gap-2.5"
          >
            <span className="text-xl">{JOKE_CHIP.emoji}</span>
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground whitespace-nowrap">{JOKE_CHIP.label}</p>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">{JOKE_CHIP.desc}</p>
            </div>
          </button>
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