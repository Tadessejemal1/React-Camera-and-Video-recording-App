// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Camera from './Camera';
import Photos from './Photos';
import Videos from './Videos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Camera />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/videos" element={<Videos />} />
      </Routes>
    </Router>
  );
}

export default App;
