import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TitleScreen from './components/TitleScreen'
import TaskScreen from './components/TaskScreen'
import SurveyScreen from './components/SurveyScreen'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<TitleScreen />} />
            <Route path="/task" element={<TaskScreen />} />
            <Route path="/survey" element={<SurveyScreen />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
