import { useEffect } from "react";
import { ChatPanel } from "../components/AskChhat";
import "../styles/tools.css";

export default function Ask() {
  useEffect(() => {
    document.title = "Ask Chhat";
  }, []);
  return (
    <div className="page">
      <header className="wrap page__head">
        <p className="eyebrow">Ask Chhat · पूछिए</p>
        <h1 className="page__title">Ask anything about going solar.</h1>
        <p className="page__lede">
          The agent picks from seven tools: irradiance lookup, system sizing, subsidy, finance, quote audit, bill audit and a sourced knowledge base. Open the tool trace under any answer to see what it ran.
        </p>
      </header>
      <div className="wrap">
        <div className="ask-page">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
