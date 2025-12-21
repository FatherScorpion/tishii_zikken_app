import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { generateOrder } from '../utils/randomOrder'
import { downloadCSV } from '../utils/csvExport'
import './TaskScreen.css'

const GRID_ROWS = 5
const GRID_COLS = 7
const TOTAL_CELLS = GRID_ROWS * GRID_COLS

function TaskScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { userId, mode } = location.state || {}
  
  const [order, setOrder] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [countdown, setCountdown] = useState(null)
  const [currentTarget, setCurrentTarget] = useState(null)
  const [nextTarget, setNextTarget] = useState(null)
  const [taskData, setTaskData] = useState([])
  const [isPractice, setIsPractice] = useState(false)
  const [startTime, setStartTime] = useState(null)
  
  const countdownIntervalRef = useRef(null)
  const startTimeRef = useRef(null)

  const startCountdown = useCallback(() => {
    let count = 3
    setCountdown(count)
    setCurrentTarget(null)
    
    // 現在のインデックスに基づいてターゲットを設定（カウントダウン中に薄い赤で表示）
    setCurrentIndex(prevIndex => {
      if (prevIndex < order.length) {
        // カウントダウン中は、現在のインデックスのターゲットを薄い赤で表示
        const target = order[prevIndex]
        setNextTarget(target)
      }
      return prevIndex
    })
    
    countdownIntervalRef.current = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        clearInterval(countdownIntervalRef.current)
        setCountdown(null)
        // カウントダウン終了後、同じターゲットを赤で表示
        setCurrentIndex(prevIndex => {
          if (prevIndex < order.length) {
            const target = order[prevIndex]
            setCurrentTarget(target)
            setNextTarget(null) // カウントダウン終了後は予告を消す
            // 計測開始
            startTimeRef.current = Date.now()
            setStartTime(Date.now())
          }
          return prevIndex
        })
      }
    }, 1000)
  }, [order, isPractice])

  useEffect(() => {
    if (!userId || !mode) {
      navigate('/')
      return
    }

    setIsPractice(mode === 'practice')
    const generatedOrder = generateOrder(userId, mode, TOTAL_CELLS)
    setOrder(generatedOrder)
    
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [userId, mode, navigate])

  useEffect(() => {
    if (order.length > 0) {
      // 最初のカウントダウンを開始
      startCountdown()
    }
  }, [order, startCountdown])

  const handleCellClick = (cellNumber) => {
    if (!currentTarget || !startTimeRef.current) {
      return // カウントダウン中や指示が出ていない場合は無視
    }

    const endTime = Date.now()
    const responseTime = endTime - startTimeRef.current

    // データを記録
    const data = {
      順番: currentIndex + 1,
      回答にかかった時間: responseTime,
      正解の指示: currentTarget,
      被験者の回答: cellNumber
    }

    setTaskData(prev => [...prev, data])
    setCurrentTarget(null)
    setStartTime(null)
    startTimeRef.current = null

    // 次のターゲットに進む
    const nextIndex = currentIndex + 1
    
    if (isPractice) {
      // 練習モード：無限に続く
      const newIndex = nextIndex % order.length
      setCurrentIndex(newIndex)
      // 次のカウントダウンを開始（startCountdown内でnextTargetが設定される）
      setTimeout(() => {
        startCountdown()
      }, 500)
    } else {
      // 本番モード：35回で終了
      if (nextIndex >= TOTAL_CELLS) {
        // タスク終了、データをダウンロード
        const modeName = mode === 'existing' ? '本番-既存' : '本番-提案'
        const filename = `${modeName}_${userId}_結果.csv`
        downloadCSV(taskData.concat(data), filename)
        
        // アンケート画面に遷移
        setTimeout(() => {
          navigate('/survey', {
            state: {
              userId,
              mode
            }
          })
        }, 1000)
      } else {
        setCurrentIndex(nextIndex)
        // 次のカウントダウンを開始（startCountdown内でnextTargetが設定される）
        setTimeout(() => {
          startCountdown()
        }, 500)
      }
    }
  }

  const handleEndPractice = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
    navigate('/')
  }

  const getCellNumber = (row, col) => {
    return row * GRID_COLS + col + 1
  }

  const getCellColor = (cellNumber) => {
    if (currentTarget === cellNumber) {
      return '#ff0000' // 赤：現在の指示
    }
    if (countdown !== null && nextTarget === cellNumber) {
      return '#ff9999' // 薄い赤：次の指示（カウントダウン中）
    }
    return '#000000' // 黒：通常
  }

  if (!order.length) {
    return <div className="loading">読み込み中...</div>
  }

  return (
    <div className="task-screen">
      {isPractice && (
        <button className="end-button" onClick={handleEndPractice}>
          終了
        </button>
      )}
      
      {countdown !== null && (
        <div className="countdown">
          {countdown}
        </div>
      )}

      <div className="grid-container">
        <div className="grid">
          {Array.from({ length: GRID_ROWS }).map((_, row) => (
            <div key={row} className="grid-row">
              {Array.from({ length: GRID_COLS }).map((_, col) => {
                const cellNumber = getCellNumber(row, col)
                return (
                  <div
                    key={col}
                    className="grid-cell"
                    onClick={() => handleCellClick(cellNumber)}
                    style={{ color: getCellColor(cellNumber) }}
                  >
                    <span className="cell-number">{cellNumber}</span>
                    <span className="cell-mark">×</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="progress">
        {!isPractice && (
          <p>進捗: {currentIndex + 1} / {TOTAL_CELLS}</p>
        )}
      </div>
    </div>
  )
}

export default TaskScreen

