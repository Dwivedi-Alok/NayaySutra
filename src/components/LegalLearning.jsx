/* LegalLearningArcade.jsx */
import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
  useCallback,
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

/* shuffle helper that works for arrays AND strings ------------- */
const shuffle = x => {
  const arr = typeof x === 'string' ? x.split('') : [...x]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return typeof x === 'string' ? arr.join('') : arr
}

/* ---------- Audio --------- */
const playSound = (src, volume = 0.25) => {
  try {
    const audio = new Audio(src)
    audio.volume = volume
    audio.play().catch(() => {})
  } catch {}
}

/* ---------- Settings / Theme (Context) --------- */
const SettingsCtx = createContext()
const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useLocal('lla-settings', {
    theme: 'light',
    muted: false,
  })

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
  {
    q: 'What is the minimum age to become the President of India?',
    a: ['25 years', '30 years', '35 years', '40 years'],
    correct: 2,
    exp: 'Article 58 states minimum age for President is 35 years.',
  },
  {
    q: 'Which writ is called the "bulwark of personal freedom"?',
    a: ['Mandamus', 'Habeas Corpus', 'Certiorari', 'Quo Warranto'],
    correct: 1,
    exp: 'Habeas Corpus literally means "you must have the body" and protects against illegal detention.',
  },
]

const LEGAL_TERMS = [
  'plaintiff',
  'defendant',
  'judiciary',
  'affidavit',
  'jurisdiction',
  'precedent',
  'subjudice',
  'appellant',
  'respondent',
  'bailiff',
]

const TF_STATEMENTS = [
  {
    s: 'A writ of Habeas Corpus may be issued by the Supreme Court only.',
    t: false,
    exp: 'High Courts too can issue Habeas Corpus under Art. 226.',
  },
  { s: 'Mens rea is an essential element in strict-liability offences.', t: false, exp: 'Strict liability dispenses with mens rea.' },
  { s: 'Article 19 can be suspended during a National Emergency.', t: true, exp: 'Art. 358 provides for automatic suspension.' },
  { s: 'The Indian Constitution is the longest written constitution.', t: true, exp: 'With 448 articles and 12 schedules originally.' },
  { s: 'A Judge of the Supreme Court can practice after retirement.', t: false, exp: 'Article 124(7) prohibits practice after retirement.' },
]

const LEGAL_MATCHES = [
  { term: 'Habeas Corpus', def: 'Produce the body' },
  { term: 'Mandamus', def: 'We command' },
  { term: 'Certiorari', def: 'To be certified' },
  { term: 'Quo Warranto', def: 'By what authority' },
  { term: 'Res Judicata', def: 'Matter already judged' },
  { term: 'Caveat Emptor', def: 'Buyer beware' },
]

const SPEED_PHRASES = [
  'Justice delayed is justice denied',
  'Ignorance of law is no excuse',
  'Innocent until proven guilty',
  'Beyond reasonable doubt',
  'Audi alteram partem',
]

/* ------------------------------------------------------------------ */
/* ----------------------  QUIZ MASTER  ----------------------------- */
/* ------------------------------------------------------------------ */
function QuizMaster({ onExit, onHighScore }) {
  const [questions] = useState(() => shuffle(QUIZ_QUESTIONS))
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showExp, setShowExp] = useState(false)
  const [timeLeft, setTime] = useState(15)
  const [paused, setPaused] = useState(false)
  const [lifelineUsed, setLife] = useState(false)
  const [hintUsed, setHint] = useState(false)
  const [review, setReview] = useState([])
  const [isFinished, setIsFinished] = useState(false)
  const { muted } = useSettings()

  const q = questions[idx]

  useEffect(() => {
    if (showExp || paused || isFinished || !q) return
    const id = setInterval(() => {
      setTime(t => {
        if (t === 1) {
          handleNext()
          return 15
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [idx, showExp, paused, isFinished])

  const handleNext = () => {
    if (!q || isFinished) return

    const correct = selected === q.correct
    if (correct) setScore(s => s + 1)
    if (!muted) playSound(correct ? '/sfx/correct.mp3' : '/sfx/wrong.mp3')
    
    setShowExp(true)
    setReview(r => [
      ...r,
      { q: q.q, a: q.a, user: selected, correct: q.correct, exp: q.exp },
    ])
  }

  const handleContinue = () => {
    if (idx === questions.length - 1) {
      setIsFinished(true)
      if (!muted) playSound('/sfx/finish.mp3')
      onHighScore('quiz', score)
    } else {
      setShowExp(false)
      setSelected(null)
      setIdx(i => i + 1)
      setTime(15)
      setLife(false)
      setHint(false)
    }
  }

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow animate-fadeIn">
        <h2 className="text-3xl font-bold mb-4 text-center">🎉 Quiz Completed!</h2>
        <div className="text-center mb-6">
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {score}/{questions.length}
          </p>
          <p className="text-lg">
            {score >= questions.length * 0.8 ? '🌟 Excellent!' : 
             score >= questions.length * 0.6 ? '👍 Good job!' : 
             '💪 Keep practicing!'}
          </p>
        </div>

        <details className="mb-4">
          <summary className="cursor-pointer underline text-center">Review Answers</summary>
          <ul className="mt-4 max-h-64 overflow-y-auto space-y-3 pr-2">
            {review.map((r, i) => (
              <li key={i} className="border rounded p-3 text-sm">
                <p className="font-medium mb-1">Q{i + 1}: {r.q}</p>
                <p className={`mb-1 ${r.user === r.correct ? 'text-green-600' : 'text-red-600'}`}>
                  Your answer: {r.user !== null ? r.a[r.user] : 'Not answered'}
                </p>
                {r.user !== r.correct && (
                  <p className="text-green-600 mb-1">Correct: {r.a[r.correct]}</p>
                )}
                <p className="italic text-gray-600 dark:text-gray-400">{r.exp}</p>
              </li>
            ))}
          </ul>
        </details>

        <button
          onClick={onExit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded font-semibold transition"
        >
          Back to Menu
        </button>
      </div>
    )
  }

  if (!q) return null

  const visible = useMemo(() => {
    if (!lifelineUsed) return [0, 1, 2, 3]
    const wrong = [0, 1, 2, 3].filter(i => i !== q.correct)
    while (wrong.length > 2) wrong.splice(Math.floor(Math.random() * wrong.length), 1)
    return shuffle([q.correct, ...wrong])
  }, [lifelineUsed, q])

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold">
          Question {idx + 1}/{questions.length}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPaused(p => !p)}
            className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition"
          >
            {paused ? '▶️' : '⏸️'}
          </button>
                  <span className={`font-mono text-sm ${timeLeft <= 5 ? 'text-red-600' : ''}`}>
            ⏱ {timeLeft}s
          </span>
        </div>
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-1000"
          style={{ width: `${(idx / questions.length) * 100}%` }}
        />
      </div>

      <h2 className="text-lg font-semibold mb-4">{q.q}</h2>

      {hintUsed && (
        <p className="italic text-sm mb-2 text-purple-600">
          💡 Hint: answer starts with <strong>{q.a[q.correct][0]}</strong>
        </p>
      )}

      <ul className="space-y-2">
        {q.a.map((opt, i) =>
          visible.includes(i) ? (
            <li key={i}>
              <button
                disabled={showExp}
                onClick={() => setSelected(i)}
                className={`w-full text-left px-4 py-3 rounded border transition ${
                  selected === i 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                } ${showExp ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {opt}
              </button>
            </li>
          ) : null
        )}
      </ul>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <button
          disabled={lifelineUsed || showExp}
          onClick={() => setLife(true)}
          className="bg-yellow-500 text-white py-2 rounded disabled:opacity-40 hover:bg-yellow-600 transition"
        >
          50-50
        </button>
        <button
          disabled={hintUsed || showExp}
          onClick={() => {
            setHint(true)
            if (score > 0) setScore(s => s - 0.5)
          }}
          className="bg-purple-600 text-white py-2 rounded disabled:opacity-40 hover:bg-purple-700 transition"
        >
          Hint (-0.5)
        </button>
        <button
          disabled={selected === null || showExp}
          onClick={handleNext}
          className="bg-green-600 text-white py-2 rounded disabled:opacity-40 hover:bg-green-700 transition"
        >
          Submit
        </button>
      </div>

      {showExp && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded animate-fadeIn">
          <p className="mb-2 font-medium text-lg">
            {selected === q.correct ? '✅ Correct!' : '❌ Incorrect'}
          </p>
          <p className="text-sm mb-3">{q.exp}</p>
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            {idx === questions.length - 1 ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* --------------------  WORD SCRAMBLE GAME  ------------------------ */
/* ------------------------------------------------------------------ */
function WordScramble({ onExit, onHighScore }) {
  const [terms] = useState(() => shuffle(LEGAL_TERMS))
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTime] = useState(30)
  const [paused, setPaused] = useState(false)
  const [hintUsed, setHint] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const { muted } = useSettings()

  const term = terms[idx]
  const scrambled = useMemo(() => {
    let scrambleAttempt = shuffle(term)
    while (scrambleAttempt === term && term.length > 2) {
      scrambleAttempt = shuffle(term)
    }
    return scrambleAttempt
  }, [term])

  useEffect(() => {
    if (paused || isFinished || !term) return
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
  }, [idx, paused, isFinished])

  const handleSubmit = () => {
    if (input.trim().toLowerCase() === term.toLowerCase()) {
      const pts = timeLeft >= 20 ? 3 : timeLeft >= 10 ? 2 : 1
      setScore(s => s + pts)
      if (!muted) playSound('/sfx/correct.mp3')
    } else if (!muted) {
      playSound('/sfx/wrong.mp3')
    }
    handleSkip()
  }

  const handleSkip = () => {
    if (idx === terms.length - 1) {
      setIsFinished(true)
      if (!muted) playSound('/sfx/finish.mp3')
      onHighScore('scramble', score)
    } else {
      setInput('')
      setIdx(i => i + 1)
      setTime(30)
      setHint(false)
    }
  }

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow text-center animate-fadeIn">
        <h2 className="text-3xl font-bold mb-4">🎊 Scramble Complete!</h2>
        <div className="mb-6">
          <p className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
            {score}
          </p>
          <p className="text-lg">Points Earned</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Max possible: {terms.length * 3}
          </p>
        </div>
        <button
          onClick={onExit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded font-semibold transition"
        >
          Back to Menu
        </button>
      </div>
    )
  }

  if (!term) return null

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow text-center">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm">Word {idx + 1}/{terms.length}</span>
        <span className={`font-mono text-sm ${timeLeft <= 10 ? 'text-red-600' : ''}`}>
          ⏱ {timeLeft}s
        </span>
      </div>

      <h2 className="text-lg font-semibold mb-4">Unscramble the Legal Term</h2>
      <p className="text-4xl font-mono tracking-widest mb-6 text-blue-600 dark:text-blue-400">
        {scrambled}
      </p>

      {hintUsed && (
        <p className="italic text-sm mb-3 text-purple-600">
          💡 Hint: starts with <strong>"{term[0]}"</strong> and has {term.length} letters
        </p>
      )}

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type the correct term"
        className="w-full border-2 rounded px-4 py-3 mb-4 dark:bg-gray-700 text-center text-lg"
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        autoFocus
      />

      <div className="flex space-x-2 justify-center mb-4">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
        >
          Submit
        </button>
        <button
          onClick={handleSkip}
          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded transition"
        >
          Skip
        </button>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setPaused(p => !p)}
          className="text-xs px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <div className="text-sm">
          Points: <span className="font-bold">{timeLeft >= 20 ? 3 : timeLeft >= 10 ? 2 : 1}</span>
        </div>
        <button
          disabled={hintUsed}
          onClick={() => {
            setHint(true)
            if (score > 0) setScore(s => s - 1)
          }}
          className="text-xs px-3 py-1 bg-purple-600 text-white rounded disabled:opacity-40 hover:bg-purple-700 transition"
        >
          Hint (-1)
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* --------------------  TRUE / FALSE RUSH  ------------------------- */
/* ------------------------------------------------------------------ */
function TrueFalseRush({ onExit, onHighScore }) {
  const [statements] = useState(() => shuffle(TF_STATEMENTS))
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [showExp, setShowExp] = useState(false)
  const [lastAnswer, setLastAnswer] = useState(null)
  const [isFinished, setIsFinished] = useState(false)
  const { muted } = useSettings()

  const handleAnswer = (choice) => {
    const st = statements[idx]
    const correct = choice === st.t
    setLastAnswer({ correct, exp: st.exp })
    
    if (correct) {
      setScore(s => s + 1)
      if (!muted) playSound('/sfx/correct.mp3')
    } else if (!muted) {
      playSound('/sfx/wrong.mp3')
    }
    
    setShowExp(true)
    setTimeout(() => {
      if (idx === statements.length - 1) {
        setIsFinished(true)
        if (!muted) playSound('/sfx/finish.mp3')
        onHighScore('tf', score + (correct ? 1 : 0))
      } else {
        setIdx(i => i + 1)
        setShowExp(false)
        setLastAnswer(null)
      }
    }, 2000)
  }

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow text-center animate-fadeIn">
        <h2 className="text-3xl font-bold mb-4">⚡ Rush Complete!</h2>
        <div className="mb-6">
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {score}/{statements.length}
          </p>
          <p className="text-lg">
            {score === statements.length ? '🏆 Perfect!' : 
             score >= statements.length * 0.7 ? '🌟 Great!' : 
             '💪 Good effort!'}
          </p>
        </div>
        <button
          onClick={onExit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded font-semibold transition"
        >
          Back to Menu
        </button>
      </div>
    )
  }

  const st = statements[idx]
  if (!st) return null

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow text-center">
      <p className="text-sm mb-4">Statement {idx + 1}/{statements.length}</p>
      
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded">
        <p className="text-lg font-medium">{st.s}</p>
      </div>

      {!showExp ? (
        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => handleAnswer(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
          >
            TRUE
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
          >
            FALSE
          </button>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <p className={`text-2xl font-bold mb-2 ${lastAnswer.correct ? 'text-green-600' : 'text-red-600'}`}>
            {lastAnswer.correct ? '✓ Correct!' : '✗ Wrong!'}
          </p>
          <p className="text-sm italic">{lastAnswer.exp}</p>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* --------------------  MATCH THE PAIRS  --------------------------- */
/* ------------------------------------------------------------------ */
function MatchThePairs({ onExit, onHighScore }) {
  const [pairs] = useState(() => {
    const shuffled = shuffle(LEGAL_MATCHES)
    return {
      terms: shuffled.map(p => ({ text: p.term, id: p.term })),
      defs: shuffle(shuffled.map(p => ({ text: p.def, id: p.term })))
    }
  })
  
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [selectedDef, setSelectedDef] = useState(null)
  const [matched, setMatched] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const { muted } = useSettings()

  useEffect(() => {
    if (isFinished) return
    const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [isFinished])

  useEffect(() => {
    if (selectedTerm && selectedDef) {
      setAttempts(a => a + 1)
      if (selectedTerm === selectedDef) {
        setMatched(m => [...m, selectedTerm])
        if (!muted) playSound('/sfx/correct.mp3')
        
        if (matched.length + 1 === pairs.terms.length) {
          setIsFinished(true)
          if (!muted) playSound('/sfx/finish.mp3')
          const score = Math.max(0, 100 - attempts * 5 - Math.floor(timeElapsed / 10))
          onHighScore('match', score)
        }
      } else {
        if (!muted) playSound('/sfx/wrong.mp3')
      }
      
      setTimeout(() => {
        setSelectedTerm(null)
        setSelectedDef(null)
      }, 500)
    }
  }, [selectedTerm, selectedDef])

  if (isFinished) {
    const score = Math.max(0, 100 - attempts * 5 - Math.floor(timeElapsed / 10))
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow text-center animate-fadeIn">
        <h2 className="text-3xl font-bold mb-4">🎯 Matching Complete!</h2>
        <div className="mb-6 space-y-2">
          <p className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {score}
          </p>
          <p className="text-sm">Time: {timeElapsed}s</p>
          <p className="text-sm">Attempts: {attempts}</p>
          <p className="text-sm">Accuracy: {Math.round((pairs.terms.length / attempts) * 100)}%</p>
        </div>
        <button
          onClick={onExit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded font-semibold transition"
        >
          Back to Menu
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Match Legal Terms</h2>
        <div className="text-sm">
          <span className="mr-4">⏱ {timeElapsed}s</span>
          <span>Matched: {matched.length}/{pairs.terms.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Terms</h3>
          {pairs.terms.map(term => (
            <button
              key={term.id}
              onClick={() => !matched.includes(term.id) && setSelectedTerm(term.id)}
              disabled={matched.includes(term.id)}
              className={`w-full text-left px-4 py-3 mb-2 rounded transition ${
                matched.includes(term.id)
                  ? 'bg-green-100 dark:bg-green-900 opacity-50'
                  : selectedTerm === term.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {term.text}
            </button>
          ))}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Definitions</h3>
          {pairs.defs.map((def, idx) => (
            <button
              key={idx}
              onClick={() => !matched.includes(def.id) && setSelectedDef(def.id)}
              disabled={matched.includes(def.id)}
              className={`w-full text-left px-4 py-3 mb-2 rounded transition ${
                matched.includes(def.id)
                  ? 'bg-green-100 dark:bg-green-900 opacity-50'
                  : selectedDef === def.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {def.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* --------------------  SPEED TYPING  ------------------------------ */
/* ------------------------------------------------------------------ */
function SpeedTyping({ onExit, onHighScore }) {
  const [phrases] = useState(() => shuffle(SPEED_PHRASES))
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [errors, setErrors] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const { muted } = useSettings()

  const phrase = phrases[idx]

  useEffect(() => {
    if (input && !startTime) {
      setStartTime(Date.now())
    }
  }, [input, startTime])

  const calculateWPM = () => {
    if (!startTime) return 0
    const minutes = (Date.now() - startTime) / 60000
    const words = input.trim().split(' ').length
    return Math.round(words / minutes)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInput(value)

    // Check for errors
    if (value.length > input.length) {
      const newChar = value[value.length - 1]
      const expectedChar = phrase[value.length - 1]
      if (newChar !== expectedChar) {
        setErrors(err => err + 1)
        if (!muted) playSound('/sfx/wrong.mp3', 0.1)
      }
    }

    // Check if completed
    if (value === phrase) {
      const finalWPM = calculateWPM()
      setWpm(finalWPM)
      if (!muted) playSound('/sfx/correct.mp3')
      
      setTimeout(() => {
        if (idx === phrases.length - 1) {
          setIsFinished(true)
          if (!muted) playSound('/sfx/finish.mp3')
          const score = Math.max(0, finalWPM * 2 - errors * 5)
          onHighScore('typing', score)
        } else {
          setIdx(i => i + 1)
          setInput('')
          setStartTime(null)
        }
      }, 1000)
    }
  }

  if (isFinished) {
    const avgWPM = Math.round(wpm / phrases.length)
    const accuracy = Math.round(((phrase.length - errors) / phrase.length) * 100)
    const score = Math.max(0, avgWPM * 2 - errors * 5)
    
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow text-center animate-fadeIn">
        <h2 className="text-3xl font-bold mb-4">⌨️ Typing Complete!</h2>
        <div className="mb-6 space-y-2">
          <p className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            {score}
          </p>
          <p className="text-lg">Average WPM: {avgWPM}</p>
          <p className="text-sm">Total Errors: {errors}</p>
          <p className="text-sm">Accuracy: {accuracy}%</p>
        </div>
        <button
          onClick={onExit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded font-semibold transition"
        >
          Back to Menu
        </button>
      </div>
    )
  }

  if (!phrase) return null

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Speed Typing Challenge</h2>
        <div className="text-sm">
          Phrase {idx + 1}/{phrases.length}
        </div>
      </div>

      <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded">
        <p className="text-xl font-serif leading-relaxed">
          {phrase.split('').map((char, i) => (
            <span
              key={i}
              className={
                i < input.length
                  ? input[i] === char
                    ? 'text-green-600'
                    : 'text-red-600 underline'
                  : ''
              }
            >
              {char}
            </span>
          ))}
        </p>
      </div>

      <input
        value={input}
        onChange={handleInputChange}
        placeholder="Start typing..."
        className="w-full border-2 rounded px-4 py-3 mb-4 dark:bg-gray-700 text-lg"
        autoFocus
      />

      <div className="flex justify-between text-sm">
        <span>WPM: {startTime ? calculateWPM() : 0}</span>
        <span>Errors: {errors}</span>
        <span>Progress: {Math.round((input.length / phrase.length) * 100)}%</span>
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
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded shadow p-6 text-center space-y-4 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6">⚙️ Settings</h2>
        
        <button
          onClick={toggleTheme}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition flex items-center justify-center space-x-2"
        >
          <span>{theme === 'light' ? '🌙' : '☀️'}</span>
          <span>Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
        </button>
        
        <button
          onClick={toggleMute}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition flex items-center justify-center space-x-2"
        >
          <span>{muted ? '🔇' : '🔊'}</span>
          <span>Sound: {muted ? 'Muted' : 'On'}</span>
        </button>
        
        <hr className="my-4" />
        
        <button
          onClick={onBack}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded transition"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ----------------------------  MENU  ------------------------------ */
/* ------------------------------------------------------------------ */
const GAMES = [
  { name: '📚 Quiz Master',      key: 'quiz',     component: QuizMaster,    color: 'blue' },
  { name: '🔤 Word Scramble',    key: 'scramble', component: WordScramble,  color: 'green' },
  { name: '⚡ True/False Rush',  key: 'tf',       component: TrueFalseRush, color: 'red' },
  { name: '🎯 Match the Pairs',  key: 'match',    component: MatchThePairs, color: 'purple' },
  { name: '⌨️ Speed Typing',     key: 'typing',   component: SpeedTyping,   color: 'orange' },
]

export default function LegalLearningArcade() {
  const [screen, setScreen] = useState('menu')
  const [gameIdx, setGameIdx] = useState(null)
  const [high, setHigh] = useLocal('lla-highscores', {
    quiz: 0,
    scramble: 0,
    tf: 0,
    match: 0,
    typing: 0,
  })

  const updateHighScore = (key, val) =>
    setHigh(h => (val > h[key] ? { ...h, [key]: val } : h))

  let content
  if (screen === 'settings') {
    content = <Settings onBack={() => setScreen('menu')} />
  } else if (screen === 'game' && gameIdx !== null) {
    const GameCmp = GAMES[gameIdx].component
    content = (
      <GameCmp
        onExit={() => {
          setScreen('menu')
          setGameIdx(null)
        }}
        onHighScore={updateHighScore}
      />
    )
  } else {
    content = (
      <div className="w-full max-w-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow-xl p-8 animate-fadeIn">
                <h1 className="text-3xl font-bold text-center mb-8">
          ⚖️ Legal Learning Arcade
        </h1>

        <div className="space-y-3 mb-6">
          {GAMES.map((g, i) => (
            <button
              key={g.key}
              onClick={() => {
                setGameIdx(i)
                setScreen('game')
              }}
              className={`w-full bg-${g.color}-600 hover:bg-${g.color}-700 text-white py-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
              style={{
                backgroundColor: 
                  g.color === 'blue' ? '#2563eb' :
                  g.color === 'green' ? '#16a34a' :
                  g.color === 'red' ? '#dc2626' :
                  g.color === 'purple' ? '#9333ea' :
                  g.color === 'orange' ? '#ea580c' : '#2563eb'
              }}
            >
              <span className="text-lg font-semibold">{g.name}</span>
              <span className="block text-sm opacity-90 mt-1">
                High Score: {high[g.key] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setScreen('settings')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition"
          >
            ⚙️ Settings
          </button>
          
          <button
            onClick={() => {
              if (confirm('Reset all high scores?')) {
                setHigh({ quiz: 0, scramble: 0, tf: 0, match: 0, typing: 0 })
              }
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition"
          >
            🔄 Reset Scores
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Learn legal concepts through fun games!</p>
          <p className="mt-2">Total Score: {Object.values(high).reduce((a, b) => a + b, 0)}</p>
        </div>
      </div>
    )
  }

  return (
    <SettingsProvider>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
        {content}
      </div>
      
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </SettingsProvider>
  )
}