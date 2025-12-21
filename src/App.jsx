import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TitleScreen from './components/TitleScreen'
import TaskScreen from './components/TaskScreen'
import SurveyScreen from './components/SurveyScreen'
import PostExperimentSurveyScreen from './components/PostExperimentSurveyScreen'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  // Github Pages用のbasename設定
  // 開発環境では空文字列、本番環境では '/tishii_zikken_app'
  const basename = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.slice(0, -1)
  
  return (
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
        <div className="App">
          <Routes>
            <Route path="/" element={<TitleScreen />} />
            <Route path="/task" element={<TaskScreen />} />
            <Route path="/survey" element={<SurveyScreen />} />
            <Route path="/post-experiment-survey" element={<PostExperimentSurveyScreen />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
