import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import Print from './screens/Print';
import Settings from './screens/Settings';
import { useEffect, useState } from 'react';

export default function App() {
  const [firstTime, setFirstTime] = useState(true);

  useEffect(() => {
    let id, url, interval;
    id = window.electron.store.get('ID');
    url = window.electron.store.get('URL');
    interval = window.electron.store.get('INTERVAL');
    console.log({ id, url, interval });
    if (!id || !url || !interval) {
      setFirstTime(true);
    } else {
      setFirstTime(false);
    }
  }, [setFirstTime]);
  return (
    <Router>
      <Routes>
        <Route path="/" element={firstTime ? <Settings /> : <Print />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/print" element={<Print />} />
      </Routes>
    </Router>
  );
}
