import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './Layout';
import Home from './pages/Home';
import Creator from './pages/Creator';
import MenuView from './pages/MenuView';
import Checkout from './pages/Checkout';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/crear" element={<Creator />} />
            <Route path="/menu" element={<MenuView />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
