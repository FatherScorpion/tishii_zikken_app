import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { downloadCSV } from '../utils/csvExport'
import './PreExperimentSurveyScreen.css'

const AR_VR_EXPERIENCE_OPTIONS = ['なし', '経験あり', 'たまに使う', '日常的に使う']
const GENDER_OPTIONS = ['男性', '女性', 'その他', '回答しない']

function PreExperimentSurveyScreen() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [arVrExperience, setArVrExperience] = useState('')

  const handleSubmit = () => {
    // ユーザーIDの検証
    const userIdNum = parseInt(userId, 10)
    if (!userId || isNaN(userIdNum) || userIdNum <= 0) {
      alert('ユーザーIDを正の整数で入力してください')
      return
    }

    // 年齢の検証
    const ageNum = parseInt(age, 10)
    if (!age || isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
      alert('年齢を正しく入力してください（1-150）')
      return
    }

    // 必須項目の検証
    const missingItems = []
    if (!gender) {
      missingItems.push('性別')
    }
    if (!arVrExperience) {
      missingItems.push('AR/VR経験')
    }

    if (missingItems.length > 0) {
      alert(`以下の項目が未入力です：\n${missingItems.join('\n')}`)
      return
    }

    // データをまとめる
    const surveyData = {
      被験者ID: userIdNum,
      年齢: ageNum,
      性別: gender,
      'AR/VR経験': arVrExperience
    }

    // CSVとしてダウンロード
    const filename = `実験前アンケート_${userIdNum}_結果.csv`
    downloadCSV([surveyData], filename)

    // タイトル画面に戻る
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  return (
    <div className="pre-experiment-survey-screen">
      <div className="survey-container">
        <h1>実験前アンケート</h1>
        
        <div className="input-section">
          <label htmlFor="preUserId">被験者ID（数字）:</label>
          <input
            id="preUserId"
            type="number"
            min="1"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="例: 1"
            required
          />
        </div>

        <div className="input-section">
          <label htmlFor="age">年齢:</label>
          <input
            id="age"
            type="number"
            min="1"
            max="150"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="例: 25"
            required
          />
        </div>

        <div className="select-section">
          <label htmlFor="gender">性別（必須）:</label>
          <div className="option-buttons">
            {GENDER_OPTIONS.map(option => (
              <button
                key={option}
                className={`option-button ${gender === option ? 'selected' : ''}`}
                onClick={() => setGender(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="select-section">
          <label htmlFor="arVrExperience">AR/VR経験（必須）:</label>
          <div className="option-buttons">
            {AR_VR_EXPERIENCE_OPTIONS.map(option => (
              <button
                key={option}
                className={`option-button ${arVrExperience === option ? 'selected' : ''}`}
                onClick={() => setArVrExperience(option)}
              >
                {option}
              </button>
            ))}
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

export default PreExperimentSurveyScreen

