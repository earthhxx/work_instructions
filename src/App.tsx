import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import RegisterDC from './pages/RegisterDC';
import FilterSearch from './pages/FilterSearch';
import FilterDepartment from './pages/FilterDepartment';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/RegisterDC" element={<RegisterDC />} />
          <Route path="/FilterSearch" element={<FilterSearch />} />
          <Route path="FilterDepartment" element={<FilterDepartment />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
