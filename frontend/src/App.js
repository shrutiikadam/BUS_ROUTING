import React, { useState } from "react";
import HomePage from "./pages/Homepage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";

function App() {

  return (
    <Router>
      <Routes>
        <Route path= "/" element={<HomePage />} />
        <Route path= "/auth" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
