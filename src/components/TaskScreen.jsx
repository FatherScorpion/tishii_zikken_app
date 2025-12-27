import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { generateOrder } from '../utils/randomOrder'
import { downloadCSV } from '../utils/csvExport'
import CustomCursor from './CustomCursor'
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

    // マンハッタン距離（誤差）を計算
    const error = calculateManhattanDistance(currentTarget, cellNumber)

    // データを記録
    const data = {
      順番: currentIndex + 1,
      回答にかかった時間: responseTime,
      正解の指示: currentTarget,
      被験者の回答: cellNumber,
      誤差: error
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
        const allData = taskData.concat(data)
        
        // 統計情報を計算
        const totalTime = allData.reduce((sum, item) => sum + item['回答にかかった時間'], 0)
        const averageTime = Math.round(totalTime / allData.length)
        const correctCount = allData.filter(item => item['正解の指示'] === item['被験者の回答']).length
        const accuracyRate = Math.round((correctCount / allData.length) * 100 * 100) / 100 // 小数点第2位まで
        const totalError = allData.reduce((sum, item) => sum + item['誤差'], 0)
        const averageError = Math.round((totalError / allData.length) * 100) / 100 // 小数点第2位まで
        
        // 各データ行に統計列を追加（値は空）
        const dataWithStatsColumns = allData.map(item => ({
          ...item,
          平均回答時間: '',
          正答率: '',
          平均誤差: ''
        }))
        
        // 統計情報を最後の行として追加
        const dataWithStats = [
          ...dataWithStatsColumns,
          {
            順番: '',
            回答にかかった時間: '',
            正解の指示: '',
            被験者の回答: '',
            誤差: '',
            平均回答時間: averageTime,
            正答率: `${accuracyRate}%`,
            平均誤差: averageError
          }
        ]
        
        const modeName = mode === 'existing' ? '本番-既存' : '本番-提案'
        const filename = `${modeName}_${userId}_結果.csv`
        downloadCSV(dataWithStats, filename)
        
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

  // セル番号から行と列の位置を取得
  const getCellPosition = (cellNumber) => {
    const zeroBased = cellNumber - 1
    return {
      row: Math.floor(zeroBased / GRID_COLS),
      col: zeroBased % GRID_COLS
    }
  }

  // マンハッタン距離を計算
  const calculateManhattanDistance = (cell1, cell2) => {
    const pos1 = getCellPosition(cell1)
    const pos2 = getCellPosition(cell2)
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col)
  }

  const getCellColor = (cellNumber) => {
    if (currentTarget === cellNumber) {
      return '#ff0000' // 赤：現在の指示
    }
    if (countdown !== null && nextTarget === cellNumber) {
      return '#ff0000' // 赤：次の指示（カウントダウン中）- 同じ演出にする
    }
    return '#000000' // 黒：通常
  }

  const isTargetCell = (cellNumber) => {
    return currentTarget === cellNumber || (countdown !== null && nextTarget === cellNumber)
  }

  if (!order.length) {
    return <div className="loading">読み込み中...</div>
  }

  return (
    <div className="task-screen">
      <CustomCursor />
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
                    className={`grid-cell ${isTargetCell(cellNumber) ? 'target-cell' : ''}`}
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

