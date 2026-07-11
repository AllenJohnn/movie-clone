import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Details } from './pages/Details';
import { Person } from './pages/Person';
import { Player } from './pages/Player';
import { Watchlist } from './pages/Watchlist';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/details/:type/:id" element={<Details />} />
        <Route path="/person/:id" element={<Person />} />
        <Route path="/player/:type/:tmdbId" element={<Player />} />
        <Route path="/watchlist" element={<Watchlist />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-bg-dark text-white flex flex-col font-sans selection:bg-brand selection:text-white">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
