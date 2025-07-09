import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <nav className="bg-gray-800 p-4 flex items-center justify-between">
        <Link to="/" className="text-white text-xl font-bold">
          Dashboard
        </Link>
        <div>
          <Link
            to="/"
            className="text-gray-300 hover:text-white px-3 py-2 rounded"
          >
            Home
          </Link>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
