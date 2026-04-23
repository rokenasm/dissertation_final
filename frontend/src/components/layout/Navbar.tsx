import { NavLink, Link } from "react-router-dom";
import Logo from "../Logo";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo-link">
          <Logo />
        </Link>
        <nav className="navbar-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/estimator">Estimator</NavLink>
          <NavLink to="/stories">Stories</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/changelog">Changelog</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        <Link to="/estimator" className="navbar-cta">
          Start estimating
        </Link>
      </div>
    </header>
  );
}
