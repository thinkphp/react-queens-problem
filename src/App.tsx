import { useEffect, useRef, useState } from 'react'
import './App.css'

type Square = { r: number; c: number }
const SIZE = 8
const key = ({ r, c }: Square) => `${r},${c}`
const attacks = (a: Square, b: Square) =>
  a.r === b.r || a.c === b.c || Math.abs(a.r - b.r) === Math.abs(a.c - b.c)

function solveQueens(): Square[] {
  const answer: Square[] = []
  function place(row: number): boolean {
    if (row === SIZE) return true
    for (let col = 0; col < SIZE; col++) {
      const square = { r: row, c: col }
      if (answer.every(q => !attacks(q, square))) {
        answer.push(square)
        if (place(row + 1)) return true
        answer.pop()
      }
    }
    return false
  }
  place(0)
  return answer
}

export default function App() {
  const [queens, setQueens] = useState<Square[]>([])
  const [speed, setSpeed] = useState(240)
  const [playing, setPlaying] = useState(false)
  const [message, setMessage] = useState('Place queens on the board. No queen can attack another.')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const runId = useRef(0)
  const complete = queens.length === SIZE
  const progress = Math.round(queens.length / SIZE * 100)

  function reset() {
    runId.current++
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setPlaying(false)
    setQueens([])
    setMessage('Place queens on the board. No queen can attack another.')
  }

  function chooseSquare(square: Square) {
    if (playing) return
    const existing = queens.find(q => key(q) === key(square))
    if (existing) {
      const next = queens.filter(q => key(q) !== key(square))
      setQueens(next)
      setMessage(`You have placed ${next.length} of 8 queens.`)
      return
    }
    if (queens.some(q => attacks(q, square))) {
      setMessage('That square is under attack. Choose a safe square or move a queen.')
      return
    }
    const next = [...queens, square]
    setQueens(next)
    setMessage(next.length === SIZE
      ? 'Congratulations! You solved the eight queens puzzle.'
      : `Queen ${next.length} of 8 placed. Keep going!`)
  }

  async function solve() {
    reset()
    await new Promise(resolve => setTimeout(resolve, 0))
    const id = runId.current
    const solution = solveQueens()
    setPlaying(true)
    setMessage('The algorithm is searching for a solution...')
    for (let i = 0; i < solution.length; i++) {
      await new Promise<void>(resolve => { timer.current = setTimeout(resolve, speed) })
      if (runId.current !== id) return
      setQueens(solution.slice(0, i + 1))
    }
    if (runId.current === id) {
      setPlaying(false)
      setMessage('Solution found! No queen is attacking another.')
    }
  }

  useEffect(() => () => {
    runId.current++
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand-icon">♛</div>
        <div className="brand-text">
          <span className="eyebrow">ALGORITHM LAB / 01</span>
          <h1>Eight Queens Puzzle</h1>
        </div>
        <span className="status"><i /> React + TypeScript</span>
      </header>

      <section className="intro">
        <span className="eyebrow">COMPUTER SCIENCE PROBLEM</span>
        <h2>Eight queens.<br /><span>Zero conflicts.</span></h2>
        <p>Place one queen on each row so that no two queens attack each other along a row, column, or diagonal.</p>
      </section>

      <section className="workspace">
        <div className="board-panel">
          <div className="panel-heading">
            <div><h3>Chessboard</h3><p>{queens.length} of 8 queens placed</p></div>
            <strong className="counter">{String(queens.length).padStart(2, '0')}<small> / 08</small></strong>
          </div>
          <div className="board-wrap">
            <div className="ranks">{Array.from({ length: 8 }, (_, i) => <span key={i}>{8 - i}</span>)}</div>
            <div className="board">
              {Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => {
                const square = { r, c }
                const queen = queens.some(q => key(q) === key(square))
                const threatened = !queen && queens.some(q => attacks(q, square))
                return <button
                  key={key(square)}
                  aria-label={`Square ${String.fromCharCode(97 + c)}${8 - r}${queen ? ', queen' : threatened ? ', under attack' : ', safe'}`}
                  aria-pressed={queen}
                  className={['square', (r + c) % 2 === 0 ? 'light' : 'dark', queen ? 'current' : '', threatened ? 'threatened' : ''].join(' ')}
                  onClick={() => chooseSquare(square)}
                >{queen ? <span className="queen">♛</span> : threatened ? <span className="threat-mark" /> : null}</button>
              }))}
            </div>
          </div>
          <div className="files">{Array.from({ length: 8 }, (_, i) => <span key={i}>{String.fromCharCode(97 + i)}</span>)}</div>
          <div className="legend"><span><i className="legend-knight" /> Queen</span><span><i className="legend-threat" /> Under attack</span><span><i className="legend-move" /> Safe square</span></div>
        </div>

        <aside className="control-panel">
          <div className="eyebrow">CONTROL CENTER</div>
          <h3>Solve the puzzle</h3>
          <p className="description">Place queens manually or watch the backtracking solver find a solution.</p>
          <button className="primary" disabled={playing || complete} onClick={solve}>▶ &nbsp; Find a solution</button>
          <button className="secondary" disabled={!playing} onClick={reset}>■ &nbsp; Stop animation</button>
          <button className="secondary" onClick={reset}>↺ &nbsp; Reset board</button>
          <div className="speed-control">
            <div className="label-row"><label htmlFor="speed">Animation speed</label><span>{speed} ms</span></div>
            <input id="speed" type="range" min="80" max="800" step="40" value={speed} onChange={e => setSpeed(Number(e.target.value))} />
            <div className="range-labels"><span>Fast</span><span>Slow</span></div>
          </div>
          <div className="progress-section">
            <div className="label-row"><span>Progress</span><strong>{progress}%</strong></div>
            <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
            <div className="progress-bottom"><span>{queens.length} placed</span><span>{SIZE - queens.length} remaining</span></div>
          </div>
          <div className={`message ${complete ? 'success' : ''}`}><span>{complete ? '✓' : '✳'}</span>{message}</div>
        </aside>
      </section>
      <footer><span>EIGHT QUEENS PUZZLE</span><span>BACKTRACKING</span></footer>
    </main>
  )
}
