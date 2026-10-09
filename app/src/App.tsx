import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { AskProvider } from "./components/AskChhat";
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
    <HashRouter>
      <SmoothScroll>
        <AskProvider>
          <a className="skip" href="#main">
            Skip to content
          </a>
          <Nav />
          <main id="main">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/report" element={<Report />} />
                <Route path="/quote" element={<Quote />} />
                <Route path="/bill" element={<Bill />} />
                <Route path="/ask" element={<Ask />} />
                <Route path="/built-with-ai" element={<BuiltWithAI />} />
                <Route path="/deck" element={<Deck />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <div className="grain" aria-hidden="true" />
        </AskProvider>
      </SmoothScroll>
    </HashRouter>
  );
}
