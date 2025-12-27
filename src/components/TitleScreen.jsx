import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TitleScreen.css'

function TitleScreen() {
  const [userId, setUserId] = useState('')
  const [mode, setMode] = useState(null) // null, 'practice', 'existing', 'proposed'
  const navigate = useNavigate()

  const handleStart = () => {
    if (!userId || !mode) {
      alert('ユーザーIDを入力し、モードを選択してください')
      return
    }
    
    const userIdNum = parseInt(userId, 10)
    if (isNaN(userIdNum) || userIdNum <= 0) {
      alert('ユーザーIDは正の整数で入力してください')
      return
    }
    
    // タスク画面に遷移（stateでデータを渡す）
    navigate('/task', {
      state: {
        userId: userIdNum,
        mode: mode
      }
    })
  }

  const handleModeSelect = (selectedMode) => {
    if (selectedMode === 'practice') {
      setMode('practice')
      // 練習モードはすぐに開始
      setTimeout(() => {
        if (userId) {
          const userIdNum = parseInt(userId, 10)
          if (!isNaN(userIdNum) && userIdNum > 0) {
            navigate('/task', {
              state: {
                userId: userIdNum,
                mode: 'practice'
              }
            })
          }
        }
      }, 100)
    } else {
      setMode(selectedMode)
    }
  }

  return (
    <div className="title-screen">
      <h1>tishii_zikken_app</h1>
      
      <div className="input-section">
        <label htmlFor="userId">ユーザーID（数字）:</label>
        <input
          id="userId"
          type="number"
          min="1"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="例: 1"
        />
      </div>

      <div className="mode-section">
        <h2>モード選択</h2>
        <div className="mode-buttons">
          <button
            className={`mode-button ${mode === 'practice' ? 'selected' : ''}`}
            onClick={() => handleModeSelect('practice')}
          >
            練習
          </button>
          <button
            className={`mode-button ${mode === 'main' ? 'selected' : ''}`}
            onClick={() => setMode('main')}
          >
            本番
          </button>
        </div>
      </div>

      {mode === 'main' && (
        <div className="submode-section">
          <h3>手法を選択してください</h3>
          <div className="submode-buttons">
            <button
              className={`submode-button ${mode === 'existing' ? 'selected' : ''}`}
              onClick={() => handleModeSelect('existing')}
            >
              既存手法
            </button>
            <button
              className={`submode-button ${mode === 'proposed' ? 'selected' : ''}`}
              onClick={() => handleModeSelect('proposed')}
            >
              提案手法
            </button>
          </div>
        </div>
      )}

      {mode && mode !== 'practice' && mode !== 'main' && (
        <button className="start-button" onClick={handleStart}>
          開始
        </button>
      )}

      <div className="survey-link-section">
        <button 
          className="survey-link-button"
          onClick={() => navigate('/pre-experiment-survey')}
        >
          実験前アンケート
        </button>
        <button 
          className="survey-link-button"
          onClick={() => navigate('/post-experiment-survey')}
        >
          実験終了後アンケート
        </button>
      </div>
    </div>
  )
}

export default TitleScreen

