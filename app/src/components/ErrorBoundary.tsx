import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Rendered instead of the children after an error. */
  fallback: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error) => void;
}

/** Catches a render or lazy-load error so one broken part can't blank the app. */
export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Chhat caught an error:", error, info.componentStack);
    this.props.onError?.(error);
  }

  retry = () => this.setState({ error: null });

  render() {
    return this.state.error ? this.props.fallback(this.state.error, this.retry) : this.props.children;
  }
}

/** A lazy chunk that is gone (offline, or a new deploy replaced it). */
export function isChunkError(e: Error): boolean {
  return /dynamically imported module|Importing a module script failed|Unable to preload|Failed to fetch|ChunkLoadError|error loading dynamically/i.test(e.message);
}

export function RouteError({ error, retry }: { error: Error; retry: () => void }) {
  const chunk = isChunkError(error);
  return (
    <div className="page wrap nf" role="alert">
      <p className="eyebrow">{chunk ? "Couldn't load this page" : "Something broke"}</p>
      <h1 className="page__title">{chunk ? "The connection dropped." : "A cloud passed over."}</h1>
      <p className="page__lede">
        {chunk
          ? "This part of Chhat didn't download. Check your connection, then reload. If the site was just updated, a reload fetches the new version."
          : "This page hit an error. Reloading usually fixes it. Your inputs are in the address bar, so nothing is lost."}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="btn btn--accent" onClick={() => window.location.reload()}>
          Reload
        </button>
        {!chunk && (
          <button type="button" className="btn btn--ghost" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
