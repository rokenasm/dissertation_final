import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import EstimatorPage from "./pages/EstimatorPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import "./App.css";

export default function App() {
  return (
    <div className="site">
      <Navbar />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/estimator" element={<EstimatorPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
