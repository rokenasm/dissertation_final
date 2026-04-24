import { Link } from "react-router-dom";
import Logo from "../Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col footer-brand">
          <Logo variant="light" showTitle />
          <p className="footer-tagline">From drawing to quote in minutes.</p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <Link to="/estimator">Estimator</Link>
        </div>
        <div className="footer-col">
          <h4>Read</h4>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h4>Spec</h4>
          <a href="https://www.british-gypsum.com" target="_blank" rel="noreferrer">British Gypsum</a>
          <a href="https://www.knauf.co.uk" target="_blank" rel="noreferrer">Knauf UK</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RMBuild. Built for drylining professionals.</p>
      </div>
    </footer>
  );
}
