import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Studio from "./pages/Studio";
import About from "./pages/About";
import Docs from "./pages/Docs";
import Voices from "./pages/Voices";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

function AppShell() {
  const { dark } = useTheme();
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      dark ? "bg-[#030616] text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <Navbar />
      <Routes>
        <Route path="/"       element={<Home />}   />
        <Route path="/studio" element={<Studio />} />
        <Route path="/about"  element={<About />}  />
        <Route path="/docs"   element={<Docs />}   />
        <Route path="/voices" element={<Voices />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;