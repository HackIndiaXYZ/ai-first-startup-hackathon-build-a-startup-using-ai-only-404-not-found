import { useEffect } from "react";
import { LinkButton } from "../components/ui";
import { usePageIntro } from "../lib/motion";
import "../styles/notfound.css";

export default function NotFound() {
  const intro = usePageIntro<HTMLDivElement>();
  useEffect(() => {
    document.title = "Not found · Chhat";
  }, []);
  return (
    <div className="page nf" ref={intro}>
      <div className="nf__art" aria-hidden="true">
        <span className="nf__four">4</span>
        <span className="nf__zero">
          <span className="nf__sun" />
        </span>
        <span className="nf__four">4</span>
        <span className="nf__roof" />
      </div>
      <header className="wrap page__head nf__head">
        <p className="eyebrow">404 · not found</p>
        <h1 className="page__title">Nothing on this roof.</h1>
        <p className="page__lede">The page you asked for doesn't exist. The sun still rises in the east, though.</p>
        <div>
          <LinkButton to="/" variant="accent" size="lg">
            Back to the rooftop
          </LinkButton>
        </div>
      </header>
    </div>
  );
}
