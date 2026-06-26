import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Envelopes from './pages/Envelopes';
import DebtTracker from './pages/DebtTracker';
import Bills from './pages/Bills';
import Transactions from './pages/Transactions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="envelopes" element={<Envelopes />} />
          <Route path="debt" element={<DebtTracker />} />
          <Route path="bills" element={<Bills />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
