import { LinkButton } from "../components/ui";

export default function NotFound() {
  return (
    <div className="page wrap nf">
      <p className="eyebrow">404 · not found</p>
      <h1 className="page__title">Nothing on this roof.</h1>
      <p className="page__lede">The page you asked for doesn't exist. The sun still rises in the east, though.</p>
      <LinkButton to="/" variant="accent">
        Back to the rooftop
      </LinkButton>
    </div>
  );
}
