import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import RegisterDC from './pages/RegisterDC';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/RegisterDC" element={<RegisterDC />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
