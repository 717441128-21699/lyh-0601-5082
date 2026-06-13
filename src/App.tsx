import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Workbench from '@/pages/Workbench';
import Templates from '@/pages/Templates';
import History from '@/pages/History';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Workbench />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}
