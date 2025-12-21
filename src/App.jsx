import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>tishii_zikken_app</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            カウント: {count}
          </button>
        </div>
        <p>
          Github PagesでホストされたReactアプリケーション
        </p>
      </header>
    </div>
  )
}

export default App

