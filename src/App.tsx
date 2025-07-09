import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import logo from './assets/logo.jpg';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={logo} 
                  alt="HealthyBot Logo" 
                  className="w-10 h-10 rounded-full object-cover shadow-md"
                />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">HealthyBot</h1>
                  <p className="text-sm text-gray-600">Smart Recipe & Health Assistant</p>
                </div>
              </div>
              <nav className="flex items-center space-x-6">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
                >
                  Home
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
