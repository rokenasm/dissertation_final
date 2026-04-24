import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Page not found");
  return (
    <section className="section section-narrow notfound">
      <div className="notfound-sheet">
        <span className="sheet-label">404</span>
        <h2 className="notfound-title">Page not found.</h2>
        <p className="notfound-body">
          That URL isn't wired up to anything. Either a typo or something I
          haven't built yet.
        </p>
        <div className="notfound-ctas">
          <Link to="/" className="btn btn-primary">Home</Link>
          <Link to="/estimator" className="btn btn-text">Open the estimator →</Link>
        </div>
      </div>
    </section>
  );
}
