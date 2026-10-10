import { Fragment, lazy, Suspense, useState, type ReactNode } from "react";
import { HashRouter, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { AskProvider } from "./components/AskChhat";
import { ErrorBoundary, RouteError } from "./components/ErrorBoundary";
import { Cursor } from "./components/Cursor";
import { RouteCurtain } from "./components/RouteCurtain";
import { Footer, Nav } from "./components/Shell";
import { SmoothScroll } from "./lib/smooth";

const Landing = lazy(() => import("./routes/Landing"));
const Report = lazy(() => import("./routes/Report"));
const Quote = lazy(() => import("./routes/Quote"));
const Bill = lazy(() => import("./routes/Bill"));
const Ask = lazy(() => import("./routes/Ask"));
const BuiltWithAI = lazy(() => import("./routes/BuiltWithAI"));
const Deck = lazy(() => import("./routes/Deck"));
const NotFound = lazy(() => import("./routes/NotFound"));

/**
 * The tools read their URL once, on mount, then keep the URL in sync with
 * replace(). A link to the same tool with new parameters (a push, or back and
 * forward) remounts the page so it starts from those parameters.
 */
function FreshOnNavigate({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const type = useNavigationType();
  // A hand-edited hash arrives as a POP with the key "default", so the
  // parameters are part of the identity too.
  const id = `${loc.key}|${loc.search}`;
  const [key, setKey] = useState(id);
  if (type !== "REPLACE" && id !== key) setKey(id);
  return <Fragment key={key}>{children}</Fragment>;
}

/** One error boundary per page, reset when the path changes. */
function RouteBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary key={pathname} fallback={(error, retry) => <RouteError error={error} retry={retry} />}>
      {children}
    </ErrorBoundary>
  );
}

function Loading() {
  return (
    <div className="route-loading" role="status">
      <span className="route-loading__sun" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SmoothScroll>
        <AskProvider>
          <a className="skip" href="#main">
            Skip to content
          </a>
          <Nav />
          <main id="main">
            <RouteBoundary>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/report" element={<FreshOnNavigate><Report /></FreshOnNavigate>} />
                  <Route path="/quote" element={<FreshOnNavigate><Quote /></FreshOnNavigate>} />
                  <Route path="/bill" element={<FreshOnNavigate><Bill /></FreshOnNavigate>} />
                  <Route path="/ask" element={<Ask />} />
                  <Route path="/built-with-ai" element={<BuiltWithAI />} />
                  <Route path="/deck" element={<Deck />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </RouteBoundary>
          </main>
          <Footer />
          <RouteCurtain />
          <Cursor />
          <div className="grain" aria-hidden="true" />
        </AskProvider>
      </SmoothScroll>
    </HashRouter>
  );
}
