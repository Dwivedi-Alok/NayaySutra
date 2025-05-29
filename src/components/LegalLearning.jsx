/* LegalLearningArcade.jsx */
import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from 'react'

/* ------------------------------------------------------------------ */
/* -----------------------  GLOBAL HELPERS  ------------------------- */
/* ------------------------------------------------------------------ */
const useLocal = (key, init) => {
  const [val, setVal] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : init
    } catch {
      return init
    }
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(val)), [key, val])
  return [val, setVal]
}

/* ---------- Audio --------- */
const beep = src => {
  const audio = new Audio(src)
  audio.volume = 0.25
  return audio
}
const SFX = {
  correct: beep('/sfx/correct.mp3'),
  wrong:   beep('/sfx/wrong.mp3'),
  finish:  beep('/sfx/finish.mp3'),
}

/* ---------- Settings / Theme (Context) --------- */
const SettingsCtx = createContext()

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useLocal('lla-settings', {
    theme: 'light',
    muted: false,
  })

  /* side-effect: attach / detach `dark` class on <html> */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
  }, [settings.theme])

  const value = {
    theme: settings.theme,
    muted: settings.muted,
    toggleTheme: () =>
      setSettings(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' })),
    toggleMute: () => setSettings(s => ({ ...s, muted: !s.muted })),
  }
  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>
}

const useSettings = () => useContext(SettingsCtx)

/* ------------------------------------------------------------------ */
/* --------------------------  DATA  -------------------------------- */
/* ------------------------------------------------------------------ */
const QUIZ_QUESTIONS = [
  {
    q: 'What is the limitation period for filing a civil suit in India?',
    a: ['1 year', '2 years', '3 years', '10 years'],
    correct: 2,
    exp: 'Under the Limitation Act, the general limitation period for suits relating to contracts/torts is 3 years (Art. 113).',
  },
  {
    q: 'Which Article of the Constitution guarantees the Right to Equality?',
    a: ['Article 14', 'Article 19', 'Article 21', 'Article 32'],
    correct: 0,
    exp: 'Article 14 guarantees equality before law and equal protection of laws.',
  },
  // …add more as required
]

const LEGAL_TERMS = [
  'plaintiff',
  'defendant',
  'judiciary',
  'affidavit',
  'jurisdiction',
  'precedent',
  'subjudice',
]

/* ------------------------------------------------------------------ */
/* ----------------------  QUIZ GAME  ------------------------------- */
/* ------------------------------------------------------------------ */
function QuizMaster({ onExit, onHighScore }) {
  const [idx, setIdx]           = useState(0)
  const [score, setScore]       = useState(0)
  const [selected, setSelected] = useState(null)
  const [showExp, setShowExp]   = useState(false)
  const [timeLeft, setTime]     = useState(15)
  const [paused, setPaused]     = useState(false)
  const [lifelineUsed, setLife] = useState(false)   // 50-50
  const [hintUsed, setHint]     = useState(false)   // new lifeline
  const [review, setReview]     = useState([])      // for summary
  const { muted }               = useSettings()

  const q = QUIZ_QUESTIONS[idx]

  /* timer */
  useEffect(() => {
    if (showExp || paused) return
    const id = setInterval(() => {
      setTime(t => {
        if (t === 1) {
          handleNext(false)
          return 15
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [idx, showExp, paused])

  const handleNext = () => {
    const correct = selected === q.correct
    if (correct) setScore(s => s + 1)
    if (!muted) (correct ? SFX.correct : SFX.wrong).play()
    setShowExp(true)
    setReview(r => [
      ...r,
      {
        q: q.q,
        a: q.a,
        user: selected,
        correct: q.correct,
        exp: q.exp,
      },
    ])
  }

  const handleContinue = () => {
    setShowExp(false)
    setSelected(null)
    setIdx(i => i + 1)
    setTime(15)
    setLife(false)
    setHint(false)
  }

  const useFifty = () => setLife(true)
  const useHint  = () => {
    setHint(true)
    if (score > 0) setScore(s => s - 0.5)
  }

  /* finished */
  if (idx >= QUIZ_QUESTIONS.length) {
    if (!muted) SFX.finish.play()
    onHighScore('quiz', score)
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <p className="text-xl mb-2">
          Score: {score} / {QUIZ_QUESTIONS.length}
        </p>

        {/* Review panel */}
        <details className="mb-4">
          <summary className="cursor-pointer underline">Review Questions</summary>
          <ul className="mt-2 max-h-64 overflow-y-auto space-y-3 pr-2">
            {review.map((r, i) => (
              <li key={i} className="border rounded p-2 text-sm">
                <p className="font-medium">{i + 1}. {r.q}</p>
                <p>
                  Your answer:{' '}
                  <span className={r.user === r.correct ? 'text-green-600' : 'text-red-600'}>
                    {r.a[r.user] ?? '—'}
                  </span>
                </p>
                {r.user !== r.correct && (
                  <p className="text-green-700">Correct: {r.a[r.correct]}</p>
                )}
                <p className="italic">{r.exp}</p>
              </li>
            ))}
          </ul>
        </details>

        <button
          onClick={onExit}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Back to Menu
        </button>
      </div>
    )
  }

  /* options to display */
  const visible = useMemo(() => {
    if (!lifelineUsed) return [0, 1, 2, 3]
    const wrong = [0, 1, 2, 3].filter(i => i !== q.correct)
    while (wrong.length > 2) wrong.splice(Math.floor(Math.random() * wrong.length), 1)
    return [q.correct, ...wrong].sort()
  }, [lifelineUsed, q.correct])

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow">
      {/* header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm">
          Question {idx + 1}/{QUIZ_QUESTIONS.length}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPaused(p => !p)}
            className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded"
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <span className="font-mono text-sm">⏱ {timeLeft}s</span>
        </div>
      </div>

      {/* progress bar */}
      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${(idx / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <h2 className="text-lg font-semibold mb-4">{q.q}</h2>

      {hintUsed && (
        <p className="italic text-sm mb-2">
          Hint: answer starts with <strong>{q.a[q.correct][0]}</strong>
        </p>
      )}

      <ul className="space-y-2">
        {q.a.map((opt, i) =>
          visible.includes(i) && (
            <li key={i}>
              <button
                disabled={showExp}
                onClick={() => setSelected(i)}
                className={`w-full text-left px-4 py-2 rounded border ${
                  selected === i ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                {opt}
              </button>
            </li>
          ),
        )}
      </ul>

      {/* controls */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <button
          disabled={lifelineUsed || showExp}
          onClick={useFifty}
          className="bg-yellow-500 text-white py-2 rounded disabled:opacity-40"
        >
          50-50
        </button>
        <button
          disabled={hintUsed || showExp}
          onClick={useHint}
          className="bg-purple-600 text-white py-2 rounded disabled:opacity-40"
        >
          Hint
        </button>
        <button
          disabled={selected === null || showExp}
          onClick={handleNext}
          className="bg-green-600 text-white py-2 rounded disabled:opacity-40"
        >
          {idx === QUIZ_QUESTIONS.length - 1 ? 'Finish' : 'Submit'}
        </button>
      </div>

      {/* explanation */}
      {showExp && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="mb-2 font-medium">
            {selected === q.correct ? '✅ Correct!' : '❌ Incorrect.'}
          </p>
          <p className="text-sm">{q.exp}</p>
          <button
            onClick={handleContinue}
            className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* --------------------  WORD SCRAMBLE GAME  ------------------------ */
/* ------------------------------------------------------------------ */
const shuffle = str => {
  const arr = str.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

function WordScramble({ onExit, onHighScore }) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTime] = useState(30)
  const [paused, setPaused] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const { muted } = useSettings()

  const term = LEGAL_TERMS[idx]
  const scrambled = useMemo(() => shuffle(term), [idx, term])

  /* timer */
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setTime(t => {
        if (t === 1) {
          handleSkip()
          return 30
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [idx, paused])

  const handleSubmit = () => {
    if (input.trim().toLowerCase() === term.toLowerCase()) {
      const pts = timeLeft >= 20 ? 3 : timeLeft >= 10 ? 2 : 1
      setScore(s => s + pts)
      if (!muted) SFX.correct.play()
    } else if (!muted) {
      SFX.wrong.play()
    }
    handleSkip()
  }

  const handleSkip = () => {
    setInput('')
    setIdx(i => i + 1)
    setTime(30)
    setHintUsed(false)
  }

  const giveHint = () => {
    setHintUsed(true)
    if (score > 0) setScore(s => s - 1)
  }

  /* finished */
  if (idx >= LEGAL_TERMS.length) {
    if (!muted) SFX.finish.play()
    onHighScore('scramble', score)
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Scramble Finished!</h2>
        <p className="text-xl mb-4">Score: {score}</p>
        <button
          onClick={onExit}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Back to Menu
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow text-center">
      <h2 className="text-lg font-semibold mb-2">Unscramble the term</h2>
      <p className="text-3xl font-mono tracking-widest mb-4">{scrambled}</p>

      {hintUsed && (
        <p className="italic text-sm mb-2">
          Hint: begins with <strong>{term[0]}</strong>
        </p>
      )}

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type the correct term"
        className="w-full border rounded px-3 py-2 mb-4 dark:bg-gray-700"
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />

      <div className="flex space-x-2 justify-center">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
        <button
          onClick={handleSkip}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Skip
        </button>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPaused(p => !p)}
          className="text-xs px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <p className="font-mono text-sm">⏱ {timeLeft}s</p>
        <button
          disabled={hintUsed}
          onClick={giveHint}
          className="text-xs px-3 py-1 bg-purple-600 text-white rounded disabled:opacity-40"
        >
          Hint
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* -----------------------  SETTINGS PAGE --------------------------- */
/* ------------------------------------------------------------------ */
function Settings({ onBack }) {
  const { theme, muted, toggleTheme, toggleMute } = useSettings()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded shadow p-6 text-center space-y-4">
        <h2 className="text-xl font-bold">Settings</h2>
        <button
          onClick={toggleTheme}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Toggle Theme ({theme})
        </button>
        <button
          onClick={toggleMute}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {muted ? 'Un-mute Sounds' : 'Mute Sounds'}
        </button>
        <button
          onClick={onBack}
          className="w-full bg-gray-500 text-white py-2 rounded"
        >
          Back
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ---------------------------  MENU  ------------------------------- */
/* ------------------------------------------------------------------ */
const GAMES = [
  { name: 'Quiz Master',   component: QuizMaster },
  { name: 'Word Scramble', component: WordScramble },
]

export default function LegalLearningArcade() {
  const [screen, setScreen] = useState('menu') // menu | settings | game
  const [gameIdx, setGameIdx] = useState(null)
  const [high, setHigh] = useLocal('lla-highscores', { quiz: 0, scramble: 0 })

  const updateHighScore = (key, val) =>
    setHigh(h => (val > h[key] ? { ...h, [key]: val } : h))

  /* decide which screen to render */
  let content
  if (screen === 'settings')
    content = <Settings onBack={() => setScreen('menu')} />
  else if (screen === 'game') {
    const GameCmp = GAMES[gameIdx].component
    content = (
      <GameCmp
        onExit={() => setScreen('menu')}
        onHighScore={updateHighScore}
      />
    )
  } else {
    /* main menu */
    content = (
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded shadow p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Legal Learning Arcade</h1>

        {GAMES.map((g, i) => (
          <button
            key={g.name}
            onClick={() => {
              setGameIdx(i)
              setScreen('game')
            }}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            {g.name}
            <span className="block text-xs opacity-75">
              High Score: {i === 0 ? high.quiz : high.scramble}
            </span>
          </button>
        ))}

        <button
          onClick={() => setScreen('settings')}
          className="w-full bg-gray-500 text-white py-3 rounded"
        >
          Settings
        </button>
      </div>
    )
  }

  /* wrap with theme / settings provider */
  return (
    <SettingsProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
        {content}
      </div>
    </SettingsProvider>
  )
}