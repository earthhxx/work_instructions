import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import FilterSearch from './pages/FilterSearch';
import PartList from './pages/PartList';
import Homepage from './pages/Homepage';
import ReportIssueCard from './components/ReportIssueCard';

function App() {
  return (
    <Router>
      <ReportIssueCard />
      <MainLayout>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/FilterSearch" element={<FilterSearch />} />
          <Route path='/PartList' element={<PartList />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
