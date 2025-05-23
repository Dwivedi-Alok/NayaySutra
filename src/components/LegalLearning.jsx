/* LegalLearningArcade.jsx */
import React, { useState, useEffect, useMemo, useCallback } from 'react'

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
  // add as many as you wish …
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
function QuizMaster({ onExit }) {
  const [idx, setIdx]           = useState(0)
  const [score, setScore]       = useState(0)
  const [selected, setSelected] = useState(null)
  const [showExp, setShowExp]   = useState(false)
  const [timeLeft, setTime]     = useState(15)
  const [lifelineUsed, setLife] = useState(false)

  const q = QUIZ_QUESTIONS[idx]

  /* ------------ timer ------------ */
  useEffect(() => {
    if (showExp) return               // pause timer while explanation is shown
    const id = setInterval(() => {
      setTime(t => {
        if (t === 1) {                // auto-move when time hits 0
          handleNext(false)
          return 15
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, showExp])

  /* ------------ helpers ------------ */
  const handleSelect = i => setSelected(i)

  const handleNext = (fromButton = true) => {
    // fromButton === false means: called by timer expiry
    if (selected === q.correct) setScore(s => s + 1)
    setShowExp(true)
  }

  const handleContinue = () => {
    setShowExp(false)
    setSelected(null)
    setIdx(i => i + 1)
    setTime(15)
  }

  const useFifty = () => {
    setLife(true)
  }

  /* ------------ finished ------------ */
  if (idx >= QUIZ_QUESTIONS.length)
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <p className="text-xl mb-4">
          Score: {score} / {QUIZ_QUESTIONS.length}
        </p>
        <button
          onClick={onExit}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Back to Menu
        </button>
      </div>
    )

  /* ------------ options to show (respect 50-50) ------------ */
  const visibleIndexes = useMemo(() => {
    if (!lifelineUsed) return [0, 1, 2, 3]
    // Remove two wrong answers randomly
    const wrong = [0, 1, 2, 3].filter(i => i !== q.correct)
    // choose two to remove
    while (wrong.length > 2) wrong.splice(Math.floor(Math.random() * wrong.length), 1)
    return [q.correct, ...wrong].sort()
  }, [lifelineUsed, q.correct])

  /* ------------ render ------------ */
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      {/* Timer & Progress */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm">
          Question {idx + 1}/{QUIZ_QUESTIONS.length}
        </span>
        <span className="font-mono text-sm">⏱ {timeLeft}s</span>
      </div>
      <div className="h-2 bg-gray-200 rounded mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${((idx + selected !== null ? 1 : 0) ) / QUIZ_QUESTIONS.length * 100}%` }}
        />
      </div>

      <h2 className="text-lg font-semibold mb-4">{q.q}</h2>
      <ul className="space-y-2">
        {q.a.map((opt, i) =>
          visibleIndexes.includes(i) ? (
            <li key={i}>
              <button
                disabled={showExp}
                onClick={() => handleSelect(i)}
                className={`w-full text-left px-4 py-2 rounded border ${
                  selected === i ? 'bg-blue-600 text-white' : 'bg-gray-50'
                }`}
              >
                {opt}
              </button>
            </li>
          ) : null,
        )}
      </ul>

      {/* Lifeline + Next */}
      <div className="mt-4 flex space-x-2">
        <button
          disabled={lifelineUsed || showExp}
          onClick={useFifty}
          className="flex-1 bg-yellow-500 text-white px-2 py-2 rounded disabled:opacity-40"
        >
          50-50
        </button>
        <button
          disabled={selected === null || showExp}
          onClick={handleNext}
          className="flex-1 bg-green-600 text-white px-2 py-2 rounded disabled:opacity-40"
        >
          {idx === QUIZ_QUESTIONS.length - 1 ? 'Finish' : 'Submit'}
        </button>
      </div>

      {/* Explanation overlay */}
      {showExp && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
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
function shuffle(str) {
  const arr = str.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

function WordScramble({ onExit }) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTime] = useState(30)
  const term = LEGAL_TERMS[idx]
  const scrambled = useMemo(() => shuffle(term), [idx, term])

  /* timer */
  useEffect(() => {
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
  })

  const handleSubmit = () => {
    if (input.trim().toLowerCase() === term.toLowerCase()) {
      setScore(s => s + 1)
    }
    handleSkip()
  }

  const handleSkip = () => {
    setInput('')
    setIdx(i => i + 1)
    setTime(30)
  }

  if (idx >= LEGAL_TERMS.length)
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Scramble Finished!</h2>
        <p className="text-xl mb-4">
          Score: {score} / {LEGAL_TERMS.length}
        </p>
        <button
          onClick={onExit}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Back to Menu
        </button>
      </div>
    )

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-center">
      <h2 className="text-lg font-semibold mb-2">Unscramble the term</h2>
      <p className="text-3xl font-mono tracking-widest mb-4">{scrambled}</p>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
        placeholder="Type the correct term"
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
      <p className="mt-4 font-mono text-sm">⏱ {timeLeft}s</p>
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
  const [game, setGame] = useState(null)

  if (game !== null) {
    const Game = GAMES[game].component
    return <Game onExit={() => setGame(null)} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-sm bg-white rounded shadow p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Legal Learning Arcade</h1>
        {GAMES.map((g, i) => (
          <button
            key={g.name}
            onClick={() => setGame(i)}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            {g.name}
          </button>
        ))}
      </div>
    </div>
  )
}