import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { downloadCSV } from '../utils/csvExport'
import './PostExperimentSurveyScreen.css'

const SURVEY_ITEMS = [
  { key: '対象の分かりやすさ', label: '対象の分かりやすさ：指示された対象がどれであるか，直感的に理解できたか' },
  { key: '回答への確信度', label: '回答への確信度：自分の回答が合っているとどの程度自信を持てたか' },
  { key: '視認性', label: '視認性：指差し（手）またはARピンが，背景や距離に関わらず見やすかったか' }
]

function PostExperimentSurveyScreen() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [answers, setAnswers] = useState({
    対象の分かりやすさ: { choice: '', reason: '' },
    回答への確信度: { choice: '', reason: '' },
    視認性: { choice: '', reason: '' }
  })
  const [arPinFeedback, setArPinFeedback] = useState('')
  const [overallFeedback, setOverallFeedback] = useState('')

  const handleChoiceChange = (itemKey, choice) => {
    setAnswers(prev => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        choice: choice
      }
    }))
  }

  const handleReasonChange = (itemKey, reason) => {
    setAnswers(prev => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        reason: reason
      }
    }))
  }

  const handleSubmit = () => {
    // ユーザーIDの検証
    const userIdNum = parseInt(userId, 10)
    if (!userId || isNaN(userIdNum) || userIdNum <= 0) {
      alert('ユーザーIDを正の整数で入力してください')
      return
    }

    // 必須項目の検証
    const missingItems = []
    SURVEY_ITEMS.forEach(item => {
      if (!answers[item.key].choice) {
        missingItems.push(`${item.label}の選択`)
      }
      if (!answers[item.key].reason.trim()) {
        missingItems.push(`${item.label}の理由`)
      }
    })

    if (missingItems.length > 0) {
      alert(`以下の項目が未入力です：\n${missingItems.join('\n')}`)
      return
    }

    // データをまとめる
    const surveyData = {
      ユーザーID: userIdNum,
      対象の分かりやすさ_選択: answers['対象の分かりやすさ'].choice,
      対象の分かりやすさ_理由: answers['対象の分かりやすさ'].reason,
      回答への確信度_選択: answers['回答への確信度'].choice,
      回答への確信度_理由: answers['回答への確信度'].reason,
      視認性_選択: answers['視認性'].choice,
      視認性_理由: answers['視認性'].reason,
      ARピンについての感想: arPinFeedback || '',
      実験全体についての感想: overallFeedback || ''
    }

    // CSVとしてダウンロード
    const filename = `実験終了後アンケート_${userIdNum}_結果.csv`
    downloadCSV([surveyData], filename)

    // タイトル画面に戻る
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  return (
    <div className="post-experiment-survey-screen">
      <div className="survey-container">
        <h1>実験終了後アンケート</h1>
        
        <div className="input-section">
          <label htmlFor="postUserId">ユーザーID（数字）:</label>
          <input
            id="postUserId"
            type="number"
            min="1"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="例: 1"
          />
        </div>

        <div className="survey-items">
          {SURVEY_ITEMS.map(item => (
            <div key={item.key} className="survey-item">
              <h3>{item.label}</h3>
              
              <div className="choice-section">
                <p className="question-text">どちらが良かったですか？（必須）</p>
                <div className="choice-buttons">
                  <button
                    className={`choice-button ${answers[item.key].choice === '指差し' ? 'selected' : ''}`}
                    onClick={() => handleChoiceChange(item.key, '指差し')}
                  >
                    指差し
                  </button>
                  <button
                    className={`choice-button ${answers[item.key].choice === 'ARピン' ? 'selected' : ''}`}
                    onClick={() => handleChoiceChange(item.key, 'ARピン')}
                  >
                    ARピン
                  </button>
                </div>
              </div>

              <div className="reason-section">
                <label htmlFor={`reason-${item.key}`}>
                  理由（必須）:
                </label>
                <textarea
                  id={`reason-${item.key}`}
                  value={answers[item.key].reason}
                  onChange={(e) => handleReasonChange(item.key, e.target.value)}
                  placeholder="理由を入力してください"
                  rows={4}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div className="feedback-section">
          <div className="feedback-item">
            <label htmlFor="arPinFeedback">
              ARピンについての感想や意見（任意）:
            </label>
            <textarea
              id="arPinFeedback"
              value={arPinFeedback}
              onChange={(e) => setArPinFeedback(e.target.value)}
              placeholder="ARピンについての感想や意見を入力してください"
              rows={4}
            />
          </div>

          <div className="feedback-item">
            <label htmlFor="overallFeedback">
              実験全体についての感想や意見（任意）:
            </label>
            <textarea
              id="overallFeedback"
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder="実験全体についての感想や意見を入力してください"
              rows={4}
            />
          </div>
        </div>

        <div className="button-section">
          <button className="submit-button" onClick={handleSubmit}>
            送信してCSVダウンロード
          </button>
          <button className="back-button" onClick={() => navigate('/')}>
            タイトルに戻る
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostExperimentSurveyScreen

