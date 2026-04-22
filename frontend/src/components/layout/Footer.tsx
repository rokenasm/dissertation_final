import { Link } from "react-router-dom";
import Logo from "../Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col footer-brand">
          <Logo variant="light" />
          <p className="footer-tagline">From drawing to quote in minutes.</p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <Link to="/estimator">Estimator</Link>
          <Link to="/estimator">AI Floor Plan</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <a href="https://www.british-gypsum.com" target="_blank" rel="noreferrer">British Gypsum</a>
          <a href="https://www.gyproc.co.uk" target="_blank" rel="noreferrer">Gyproc Spec</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RMBuild. Built for drylining professionals.</p>
      </div>
    </footer>
  );
}
