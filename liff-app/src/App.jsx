import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LiffProvider } from './contexts/LiffContext';
import HomePage from './pages/HomePage';
import RewardsPage from './pages/RewardsPage';
import HistoryPage from './pages/HistoryPage';
import RedemptionsPage from './pages/RedemptionsPage';
import LinkPhonePage from './pages/LinkPhonePage';

function App() {
  return (
    <LiffProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/redemptions" element={<RedemptionsPage />} />
          <Route path="/link-phone" element={<LinkPhonePage />} />
        </Routes>
      </Router>
    </LiffProvider>
  );
}

export default App;
