import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Page0 from './components/Page0';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import Page3 from './components/Page3';
import Layout from './components/Layout'; 
import FaceMatchForm from './components/FaceMatchForm';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Page0 />} />
        <Route element={<Layout />}>
          <Route path="/page1" element={<Page1 />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="/page3" element={<Page3 />} />
          <Route path="/face-match" element={<FaceMatchForm />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
