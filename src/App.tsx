import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import FilterSearch from './pages/FilterSearch';
import PartList from './pages/PartList';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/FilterSearch" element={<FilterSearch />} />
          <Route path='/PartList' element={<PartList/>}/>
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
