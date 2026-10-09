import { CheckCircle, Info, SealWarning, Warning } from "@phosphor-icons/react";
import { rupees } from "../engine/format";
import type { Finding } from "../engine/types";

const ICON = {
  critical: <SealWarning size={22} weight="fill" />,
  warn: <Warning size={22} weight="fill" />,
  info: <Info size={22} weight="fill" />,
  ok: <CheckCircle size={22} weight="fill" />,
};
const LABEL = { critical: "Critical", warn: "Warning", info: "Note", ok: "Pass" };

export function Findings({ items, showOk = true }: { items: Finding[]; showOk?: boolean }) {
  const list = showOk ? items : items.filter((f) => f.severity !== "ok");
  return (
    <ul className="findings">
      {list.map((f) => (
        <li key={f.id} className="finding" data-sev={f.severity}>
          <span className="finding__icon" role="img" aria-label={LABEL[f.severity]}>
            {ICON[f.severity]}
          </span>
          <div>
            <p className="finding__title">{f.title}</p>
            <p className="finding__detail">{f.detail}</p>
            {f.source && (
              <a className="finding__src" href={f.source.url} target="_blank" rel="noreferrer">
                {f.source.label} ↗
              </a>
            )}
          </div>
          {f.impact && f.severity !== "ok" ? <span className="finding__impact">{rupees(f.impact)}</span> : <span />}
        </li>
      ))}
    </ul>
  );
}
