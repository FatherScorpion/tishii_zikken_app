import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { downloadCSV } from '../utils/csvExport'
import './SurveyScreen.css'

// NASA-TLXの6つのサブスケール
const NASA_TLX_FACTORS = [
  '精神的負荷',
  '身体的負荷',
  '時間的切迫感',
  'パフォーマンス',
  '努力',
  'フラストレーション'
]

// 一対比較の組み合わせ（15ペア）
const PAIRWISE_COMBINATIONS = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 3], [2, 4], [2, 5],
  [3, 4], [3, 5],
  [4, 5]
]

function SurveyScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { userId, mode } = location.state || {}

  const [likertAnswers, setLikertAnswers] = useState({
    対象の分かりやすさ: null,
    回答への確信度: null,
    視認性: null
  })

  const [nasaTlxRatings, setNasaTlxRatings] = useState({
    精神的負荷: null,
    身体的負荷: null,
    時間的切迫感: null,
    パフォーマンス: null,
    努力: null,
    フラストレーション: null
  })

  const [pairwiseIndex, setPairwiseIndex] = useState(0)
  const [pairwiseSelections, setPairwiseSelections] = useState(Array(PAIRWISE_COMBINATIONS.length).fill(null))
  const [currentSection, setCurrentSection] = useState('likert') // 'likert', 'nasa-rating', 'nasa-pairwise'

  useEffect(() => {
    if (!userId || !mode) {
      navigate('/')
      return
    }
  }, [])

  const handleLikertChange = (question, value) => {
    setLikertAnswers(prev => ({
      ...prev,
      [question]: parseInt(value, 10)
    }))
  }

  const handleNasaTlxRatingChange = (factor, value) => {
    setNasaTlxRatings(prev => ({
      ...prev,
      [factor]: parseInt(value, 10)
    }))
  }

  const handlePairwiseSelection = (selectedIndex) => {
    const newSelections = [...pairwiseSelections]
    newSelections[pairwiseIndex] = selectedIndex
    setPairwiseSelections(newSelections)
  }

  const handleNextSection = () => {
    if (currentSection === 'likert') {
      // リッカート尺度の回答をチェック
      const allAnswered = Object.values(likertAnswers).every(val => val !== null)
      if (!allAnswered) {
        alert('すべての項目に回答してください')
        return
      }
      setCurrentSection('nasa-rating')
    } else if (currentSection === 'nasa-rating') {
      // NASA-TLX評価の回答をチェック
      const allAnswered = Object.values(nasaTlxRatings).every(val => val !== null)
      if (!allAnswered) {
        alert('すべての項目に回答してください')
        return
      }
      setCurrentSection('nasa-pairwise')
    }
  }

  const handlePairwiseNext = () => {
    if (pairwiseSelections[pairwiseIndex] === null) {
      alert('どちらかを選択してください')
      return
    }

    if (pairwiseIndex < PAIRWISE_COMBINATIONS.length - 1) {
      setPairwiseIndex(pairwiseIndex + 1)
    } else {
      // すべての一対比較が完了
      handleSubmit()
    }
  }

  const handlePairwiseBack = () => {
    if (pairwiseIndex > 0) {
      setPairwiseIndex(pairwiseIndex - 1)
    }
  }

  const handleSubmit = () => {
    // 重みを計算（選択された回数をカウント）
    const weights = Array(6).fill(0)
    pairwiseSelections.forEach((selection, index) => {
      if (selection !== null) {
        const [factor1, factor2] = PAIRWISE_COMBINATIONS[index]
        weights[selection === 0 ? factor1 : factor2]++
      }
    })

    // データをまとめる
    const surveyData = {
      ...likertAnswers,
      ...nasaTlxRatings,
      '精神的負荷_重み': weights[0],
      '身体的負荷_重み': weights[1],
      '時間的切迫感_重み': weights[2],
      'パフォーマンス_重み': weights[3],
      '努力_重み': weights[4],
      'フラストレーション_重み': weights[5]
    }

    // CSVとしてダウンロード
    const modeName = mode === 'existing' ? '本番-既存' : '本番-提案'
    const filename = `${modeName}_${userId}_アンケート.csv`
    downloadCSV([surveyData], filename)

    // タイトル画面に戻る
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  const renderLikertSection = () => {
    const questions = [
      { key: '対象の分かりやすさ', label: '指示された対象がどれであるか，直感的に理解できたか' },
      { key: '回答への確信度', label: '自分の回答が合っているとどの程度自信を持てたか' },
      { key: '視認性', label: '指差し（手）またはARピンが，背景や距離に関わらず見やすかったか' }
    ]

    return (
      <div className="survey-section">
        <h2>アンケート（7段階リッカート尺度）</h2>
        <p className="instruction">各項目について、1（全くそう思わない）から7（非常にそう思う）まで選択してください。</p>
        
        {questions.map(question => (
          <div key={question.key} className="question-item">
            <p className="question-label">{question.label}</p>
            <div className="likert-scale">
              {[1, 2, 3, 4, 5, 6, 7].map(value => (
                <label key={value} className="likert-option">
                  <input
                    type="radio"
                    name={question.key}
                    value={value}
                    checked={likertAnswers[question.key] === value}
                    onChange={(e) => handleLikertChange(question.key, e.target.value)}
                  />
                  <span className="likert-value">{value}</span>
                </label>
              ))}
            </div>
            <div className="likert-labels">
              <span>全くそう思わない</span>
              <span>非常にそう思う</span>
            </div>
          </div>
        ))}

        <button className="next-button" onClick={handleNextSection}>
          次へ（NASA-TLX評価）
        </button>
      </div>
    )
  }

  const renderNasaTlxRatingSection = () => {
    return (
      <div className="survey-section">
        <h2>NASA-TLX評価（7段階評価）</h2>
        <p className="instruction">各項目について、1から7まで選択してください。</p>
        
        {NASA_TLX_FACTORS.map(factor => (
          <div key={factor} className="question-item">
            <p className="question-label">{factor}</p>
            <div className="likert-scale">
              {[1, 2, 3, 4, 5, 6, 7].map(value => (
                <label key={value} className="likert-option">
                  <input
                    type="radio"
                    name={`nasa-${factor}`}
                    value={value}
                    checked={nasaTlxRatings[factor] === value}
                    onChange={(e) => handleNasaTlxRatingChange(factor, e.target.value)}
                  />
                  <span className="likert-value">{value}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button className="next-button" onClick={handleNextSection}>
          次へ（NASA-TLX重みづけ）
        </button>
      </div>
    )
  }

  const renderPairwiseSection = () => {
    const [factor1Index, factor2Index] = PAIRWISE_COMBINATIONS[pairwiseIndex]
    const factor1 = NASA_TLX_FACTORS[factor1Index]
    const factor2 = NASA_TLX_FACTORS[factor2Index]
    const currentSelection = pairwiseSelections[pairwiseIndex]

    return (
      <div className="survey-section">
        <h2>NASA-TLX重みづけ（一対比較法）</h2>
        <p className="instruction">
          タスク遂行において、どちらの要因がより重要だったか選択してください。
          ({pairwiseIndex + 1} / {PAIRWISE_COMBINATIONS.length})
        </p>
        
        <div className="pairwise-comparison">
          <button
            className={`pairwise-button ${currentSelection === 0 ? 'selected' : ''}`}
            onClick={() => handlePairwiseSelection(0)}
          >
            {factor1}
          </button>
          
          <span className="pairwise-vs">vs</span>
          
          <button
            className={`pairwise-button ${currentSelection === 1 ? 'selected' : ''}`}
            onClick={() => handlePairwiseSelection(1)}
          >
            {factor2}
          </button>
        </div>

        <div className="pairwise-navigation">
          {pairwiseIndex > 0 && (
            <button className="back-button" onClick={handlePairwiseBack}>
              戻る
            </button>
          )}
          <button className="next-button" onClick={handlePairwiseNext}>
            {pairwiseIndex < PAIRWISE_COMBINATIONS.length - 1 ? '次へ' : '完了'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="survey-screen">
      {currentSection === 'likert' && renderLikertSection()}
      {currentSection === 'nasa-rating' && renderNasaTlxRatingSection()}
      {currentSection === 'nasa-pairwise' && renderPairwiseSection()}
    </div>
  )
}

export default SurveyScreen

