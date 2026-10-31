"""Builds business/Chhat-financial-model.xlsx: a formula-driven, monthly, three-scenario model.

Blue = input, black = formula, green = link to another sheet, yellow fill = key lever.

    python business/build_model.py            write the workbook, print the base case
    python business/build_model.py --verify   also recalculate every formula (needs `pip install formulas`)
                                              and check each key figure against the Python engine below
    python business/build_model.py --json F   also dump the engine's results for all scenarios to F

The Python engine (run_scenario) and the spreadsheet formulas implement the same model. --verify proves
they agree, so a number quoted in the deck or business plan can be traced to a cell.
"""
import argparse
import json
import sys
import zipfile
from xml.sax.saxutils import escape

from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

OUT = "business/Chhat-financial-model.xlsx"
AS_OF = "30 Oct 2026"

# ----------------------------------------------------------------------------- time axis
FY = ["FY27*", "FY28", "FY29", "FY30", "FY31"]
MONTHS = [5, 12, 12, 12, 12]
N = sum(MONTHS)  # 53 months, Nov 2026 to Mar 2031
_MN = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
MLAB = ["Nov-26", "Dec-26", "Jan-27", "Feb-27", "Mar-27"] + [
    f"{mn}-{(fy - 1 if i < 9 else fy):02d}" for fy in range(28, 32) for i, mn in enumerate(_MN)
]
FYI = [y for y, n in enumerate(MONTHS) for _ in range(n)]  # 0-based FY of each month
POS = [p for n in MONTHS for p in range(1, n + 1)]  # 1-based position inside its FY
FYCOLS = []  # (first, last) month index per FY, 1-based
_s = 1
for n in MONTHS:
    FYCOLS.append((_s, _s + n - 1))
    _s += n

# ----------------------------------------------------------------------------- inputs
# Scenario drivers. Each list is FY27*..FY31.
BASE = dict(
    reports=[40000, 400000, 1200000, 2500000, 4000000],
    lead_rate=[0.08] * 5,
    install_rate=[0.20] * 5,
    lead_fee=[1500] * 5,
    cac=[100, 85, 75, 65, 60],
    saas_subs=[25, 300, 900, 1600, 2500],
    states=[0, 1, 3, 6, 10],
    hire=[1.0] * 5,
)
SCENARIOS = {
    "Base": BASE,
    "Downside": dict(
        reports=[round(r * 0.7) for r in BASE["reports"]],
        lead_rate=[0.07] * 5,
        install_rate=[0.17] * 5,
        lead_fee=[1300] * 5,
        cac=[round(c * 1.1, 1) for c in BASE["cac"]],
        saas_subs=[round(s * 0.6) for s in BASE["saas_subs"]],
        states=[0, 0, 2, 4, 6],
        hire=[1.0, 0.8, 0.8, 0.8, 0.8],
    ),
    "Upside": dict(
        reports=[round(r * 1.2) for r in BASE["reports"]],
        lead_rate=[0.09] * 5,
        install_rate=[0.22] * 5,
        lead_fee=[1650] * 5,
        cac=[round(c * 0.9, 1) for c in BASE["cac"]],
        saas_subs=[round(s * 1.2) for s in BASE["saas_subs"]],
        states=[0, 1, 4, 7, 12],
        hire=[1.0, 1.15, 1.15, 1.15, 1.15],
    ),
}
SCEN_NOTE = {
    "Base": "Plan case.",
    "Downside": "30% less traffic, ~25% less revenue per report (7% leads, 17% installs, ₹1,300 fee), CAC +10%, "
                "SaaS -40%, fewer states. Management response: non-caller hiring held at 80% of plan from FY28.",
    "Upside": "20% more traffic, ~25% more revenue per report (9% leads, 22% installs, ₹1,650 fee), CAC -10%, "
              "SaaS +20%. Hiring runs 15% above plan from FY28 to serve the volume.",
}
FUNCS = ["eng", "growth", "network", "support", "b2g", "ga"]
FUNC_LABEL = {
    "eng": "Product & engineering (incl. design, ML/PV)",
    "growth": "Growth & content",
    "network": "Installer network & partnerships",
    "support": "Customer & installer support",
    "b2g": "State / DISCOM sales",
    "ga": "G&A (founder-CEO, finance, HR, legal)",
}
C = dict(
    kw=3.2,
    price_kw=[58000, 57000, 56000, 55000, 54000],
    success_fee=0.02,
    collect=0.85,
    refund=0.05,
    loan_share=0.35,
    loan_amt=160000,
    orig_fee=0.01,
    saas_price=2999,
    state_fee=40,
    heads=dict(eng=[5, 12, 18, 24, 30], growth=[2, 4, 7, 9, 11], network=[2, 5, 9, 12, 15],
               support=[1, 3, 6, 9, 12], b2g=[0, 1, 2, 3, 4], ga=[1, 2, 4, 6, 8]),
    prelaunch=dict(eng=1, growth=1, network=0, support=0, b2g=0, ga=1),
    ctc=dict(eng=22, growth=12, network=9, support=4.5, b2g=24, ga=15),
    caller_ctc=3.0,
    caller_cap=600,
    founders=3,
    esc=0.09,
    load=0.05,
    ga_pct=0.15,
    office=[10, 50, 100, 150, 200],
    ops_pct=0.03,
    device=0.9,
    tax=0.25168,
    d_lead=0, d_succ=30, d_loan=45, d_saas=0, d_b2g=120,
    tds=0.02,
    open_cash=20,
    seed=600,
    equity=0.15,
    series_a=0,
    series_a_month=25,
)
AI = dict(
    fx=95.0,
    price=dict(opus=(4.0, 20.0), sonnet=(2.0, 10.0), haiku=(0.10, 0.50)),
    hit_mult=dict(opus=0.05, sonnet=0.05, haiku=0.10),
    write_mult=1.25,
    ext_in=3600, ext_out=400,
    chat_in=16500, chat_hit=0.65, chat_out=2000,
    ext_per_report=0.80, chat_per_report=0.25,
    infra=0.50, contingency=0.25,
    routed=[0, 1, 1, 1, 1],
)
MARKET = dict(ceew_gw=32, hh_benefited=6136209, installations=5172635, applications=9032142, target=10000000,
              jul_adds=506000, national=20, vendors=29469, states_uts=36, saving_yr=28869)
SENS_FEES = [900, 1200, 1500, 1800, 2100]
SENS_CONV = [0.12, 0.16, 0.20, 0.24, 0.28]


def ramp_weights(reports):
    """Monthly share of each FY's reports: FY27 is a fixed launch ramp; later years grow at a constant
    monthly rate that continues smoothly from the previous year's exit rate. Each year sums to 100%."""
    w = [[0.08, 0.14, 0.20, 0.26, 0.32]]
    prev_exit = reports[0] * w[0][-1]
    for y in range(1, 5):
        target = reports[y] / prev_exit
        lo, hi = 0.5, 2.0
        for _ in range(200):
            r = (lo + hi) / 2
            lo, hi = (r, hi) if sum(r ** (i + 1) for i in range(12)) < target else (lo, r)
        ws = [r ** (i + 1) for i in range(12)]
        w.append([x / sum(ws) for x in ws])
        prev_exit = reports[y] * w[y][-1]
    return w


WEIGHTS = ramp_weights(BASE["reports"])  # scenarios scale every year alike, so the shape is shared


# ----------------------------------------------------------------------------- Python engine
def ai_unit_costs():
    fx, P = AI["fx"], AI["price"]

    def extraction(m):
        return (AI["ext_in"] * P[m][0] + AI["ext_out"] * P[m][1]) / 1e6 * fx

    def chat(m):
        eff = AI["chat_hit"] * AI["hit_mult"][m] + (1 - AI["chat_hit"]) * AI["write_mult"]
        return (AI["chat_in"] * P[m][0] * eff + AI["chat_out"] * P[m][1]) / 1e6 * fx

    k = 1 + AI["contingency"]
    opus = (AI["ext_per_report"] * extraction("opus") + AI["chat_per_report"] * chat("opus") + AI["infra"]) * k
    routed = (AI["ext_per_report"] * extraction("haiku") + AI["chat_per_report"] * chat("sonnet") + AI["infra"]) * k
    return dict(ext_opus=extraction("opus"), ext_haiku=extraction("haiku"), chat_opus=chat("opus"),
                chat_sonnet=chat("sonnet"), opus=opus, routed=routed,
                per_year=[routed if AI["routed"][y] else opus for y in range(5)])


def run_scenario(name):
    s = SCENARIOS[name]
    ai = ai_unit_costs()["per_year"]
    yv = lambda key, m: s[key][FYI[m]]  # noqa: E731
    n_of = lambda m: MONTHS[FYI[m]]  # noqa: E731

    def ramp(vals, prev0, m):
        y, p, n = FYI[m], POS[m], n_of(m)
        prev = prev0 if y == 0 else vals[y - 1]
        return vals[y] + (vals[y] - prev) * (p - (n + 1) / 2) / n

    M = {k: [0.0] * N for k in (
        "reports", "leads", "installs", "sysval", "r_lead", "r_succ", "r_loan", "subs", "r_saas", "r_b2g", "rev",
        "acq", "ai", "ops", "gp", "callers", "heads", "payroll", "pay_callers", "ga", "office", "opex", "ebitda",
        "capex", "dep", "ebit", "tax", "ar", "tds", "tds_bal", "wc", "dwc", "equity", "open", "net", "close", "burn")}
    pay_f = {f: [0.0] * N for f in FUNCS}
    heads_f = {f: [0.0] * N for f in FUNCS}
    for m in range(N):
        y = FYI[m]
        M["reports"][m] = s["reports"][y] * WEIGHTS[y][POS[m] - 1]
        M["leads"][m] = M["reports"][m] * yv("lead_rate", m)
        M["installs"][m] = M["leads"][m - 2] * yv("install_rate", m) if m >= 2 else 0.0
        M["sysval"][m] = C["kw"] * C["price_kw"][y]
        M["r_lead"][m] = M["leads"][m] * yv("lead_fee", m) * (1 - C["refund"]) / 1e5
        M["r_succ"][m] = M["installs"][m] * M["sysval"][m] * C["success_fee"] * C["collect"] / 1e5
        M["r_loan"][m] = M["installs"][m] * C["loan_share"] * C["loan_amt"] * C["orig_fee"] / 1e5
        M["subs"][m] = ramp(s["saas_subs"], 0, m)
        M["r_saas"][m] = M["subs"][m] * C["saas_price"] / 1e5
        M["r_b2g"][m] = yv("states", m) * C["state_fee"] / 12
        M["rev"][m] = M["r_lead"][m] + M["r_succ"][m] + M["r_loan"][m] + M["r_saas"][m] + M["r_b2g"][m]
        M["acq"][m] = M["reports"][m] * yv("cac", m) / 1e5
        M["ai"][m] = M["reports"][m] * ai[y] / 1e5
        M["ops"][m] = M["rev"][m] * C["ops_pct"]
        M["gp"][m] = M["rev"][m] - M["acq"][m] - M["ai"][m] - M["ops"][m]
        esc = (1 + C["esc"]) ** y
        for f in FUNCS:
            heads_f[f][m] = ramp(C["heads"][f], C["prelaunch"][f], m) * yv("hire", m)
            pay_f[f][m] = heads_f[f][m] * C["ctc"][f] * esc / 12 * (1 + C["load"])
        M["callers"][m] = M["leads"][m] / C["caller_cap"]
        M["pay_callers"][m] = M["callers"][m] * C["caller_ctc"] * esc / 12 * (1 + C["load"])
        M["heads"][m] = sum(heads_f[f][m] for f in FUNCS) + M["callers"][m]
        M["payroll"][m] = sum(pay_f[f][m] for f in FUNCS) + M["pay_callers"][m]
        M["ga"][m] = M["payroll"][m] * C["ga_pct"]
        M["office"][m] = C["office"][y] / MONTHS[y]
        M["opex"][m] = M["payroll"][m] + M["ga"][m] + M["office"][m]
        M["ebitda"][m] = M["gp"][m] - M["opex"][m]
        prev_h = C["founders"] if m == 0 else M["heads"][m - 1]
        M["capex"][m] = C["device"] * max(0.0, M["heads"][m] - prev_h) + (M["capex"][m - 36] if m >= 36 else 0.0)
        M["dep"][m] = sum(M["capex"][max(0, m - 35): m + 1]) / 36
        M["ebit"][m] = M["ebitda"][m] - M["dep"][m]
        M["ar"][m] = (M["r_lead"][m] * C["d_lead"] + M["r_succ"][m] * C["d_succ"] + M["r_loan"][m] * C["d_loan"]
                      + M["r_saas"][m] * C["d_saas"] + M["r_b2g"][m] * C["d_b2g"]) / 30
        M["tds"][m] = C["tds"] * (M["r_lead"][m] + M["r_succ"][m] + M["r_loan"][m] + M["r_b2g"][m])
        M["tds_bal"][m] = sum(M["tds"][max(0, m - 11): m + 1])
        M["wc"][m] = M["ar"][m] + M["tds_bal"][m]
        M["dwc"][m] = M["wc"][m] - (M["wc"][m - 1] if m else 0.0)

    A = {}  # annual
    for k in ("reports", "leads", "installs", "r_lead", "r_succ", "r_loan", "r_saas", "r_b2g", "rev", "acq", "ai",
              "ops", "gp", "payroll", "pay_callers", "ga", "office", "opex", "ebitda", "capex", "dep", "ebit", "dwc"):
        A[k] = [sum(M[k][a - 1: b]) for a, b in FYCOLS]
    A["pay_f"] = {f: [sum(pay_f[f][a - 1: b]) for a, b in FYCOLS] for f in FUNCS}
    A["avg_heads"] = [sum(M["heads"][a - 1: b]) / (b - a + 1) for a, b in FYCOLS]
    A["end_heads"] = [M["heads"][b - 1] for a, b in FYCOLS]
    loss_bf, A["loss_bf"], A["taxable"], A["tax"], A["loss_cf"] = 0.0, [], [], [], []
    for y in range(5):
        pbt = A["ebit"][y]
        A["loss_bf"].append(loss_bf)
        taxable = max(0.0, pbt - loss_bf)
        A["taxable"].append(taxable)
        A["tax"].append(taxable * C["tax"])
        loss_bf = max(0.0, loss_bf - pbt)
        A["loss_cf"].append(loss_bf)
    A["pat"] = [A["ebit"][y] - A["tax"][y] for y in range(5)]
    cash = C["open_cash"]
    for m in range(N):
        y = FYI[m]
        M["tax"][m] = A["tax"][y] if POS[m] == MONTHS[y] else 0.0
        M["equity"][m] = (C["seed"] if m == 0 else 0.0) + (C["series_a"] if m + 1 == C["series_a_month"] else 0.0)
        M["open"][m] = cash
        M["net"][m] = M["equity"][m] + M["ebitda"][m] - M["tax"][m] - M["capex"][m] - M["dwc"][m]
        cash += M["net"][m]
        M["close"][m] = cash
        M["burn"][m] = -(M["ebitda"][m] - M["capex"][m] - M["dwc"][m])
    A["tax_paid"] = A["tax"]
    A["equity"] = [sum(M["equity"][a - 1: b]) for a, b in FYCOLS]
    A["close"] = [M["close"][b - 1] for a, b in FYCOLS]
    A["wc_end"] = [M["wc"][b - 1] for a, b in FYCOLS]
    last_neg = max([m + 1 for m in range(N) if M["ebitda"][m] <= 0], default=0)
    trough = min(M["close"])
    out = dict(M=M, A=A, heads_f=heads_f,
               breakeven=MLAB[last_neg] if last_neg < N else "beyond FY31",
               breakeven_idx=last_neg + 1,
               trough=trough, trough_month=MLAB[M["close"].index(trough)],
               peak_burn=max(M["burn"]), gap=max(0.0, -trough))
    neg = [m for m in range(N) if M["close"][m] < 0]
    out["cash_out_month"] = MLAB[neg[0]] if neg else "never"
    return out


def unit_economics(base):
    A, y = base["A"], 1  # FY28
    rep = A["reports"][y]
    ai = ai_unit_costs()["per_year"][y]
    rev_r = A["rev"][y] * 1e5 / rep
    callers_r = A["pay_callers"][y] * 1e5 / rep
    var_r = BASE["cac"][y] + ai + callers_r + rev_r * C["ops_pct"]
    sysv = C["kw"] * C["price_kw"][y]
    lead_h = BASE["lead_fee"][y] * (1 - C["refund"]) / BASE["install_rate"][y]
    succ_h = sysv * C["success_fee"] * C["collect"]
    loan_h = C["loan_share"] * C["loan_amt"] * C["orig_fee"]
    mkt_h = lead_h + succ_h + loan_h
    rph = 1 / (BASE["lead_rate"][y] * BASE["install_rate"][y])
    callers_h = callers_r * rph
    var_h = rph * (BASE["cac"][y] + ai) + callers_h + mkt_h * C["ops_pct"]
    installer_cost = lead_h + sysv * C["success_fee"]
    return dict(rev_r=rev_r, var_r=var_r, contrib_r=rev_r - var_r, mult=rev_r / var_r, rph=rph,
                lead_h=lead_h, succ_h=succ_h, loan_h=loan_h, mkt_h=mkt_h, var_h=var_h, contrib_h=mkt_h - var_h,
                margin_h=(mkt_h - var_h) / mkt_h, installer_cost=installer_cost, installer_pct=installer_cost / sysv,
                ai_pct=A["ai"][y] / A["rev"][y], take=mkt_h / (MARKET["saving_yr"] * 25), callers_r=callers_r,
                ai_r=ai, cac=BASE["cac"][y])


def market(base, ue):
    sysv = C["kw"] * C["price_kw"][1]
    homes_lakh = MARKET["ceew_gw"] * 1e6 / C["kw"] / 1e5
    tam = homes_lakh * 1e5 * sysv / 1e7
    left = MARKET["target"] - MARKET["hh_benefited"]
    pace = MARKET["jul_adds"] * 12 / 1e5
    annual_value = MARKET["national"] * 1e5 * sysv / 1e7
    pool_mkt = MARKET["national"] * 1e5 * ue["mkt_h"] / 1e7
    pool_saas = MARKET["vendors"] * C["saas_price"] * 12 / 1e7
    pool_b2g = MARKET["states_uts"] * C["state_fee"] / 100
    sam = pool_mkt + pool_saas + pool_b2g
    som = base["A"]["rev"][4] / 100
    return dict(sysv=sysv, homes_lakh=homes_lakh, tam=tam, left=left, pace=pace, annual_value=annual_value,
                pool_mkt=pool_mkt, pool_saas=pool_saas, pool_b2g=pool_b2g, sam=sam, som=som, som_share=som / sam,
                inst_share=base["A"]["installs"][4] / (MARKET["national"] * 1e5))


def use_of_funds(base):
    """Seed-period (FY27*-FY28) gross spend by bucket; the shares allocate the seed."""
    A = base["A"]
    t = lambda v: v[0] + v[1]  # noqa: E731
    b = {
        "Product & engineering (team, AI, devices)": t(A["pay_f"]["eng"]) + t(A["ai"]) + t(A["capex"]),
        "Growth (acquisition + growth team)": t(A["acq"]) + t(A["pay_f"]["growth"]),
        "Installer network, lead verification & support": t(A["pay_f"]["network"]) + t(A["pay_callers"])
        + t(A["pay_f"]["support"]) + t(A["ops"]),
        "G&A, compliance, office & state sales": t(A["ga"]) + t(A["pay_f"]["ga"]) + t(A["office"]) + t(A["pay_f"]["b2g"]),
    }
    tot = sum(b.values())
    return {k: (v, v / tot) for k, v in b.items()}, tot


def sensitivity(base):
    A, y = base["A"], 2
    grid = []
    for conv in SENS_CONV:
        row = []
        for fee in SENS_FEES:
            d = (fee - BASE["lead_fee"][y]) * (1 - C["refund"]) * A["leads"][y] / 1e5 \
                + (conv / BASE["install_rate"][y] - 1) * (A["r_succ"][y] + A["r_loan"][y])
            row.append(A["ebitda"][y] + (1 - C["ops_pct"]) * d)
        grid.append(row)
    return grid


# ----------------------------------------------------------------------------- workbook styling
F = "Arial"
BLUE = Font(name=F, color="0000FF")
BLACK = Font(name=F, color="000000")
GREEN = Font(name=F, color="008000")
GREY = Font(name=F, color="666666", italic=True)
SMALL = Font(name=F, size=9, color="666666")
BOLD = Font(name=F, bold=True)
TITLE = Font(name=F, bold=True, size=14)
HEAD = Font(name=F, bold=True, color="FFFFFF")
HEAD_FILL = PatternFill("solid", fgColor="1E2A4A")
KEY = PatternFill("solid", fgColor="FFFF00")
SECTION = PatternFill("solid", fgColor="EEF2F8")
TOP = Border(top=Side(style="thin", color="C9CED6"))
INR = '#,##0;(#,##0);"-"'
INR1 = '#,##0.0;(#,##0.0);"-"'
INR2 = '#,##0.00;(#,##0.00);"-"'
PCT = '0.0%;(0.0%);"-"'
PCT0 = '0%;(0%);"-"'
MULT = '0.0"x"'
COLS = ["C", "D", "E", "F", "G"]


def mcol(m):  # 1-based month -> column letter (C = Nov-26)
    return get_column_letter(2 + m)


def q(sheet):
    return f"'{sheet}'"


def hdr(ws, row, first="₹ lakh unless stated", labels=FY, start_col=3, extra=None):
    ws.cell(row=row, column=1, value=first)
    ws.cell(row=row, column=2, value="Unit / note")
    for i, lab in enumerate(labels):
        ws.cell(row=row, column=start_col + i, value=lab)
    if extra:
        for col, lab in extra.items():
            ws.cell(row=row, column=col, value=lab)
    last = max(start_col + len(labels) - 1, max(extra) if extra else 0)
    for c in range(1, last + 1):
        cell = ws.cell(row=row, column=c)
        cell.font = HEAD
        cell.fill = HEAD_FILL
        if c >= 3:
            cell.alignment = Alignment(horizontal="right")


def section(ws, row, text, width=7):
    ws.cell(row=row, column=1, value=text).font = BOLD
    for c in range(1, width + 1):
        ws.cell(row=row, column=c).fill = SECTION


def put(ws, ref, value, font=BLACK, fmt=None, fill=None, bold=False):
    cell = ws[ref]
    cell.value = value
    cell.font = Font(name=F, bold=bold or font.bold, italic=font.italic, color=font.color, size=font.size)
    if fmt:
        cell.number_format = fmt
    if fill:
        cell.fill = fill
    return cell


# ----------------------------------------------------------------------------- build
def build():
    wb = Workbook()
    REF = {}  # input key -> row on Assumptions

    # ------------------------------------------------------------- Assumptions
    A = wb.active
    A.title = "Assumptions"
    A["A1"] = "Assumptions"
    A["A1"].font = TITLE
    A["A2"] = f"Every input in the model. Blue = change me. Facts are dated and sourced in column I (and on the Sources sheet). As of {AS_OF}."
    A["A2"].font = GREY
    hdr(A, 3, "Input", extra={8: "Pre-launch", 9: "Source / rationale"})
    A.column_dimensions["A"].width = 50
    A.column_dimensions["B"].width = 34
    for c in COLS + ["H"]:
        A.column_dimensions[c].width = 13
    A.column_dimensions["I"].width = 120
    r = 4

    def inp(key, label, unit, vals, fmt, lever=False, note=None, pre=None):
        nonlocal r
        A.cell(row=r, column=1, value=label).font = BLACK
        A.cell(row=r, column=2, value=unit).font = GREY
        vals = vals if isinstance(vals, list) else [vals]
        for c, v in zip(COLS, vals):
            put(A, f"{c}{r}", v, BLUE, fmt, KEY if lever else None)
        if pre is not None:
            put(A, f"H{r}", pre, BLUE, fmt)
        if note:
            A.cell(row=r, column=9, value=note).font = SMALL
            A.cell(row=r, column=1).comment = Comment(note, "Claude")
        REF[key] = r
        r += 1

    def link(key, label, unit, formula_by_col, fmt, note=None):
        nonlocal r
        A.cell(row=r, column=1, value=label).font = BLACK
        A.cell(row=r, column=2, value=unit).font = GREY
        for c in COLS:
            put(A, f"{c}{r}", formula_by_col(c), GREEN, fmt)
        if note:
            A.cell(row=r, column=9, value=note).font = SMALL
        REF[key] = r
        r += 1

    def sec(text):
        nonlocal r
        r += 1
        section(A, r, text, 9)
        r += 1

    sec("Timeline")
    inp("months", "Months in year", "FY27* = Nov 2026 to Mar 2027", MONTHS, INR,
        note="Launch at code freeze, 1 Nov 2026. Indian financial year runs April to March.")

    notes = {
        "reports": "Plan volume. Cross-check: FY31 reports are ~0.4 per home installing nationally at the 2026 pace "
                   "(Market sheet). Paid search at ₹15-45 per click (quickestimate.co, 2026) drives the paid share.",
        "lead_rate": "Share of reports that ask for vetted installer quotes and pass a verification call. Assumption.",
        "install_rate": "Verified, exclusive leads that arrive with a bill and roof model. Shared/cold leads close lower. Assumption; tested on Sensitivity.",
        "lead_fee": "Indian solar leads: ₹150-400 low quality, ₹1,200-3,500 medium-high (Mocaup, 2026). Verified, sized and exclusive: inside that band.",
        "cac": "Blended cost per report: paid search (₹15-45 CPC ÷ ~30% click-to-report) mixed with organic, WhatsApp shares and content.",
        "saas_subs": "Average paying installers on the quote/CRM tool. 29,469 active vendors on the national portal (SolarQuarter, Aug 2026).",
        "states": "State / DISCOM billing-analytics contracts (count, starting each April).",
        "hire": "Multiplier on non-caller headcount from FY28 (management response). Callers always scale with leads.",
    }
    units = {"reports": "count", "lead_rate": "% of reports", "install_rate": "% of leads (2-month lag)",
             "lead_fee": "₹ per verified lead", "cac": "₹ per report", "saas_subs": "count (average)",
             "states": "count", "hire": "x plan"}
    fmts = {"reports": INR, "lead_rate": PCT, "install_rate": PCT, "lead_fee": INR, "cac": INR1, "saas_subs": INR,
            "states": INR, "hire": '0.00"x"'}
    labels = {"reports": "Roof Reports generated", "lead_rate": "Report → verified lead",
              "install_rate": "Verified lead → installed home", "lead_fee": "Lead fee paid by installer",
              "cac": "Blended acquisition cost", "saas_subs": "Paying installers on SaaS",
              "states": "State / DISCOM analytics contracts", "hire": "Hiring factor (non-caller teams)"}
    levers = {"reports", "lead_rate", "install_rate", "lead_fee", "cac"}
    for sc in SCENARIOS:
        sec(f"Scenario drivers: {sc}. {SCEN_NOTE[sc]}")
        for k in ["reports", "lead_rate", "install_rate", "lead_fee", "cac", "saas_subs", "states", "hire"]:
            inp(f"{k}@{sc}", labels[k], units[k], SCENARIOS[sc][k], fmts[k], lever=(sc == "Base" and k in levers),
                note=notes[k] if sc == "Base" else None)

    sec("Pricing and funnel (all scenarios)")
    inp("kw", "Average system size", "kWp", C["kw"], "0.0", note="Most PM Surya Ghar homes install ~3 kW to capture the full ₹78,000 subsidy.")
    inp("price_kw", "Average installed price", "₹ per kW", C["price_kw"], INR,
        note="2026 guides: ₹55,000-85,000/kW before subsidy; Tata Power ₹55,000-72,000. Chhat's fair-price band, falling ~2%/yr.")
    inp("success_fee", "Success fee on completed installs", "% of system value", C["success_fee"], PCT, note="Billed to the installer at commissioning.")
    inp("collect", "Success fees actually collected", "% of fees due", C["collect"], PCT0,
        note="Leakage: some installs close off-platform or go unreported. Post-install bill audits catch part of it. Assumption.")
    inp("refund", "Lead credits for disputed leads", "% of lead fees", C["refund"], PCT0, note="Credits for unreachable or duplicate leads. Assumption.")
    inp("loan_share", "Installs financed", "% of installs", C["loan_share"], PCT0,
        note="21.87 lakh concessional loans sanctioned against ~50 lakh homes by Aug 2026 (SolarQuarter): ~44%. 35% is conservative.")
    inp("loan_amt", "Average loan", "₹", C["loan_amt"], INR, note="≈ 90% of a 3 kW system before subsidy; collateral-free up to ₹2 lakh.")
    inp("orig_fee", "Loan origination fee", "% of loan", C["orig_fee"], PCT, note="DSA-style payout from the bank or NBFC. Assumption.")
    inp("saas_price", "Installer SaaS price", "₹ per month (ex-GST)", C["saas_price"], INR)
    inp("state_fee", "State / DISCOM contract value", "₹ lakh per state-year", C["state_fee"], INR1)

    sec("Team and pay (base plan; scenario hiring factor applies from FY28)")
    for f in FUNCS:
        inp(f"heads_{f}", f"Headcount: {FUNC_LABEL[f]}", "average for the year", C["heads"][f], INR1, pre=C["prelaunch"][f],
            note="First ten (FY27): 4 engineers incl. one ML/PV, 1 designer, 2 growth, 2 installer ops, 1 founder-CEO; support starts with 1." if f == "eng" else None)
    for f in FUNCS:
        inp(f"ctc_{f}", f"CTC: {FUNC_LABEL[f]}", "₹ lakh per person-year, FY27 level", C["ctc"][f], INR1,
            note={"eng": "Bengaluru startup SDE-2 ₹20-40 lakh cash (AmbitionBox, Instahyre, 2026); blended with a designer; ESOPs on top.",
                  "support": "Experienced support executives, Hindi and English.",
                  "ga": "Founder-CEO draws a below-market salary."}.get(f))
    inp("caller_ctc", "CTC: lead-verification caller", "₹ lakh per person-year, FY27 level", C["caller_ctc"], INR1,
        note="Voice-process median ₹2.3 lakh a year (Hyring 2026 salary model); listings ₹12,000-35,000 a month. Skilled Hindi callers sit above median.")
    inp("caller_cap", "Leads verified per caller", "per month", C["caller_cap"], INR, note="~30 verification calls a day, 20 working days.")
    inp("founders", "Founding team before launch", "people (already equipped)", C["founders"], INR)
    inp("esc", "Annual pay rise (each April)", "%", C["esc"], PCT, note="Aon 2026: 9.1% average; Mercer 2026: 9% median (high tech 9.3%).")
    inp("load", "Benefits loading on CTC", "%", C["load"], PCT0, note="Group health cover and gratuity provision. Employer PF sits inside CTC by Indian convention.")

    sec("Operating costs")
    link("ai_cost", "AI + infrastructure cost", "₹ per report",
         lambda c: f"={q('AI cost')}!{c}$24", '#,##0.00', note="From the AI cost sheet: token counts × Claude API prices × ₹/$ × usage per report.")
    inp("ga_pct", "G&A", "% of payroll", C["ga_pct"], PCT0, note="Recruiting, travel, insurance, training, software seats.")
    inp("office", "Office, tools, compliance", "₹ lakh for the year (FY27*: 5 months)", C["office"], INR1,
        note="≈ ₹1.5 lakh per head a year (co-working seat, tools) plus statutory audit, legal, company secretary.")
    inp("ops_pct", "Payments + partner ops", "% of revenue", C["ops_pct"], PCT0, note="Payment gateway (~2%) on wallet top-ups and SaaS, plus partner incentives.")
    inp("device", "Laptop/device per new hire", "₹ lakh", C["device"], INR2, note="Replaced after 36 months. Depreciated straight-line over 36 months (Companies Act Sch. II: 3 years for end-user devices).")

    sec("Tax and working capital")
    inp("tax", "Corporate tax rate", "% of taxable profit", C["tax"], '0.000%',
        note="Income-tax Act, 2025 s.200 (old s.115BAA): 22% + 10% surcharge + 4% cess. Losses carried forward up to 8 tax years (s.112).")
    inp("d_lead", "Receivable days: lead fees", "days", C["d_lead"], INR, note="Installers prepay a lead wallet.")
    inp("d_succ", "Receivable days: success fees", "days", C["d_succ"], INR)
    inp("d_loan", "Receivable days: loan fees", "days", C["d_loan"], INR, note="Lenders pay monthly in arrears.")
    inp("d_saas", "Receivable days: SaaS", "days", C["d_saas"], INR, note="Billed monthly in advance.")
    inp("d_b2g", "Receivable days: state contracts", "days", C["d_b2g"], INR, note="Government payment cycles.")
    inp("tds", "TDS deducted by business customers", "% of B2B receipts", C["tds"], PCT0,
        note="Withheld at source on fees and commissions; refunded or set off about a year later. Modelled as a trailing-12-month balance.")

    sec("Funding")
    inp("open_cash", "Founders' capital at launch", "₹ lakh", C["open_cash"], INR1)
    inp("seed", "Seed round (Nov 2026)", "₹ lakh", C["seed"], INR1, lever=True, note="The ask.")
    inp("equity", "Equity offered for the seed", "%", C["equity"], PCT0, lever=True)
    inp("series_a", "Series A (optional, not in plan)", "₹ lakh", C["series_a"], INR1,
        note="Zero in every scenario: the plan does not depend on it. Enter an amount to test it.")
    inp("series_a_month", "Series A month", "month number (1 = Nov-26)", C["series_a_month"], INR)
    A.freeze_panes = "C4"

    def a1(key, col="C"):  # absolute single-cell reference
        return f"Assumptions!${col}${REF[key]}"

    def arow(key):  # FY27..FY31 range on Assumptions
        return f"Assumptions!$C${REF[key]}:$G${REF[key]}"

    # ------------------------------------------------------------- AI cost
    S = wb.create_sheet("AI cost")
    S["A1"] = "AI cost per report"
    S["A1"].font = TITLE
    S["A2"] = "Claude API list prices (platform.claude.com pricing page, read 30 Oct 2026) × token counts measured against app/server/claude.ts."
    S["A2"].font = GREY
    S.column_dimensions["A"].width = 54
    S.column_dimensions["B"].width = 30
    for c in COLS:
        S.column_dimensions[c].width = 13
    S.column_dimensions["I"].width = 90
    hdr(S, 4, "Model prices", labels=["Input $/MTok", "Output $/MTok", "Cache-hit x", "Cache-write x"])
    prices = [("Claude Opus 5.5 (claude-opus-5-5)", "opus"), ("Claude Sonnet 5.5 (claude-sonnet-5-5)", "sonnet"),
              ("Claude Haiku 5.5 (claude-haiku-5-5), prompts ≤100K", "haiku")]
    PR = {}
    for i, (lab, k) in enumerate(prices):
        rr = 5 + i
        S.cell(row=rr, column=1, value=lab)
        put(S, f"C{rr}", AI["price"][k][0], BLUE, '0.00')
        put(S, f"D{rr}", AI["price"][k][1], BLUE, '0.00')
        put(S, f"E{rr}", AI["hit_mult"][k], BLUE, '0.00"x"')
        put(S, f"F{rr}", AI["write_mult"], BLUE, '0.00"x"')
        PR[k] = rr
    S["I5"] = "Opus 5.5 and Sonnet 5.5 cache hits are billed at 0.05x input; other models 0.1x. 5-minute cache writes 1.25x."
    S["I5"].font = SMALL
    rows = [
        (10, "Exchange rate", "₹ per US$", AI["fx"], '0.00', "RBI-reference close ₹94.93 on 30 Oct 2026; rounded up."),
        (11, "Document extraction: input tokens per call", "tokens", AI["ext_in"], INR,
         "Bill photo downscaled to 1,800 px (client.ts) ≈ 3,185 visual tokens (⌈w/28⌉×⌈h/28⌉) + schema and instruction."),
        (12, "Document extraction: output tokens per call", "tokens", AI["ext_out"], INR, "Strict JSON, 12-27 fields, plus low-effort reasoning."),
        (13, "Ask Chhat session: input tokens", "tokens", AI["chat_in"], INR, "~5 calls × (system + 7 tool schemas + history)."),
        (14, "Ask Chhat session: share of input served from cache", "%", AI["chat_hit"], PCT0, "System prompt and tool schemas repeat on every call."),
        (15, "Ask Chhat session: output tokens", "tokens", AI["chat_out"], INR, "Tool calls plus 2-6 sentence answers."),
        (16, "Extractions per report", "calls", AI["ext_per_report"], '0.00', "60% upload a bill, 15% a quote, 5% a solar bill; the rest use samples or typed units."),
        (17, "Ask Chhat sessions per report", "sessions", AI["chat_per_report"], '0.00', "Assumption."),
        (18, "Hosting, CDN, serverless, logs", "₹ per report", AI["infra"], '0.00', "Assumption."),
        (19, "Contingency", "%", AI["contingency"], PCT0, "Retries, longer chats, model fallback."),
    ]
    for rr, lab, unit, v, fmt, note in rows:
        S.cell(row=rr, column=1, value=lab)
        S.cell(row=rr, column=2, value=unit).font = GREY
        put(S, f"C{rr}", v, BLUE, fmt)
        S.cell(row=rr, column=9, value=note).font = SMALL

    def ext(k):
        return f"($C$11*$C${PR[k]}+$C$12*$D${PR[k]})/1000000*$C$10"

    def chat(k):
        return f"($C$13*$C${PR[k]}*($C$14*$E${PR[k]}+(1-$C$14)*$F${PR[k]})+$C$15*$D${PR[k]})/1000000*$C$10"

    calc = [
        (20, "₹ per report, Opus 5.5 for everything (today's code)", f"=($C$16*{ext('opus')}+$C$17*{chat('opus')}+$C$18)*(1+$C$19)"),
        (21, "₹ per report, routed: Haiku 5.5 reads documents, Sonnet 5.5 chats", f"=($C$16*{ext('haiku')}+$C$17*{chat('sonnet')}+$C$18)*(1+$C$19)"),
    ]
    for rr, lab, f in calc:
        S.cell(row=rr, column=1, value=lab).font = BOLD
        put(S, f"C{rr}", f, BLACK, '#,##0.00', bold=True)
    S["I20"] = "One extraction ≈ ₹2.13 on Opus 5.5 vs ₹0.05 on Haiku 5.5; one chat session ≈ ₹6.75 on Opus 5.5 vs ₹3.37 on Sonnet 5.5."
    S["I20"].font = SMALL
    hdr(S, 22, "By year", labels=FY)
    S.cell(row=23, column=1, value="Routing live? (1 = yes)")
    S.cell(row=23, column=2, value="FY28 onward, after an accuracy eval on real bills").font = GREY
    S.cell(row=24, column=1, value="AI + infrastructure cost per report").font = BOLD
    S.cell(row=24, column=2, value="₹").font = GREY
    for i, c in enumerate(COLS):
        put(S, f"{c}23", AI["routed"][i], BLUE, INR)
        put(S, f"{c}24", f"=IF({c}23=1,$C$21,$C$20)", BLACK, '#,##0.00', bold=True)

    # ------------------------------------------------------------- monthly engines
    def engine_sheet(sc):
        ws = wb.create_sheet(f"M-{sc}")
        ws["A1"] = f"Monthly engine: {sc} case"
        ws["A1"].font = TITLE
        ws["A2"] = f"{SCEN_NOTE[sc]} Months run Nov 2026 to Mar 2031. Annual totals and the tax computation are below the monthly block."
        ws["A2"].font = GREY
        ws.column_dimensions["A"].width = 46
        ws.column_dimensions["B"].width = 22
        for m in range(1, N + 1):
            ws.column_dimensions[mcol(m)].width = 10
        hdr(ws, 3, labels=MLAB)
        R = {}
        row = [4]

        def line(key, label, unit, fn, fmt=INR1, font=BLACK, bold=False):
            rr = row[0]
            ws.cell(row=rr, column=1, value=label).font = BOLD if bold else BLACK
            ws.cell(row=rr, column=2, value=unit).font = GREY
            for m in range(1, N + 1):
                v = fn(m, mcol(m))
                put(ws, f"{mcol(m)}{rr}", v, font, fmt, bold=bold)
            R[key] = rr
            row[0] += 1

        def gap(text=None):
            if text:
                section(ws, row[0], text, 2)
            row[0] += 1

        sk = lambda k: f"{k}@{sc}"  # noqa: E731
        pick = lambda key, c: f"INDEX({arow(key)},1,{c}$4)"  # noqa: E731
        # structure rows
        line("fy", "Financial year (1 = FY27*)", "index", lambda m, c: FYI[m - 1] + 1, INR, GREY)
        line("pos", "Month of financial year", "index", lambda m, c: POS[m - 1], INR, GREY)
        line("n", "Months in financial year", "count", lambda m, c: f"={pick('months', c)}", INR)
        line("w", "Share of the year's reports", "ramp profile", lambda m, c: WEIGHTS[FYI[m - 1]][POS[m - 1] - 1], '0.00%', BLUE)
        line("idx", "Month number", "1 = Nov-26", lambda m, c: m, INR, GREY)
        gap("Funnel")
        line("reports", "Roof Reports", "count", lambda m, c: f"={pick(sk('reports'), c)}*{c}{R['w']}", INR)
        line("leads", "Verified leads", "count", lambda m, c: f"={c}{R['reports']}*{pick(sk('lead_rate'), c)}", INR)
        line("installs", "Installed homes (lead + 2 months)", "count",
             lambda m, c: (f"={mcol(m - 2)}{R['leads']}*{pick(sk('install_rate'), c)}" if m > 2 else 0), INR)
        line("sysval", "Average system value", "₹", lambda m, c: f"={a1('kw')}*{pick('price_kw', c)}", INR)
        gap("Revenue")
        line("r_lead", "Lead fees (net of credits)", "₹ lakh",
             lambda m, c: f"={c}{R['leads']}*{pick(sk('lead_fee'), c)}*(1-{a1('refund')})/100000")
        line("r_succ", "Success fees (collected)", "₹ lakh",
             lambda m, c: f"={c}{R['installs']}*{c}{R['sysval']}*{a1('success_fee')}*{a1('collect')}/100000")
        line("r_loan", "Loan origination", "₹ lakh",
             lambda m, c: f"={c}{R['installs']}*{a1('loan_share')}*{a1('loan_amt')}*{a1('orig_fee')}/100000")
        line("subs", "Paying SaaS installers", "count (ramp)",
             lambda m, c: f"=({pick(sk('saas_subs'), c)}+({pick(sk('saas_subs'), c)}-IF({c}$4=1,0,INDEX({arow(sk('saas_subs'))},1,MAX(1,{c}$4-1))))*({c}$5-({c}$6+1)/2)/{c}$6)", INR1)
        line("r_saas", "Installer SaaS", "₹ lakh", lambda m, c: f"={c}{R['subs']}*{a1('saas_price')}/100000")
        line("r_b2g", "State / DISCOM analytics", "₹ lakh", lambda m, c: f"={pick(sk('states'), c)}*{a1('state_fee')}/12")
        line("rev", "Total revenue", "₹ lakh",
             lambda m, c: f"={c}{R['r_lead']}+{c}{R['r_succ']}+{c}{R['r_loan']}+{c}{R['r_saas']}+{c}{R['r_b2g']}", bold=True)
        gap("Variable costs")
        line("acq", "Customer acquisition", "₹ lakh", lambda m, c: f"={c}{R['reports']}*{pick(sk('cac'), c)}/100000")
        line("ai", "AI + infrastructure", "₹ lakh", lambda m, c: f"={c}{R['reports']}*{pick('ai_cost', c)}/100000")
        line("ops", "Payments + partner ops", "₹ lakh", lambda m, c: f"={c}{R['rev']}*{a1('ops_pct')}")
        line("gp", "Gross profit", "₹ lakh", lambda m, c: f"={c}{R['rev']}-{c}{R['acq']}-{c}{R['ai']}-{c}{R['ops']}", bold=True)
        gap("People")
        line("hire", "Hiring factor", "x plan", lambda m, c: f"={pick(sk('hire'), c)}", '0.00')
        for f in FUNCS:
            key = f"heads_{f}"
            line(key, f"Heads: {FUNC_LABEL[f]}", "people (ramp)",
                 lambda m, c, key=key: f"=({pick(key, c)}+({pick(key, c)}-IF({c}$4=1,{a1(key, 'H')},INDEX({arow(key)},1,MAX(1,{c}$4-1))))*({c}$5-({c}$6+1)/2)/{c}$6)*{c}{R['hire']}")
        line("callers", "Heads: lead-verification callers", "people", lambda m, c: f"={c}{R['leads']}/{a1('caller_cap')}")
        first_h, last_h = R["heads_eng"], R["callers"]
        line("heads", "Total heads", "people", lambda m, c: f"=SUM({c}{first_h}:{c}{last_h})", INR1, bold=True)
        line("esc", "Pay index (April rises)", "x FY27", lambda m, c: f"=(1+{a1('esc')})^({c}$4-1)", '0.000')
        for f in FUNCS:
            line(f"pay_{f}", f"Payroll: {FUNC_LABEL[f]}", "₹ lakh",
                 lambda m, c, f=f: f"={c}{R['heads_' + f]}*{a1('ctc_' + f)}*{c}{R['esc']}/12*(1+{a1('load')})")
        line("pay_callers", "Payroll: lead-verification callers", "₹ lakh",
             lambda m, c: f"={c}{R['callers']}*{a1('caller_ctc')}*{c}{R['esc']}/12*(1+{a1('load')})")
        line("payroll", "Total payroll", "₹ lakh", lambda m, c: f"=SUM({c}{R['pay_eng']}:{c}{R['pay_callers']})", bold=True)
        line("ga", "G&A", "₹ lakh", lambda m, c: f"={c}{R['payroll']}*{a1('ga_pct')}")
        line("office", "Office, tools, compliance", "₹ lakh", lambda m, c: f"={pick('office', c)}/{c}$6")
        line("opex", "Operating expenses", "₹ lakh", lambda m, c: f"={c}{R['payroll']}+{c}{R['ga']}+{c}{R['office']}", bold=True)
        line("ebitda", "EBITDA", "₹ lakh", lambda m, c: f"={c}{R['gp']}-{c}{R['opex']}", bold=True)
        gap("Capex, tax and working capital")
        line("capex", "Capex (devices for new heads + 3-year refresh)", "₹ lakh",
             lambda m, c: (f"={a1('device')}*MAX(0,{c}{R['heads']}-{a1('founders')})" if m == 1 else
                           f"={a1('device')}*MAX(0,{c}{R['heads']}-{mcol(m - 1)}{R['heads']})"
                           + (f"+{mcol(m - 36)}{row[0]}" if m > 36 else "")))
        line("dep", "Depreciation (36 months)", "₹ lakh",
             lambda m, c: f"=SUM({mcol(max(1, m - 35))}{R['capex']}:{c}{R['capex']})/36")
        line("ebit", "EBIT (= profit before tax; no debt)", "₹ lakh", lambda m, c: f"={c}{R['ebitda']}-{c}{R['dep']}")
        tax_row = row[0]
        ann_tax_row_placeholder = {}
        line("tax", "Tax paid (each March)", "₹ lakh", lambda m, c: 0)  # filled after the annual block exists
        line("ar", "Receivables", "₹ lakh",
             lambda m, c: f"=({c}{R['r_lead']}*{a1('d_lead')}+{c}{R['r_succ']}*{a1('d_succ')}+{c}{R['r_loan']}*{a1('d_loan')}"
                          f"+{c}{R['r_saas']}*{a1('d_saas')}+{c}{R['r_b2g']}*{a1('d_b2g')})/30")
        line("tds", "TDS withheld this month", "₹ lakh",
             lambda m, c: f"={a1('tds')}*({c}{R['r_lead']}+{c}{R['r_succ']}+{c}{R['r_loan']}+{c}{R['r_b2g']})")
        line("tds_bal", "TDS awaiting refund (trailing 12 months)", "₹ lakh",
             lambda m, c: f"=SUM({mcol(max(1, m - 11))}{R['tds']}:{c}{R['tds']})")
        line("wc", "Working capital", "₹ lakh", lambda m, c: f"={c}{R['ar']}+{c}{R['tds_bal']}")
        line("dwc", "Increase in working capital", "₹ lakh",
             lambda m, c: f"={c}{R['wc']}" if m == 1 else f"={c}{R['wc']}-{mcol(m - 1)}{R['wc']}")
        gap("Cash")
        line("equity", "Equity raised", "₹ lakh",
             lambda m, c: f"=IF({c}{R['idx']}=1,{a1('seed')},0)+IF({c}{R['idx']}={a1('series_a_month')},{a1('series_a')},0)")
        line("open", "Opening cash", "₹ lakh", lambda m, c: f"={a1('open_cash')}" if m == 1 else f"={mcol(m - 1)}{row[0] + 2}")
        line("net", "Net cash flow", "₹ lakh",
             lambda m, c: f"={c}{R['equity']}+{c}{R['ebitda']}-{c}{R['tax']}-{c}{R['capex']}-{c}{R['dwc']}")
        line("close", "Closing cash", "₹ lakh", lambda m, c: f"={c}{R['open']}+{c}{R['net']}", bold=True)
        line("burn", "Operating burn (before tax; + = burning)", "₹ lakh",
             lambda m, c: f"=-({c}{R['ebitda']}-{c}{R['capex']}-{c}{R['dwc']})")
        line("lastneg", "Helper: last month with EBITDA ≤ 0", "month number",
             lambda m, c: f"=IF({c}{R['ebitda']}<=0,{c}{R['idx']},0)" if m == 1 else
             f"=IF({c}{R['ebitda']}<=0,{c}{R['idx']},{mcol(m - 1)}{row[0]})", INR, GREY)
        line("firstneg", "Helper: first month with cash below zero", "month number",
             lambda m, c: f"=IF({c}{R['close']}<0,{c}{R['idx']},0)" if m == 1 else
             f"=IF({mcol(m - 1)}{row[0]}>0,{mcol(m - 1)}{row[0]},IF({c}{R['close']}<0,{c}{R['idx']},0))", INR, GREY)

        # ---- annual block
        row[0] += 2
        ann_hdr = row[0]
        hdr(ws, ann_hdr, "Annual totals (₹ lakh)")
        row[0] += 1
        AR = {}

        def ann(key, label, fn, fmt=INR1, bold=False):
            rr = row[0]
            ws.cell(row=rr, column=1, value=label).font = BOLD if bold else BLACK
            for y, c in enumerate(COLS):
                put(ws, f"{c}{rr}", fn(y, c), BLACK, fmt, bold=bold)
            AR[key] = rr
            row[0] += 1

        def fysum(src):
            return lambda y, c: f"=SUM({mcol(FYCOLS[y][0])}{R[src]}:{mcol(FYCOLS[y][1])}{R[src]})"

        def fyend(src):
            return lambda y, c: f"={mcol(FYCOLS[y][1])}{R[src]}"

        for key, label, fmt in [("reports", "Roof Reports", INR), ("leads", "Verified leads", INR),
                                ("installs", "Installed homes", INR)]:
            ann(key, label, fysum(key), fmt)
        for key, label in [("r_lead", "Lead fees"), ("r_succ", "Success fees"), ("r_loan", "Loan origination"),
                           ("r_saas", "Installer SaaS"), ("r_b2g", "State / DISCOM analytics")]:
            ann(key, label, fysum(key))
        ann("rev", "Total revenue", fysum("rev"), bold=True)
        for key, label in [("acq", "Customer acquisition"), ("ai", "AI + infrastructure"), ("ops", "Payments + partner ops")]:
            ann(key, label, fysum(key))
        ann("gp", "Gross profit", fysum("gp"), bold=True)
        for f in FUNCS:
            ann(f"pay_{f}", f"Payroll: {FUNC_LABEL[f]}", fysum(f"pay_{f}"))
        ann("pay_callers", "Payroll: lead-verification callers", fysum("pay_callers"))
        ann("payroll", "Total payroll", fysum("payroll"))
        ann("ga", "G&A", fysum("ga"))
        ann("office", "Office, tools, compliance", fysum("office"))
        ann("opex", "Operating expenses", fysum("opex"), bold=True)
        ann("ebitda", "EBITDA", fysum("ebitda"), bold=True)
        ann("dep", "Depreciation", fysum("dep"))
        ann("ebit", "Profit before tax", fysum("ebit"), bold=True)
        ann("loss_bf", "Tax losses brought forward",
            lambda y, c: 0 if y == 0 else f"={COLS[y - 1]}{row[0] + 1}")
        ann("loss_cf", "Tax losses carried forward (s.112: up to 8 years)",
            lambda y, c: f"=MAX(0,{c}{AR['loss_bf']}-{c}{AR['ebit']})")
        ann("taxable", "Taxable profit", lambda y, c: f"=MAX(0,{c}{AR['ebit']}-{c}{AR['loss_bf']})")
        ann("taxann", "Tax", lambda y, c: f"={c}{AR['taxable']}*{a1('tax')}")
        ann("pat", "Profit after tax", lambda y, c: f"={c}{AR['ebit']}-{c}{AR['taxann']}", bold=True)
        ann("capex", "Capex", fysum("capex"))
        ann("dwc", "Increase in working capital", fysum("dwc"))
        ann("equity", "Equity raised", fysum("equity"))
        ann("close", "Closing cash (year end)", fyend("close"), bold=True)
        ann("wc_end", "Working capital (year end)", fyend("wc"))
        ann("avg_heads", "Average heads", lambda y, c: f"=AVERAGE({mcol(FYCOLS[y][0])}{R['heads']}:{mcol(FYCOLS[y][1])}{R['heads']})")
        ann("end_heads", "Heads at year end", fyend("heads"))
        ann("margin", "EBITDA margin", lambda y, c: f"=IF({c}{AR['rev']}=0,0,{c}{AR['ebitda']}/{c}{AR['rev']})", PCT)
        # tax paid in each March
        for y in range(5):
            mm = FYCOLS[y][1]
            put(ws, f"{mcol(mm)}{R['tax']}", f"={COLS[y]}{AR['taxann']}", BLACK, INR1)
        # ---- metrics
        row[0] += 1
        section(ws, row[0], "Funding metrics", 3)
        row[0] += 1
        last = mcol(N)
        rng = lambda k: f"$C${R[k]}:${last}${R[k]}"  # noqa: E731
        MR = {}
        metrics = [
            ("be_idx", "Break-even month number (EBITDA > 0 from here on)", f"={last}{R['lastneg']}+1", INR),
            ("be", "Break-even month", f'=IF(C{row[0]}>{N},"beyond FY31",INDEX($C$3:${last}$3,1,C{row[0]}))', None),
            ("trough", "Lowest closing cash (₹ lakh)", f"=MIN({rng('close')})", INR1),
            ("trough_m", "Month of the low point", f"=INDEX($C$3:${last}$3,1,MATCH(C{row[0] + 2},{rng('close')},0))", None),
            ("gap", "Extra funding needed to stay above zero (₹ lakh)", f"=MAX(0,-C{row[0] + 2})", INR1),
            ("peak", "Peak monthly operating burn (₹ lakh)", f"=MAX({rng('burn')})", INR1),
            ("cash_out", "Month cash would run out without new money",
             f'=IF({last}{R["firstneg"]}=0,"never",INDEX($C$3:${last}$3,1,{last}{R["firstneg"]}))', None),
        ]
        for key, lab, f, fmt in metrics:
            ws.cell(row=row[0], column=1, value=lab)
            put(ws, f"C{row[0]}", f, BLACK, fmt, bold=True)
            MR[key] = row[0]
            row[0] += 1
        ws.freeze_panes = "C4"
        return dict(R=R, AR=AR, MR=MR, sheet=f"M-{sc}")

    ENG = {sc: engine_sheet(sc) for sc in SCENARIOS}
    B = ENG["Base"]
    BS = q(B["sheet"])

    def bA(key, c):  # base annual cell
        return f"{BS}!{c}{B['AR'][key]}"

    # ------------------------------------------------------------- P&L (base)
    P = wb.create_sheet("P&L")
    P["A1"] = "Profit and loss: Base case"
    P["A1"].font = TITLE
    P["A2"] = "Sums of the monthly engine (M-Base). FY27* is Nov 2026 to Mar 2027."
    P["A2"].font = GREY
    P.column_dimensions["A"].width = 46
    P.column_dimensions["B"].width = 18
    for c in COLS:
        P.column_dimensions[c].width = 13
    hdr(P, 3)
    pl = [("Roof Reports", "reports", INR, False), ("Verified leads", "leads", INR, False), ("Installed homes", "installs", INR, False),
          None,
          ("Lead fees (net of credits)", "r_lead", INR1, False), ("Success fees (collected)", "r_succ", INR1, False),
          ("Loan origination", "r_loan", INR1, False), ("Installer SaaS", "r_saas", INR1, False),
          ("State / DISCOM analytics", "r_b2g", INR1, False), ("Total revenue", "rev", INR1, True), None,
          ("Customer acquisition", "acq", INR1, False), ("AI + infrastructure", "ai", INR1, False),
          ("Payments + partner ops", "ops", INR1, False), ("Gross profit", "gp", INR1, True), None,
          ("Payroll", "payroll", INR1, False), ("G&A", "ga", INR1, False), ("Office, tools, compliance", "office", INR1, False),
          ("Operating expenses", "opex", INR1, True), None,
          ("EBITDA", "ebitda", INR1, True), ("Depreciation", "dep", INR1, False), ("Profit before tax", "ebit", INR1, True),
          ("Tax (after loss set-off)", "taxann", INR1, False), ("Profit after tax", "pat", INR1, True), None,
          ("Average heads", "avg_heads", INR1, False), ("Heads at year end", "end_heads", INR1, False)]
    rr = 4
    PR_ = {}
    for item in pl:
        if item is None:
            rr += 1
            continue
        lab, key, fmt, bold = item
        P.cell(row=rr, column=1, value=lab).font = BOLD if bold else BLACK
        for c in COLS:
            cell = put(P, f"{c}{rr}", f"={bA(key, c)}", GREEN, fmt, bold=bold)
            if bold:
                cell.border = TOP
        PR_[key] = rr
        rr += 1
    rr += 1
    for lab, f, fmt in [
        ("Gross margin", lambda c: f"=IF({c}{PR_['rev']}=0,0,{c}{PR_['gp']}/{c}{PR_['rev']})", PCT),
        ("EBITDA margin", lambda c: f"=IF({c}{PR_['rev']}=0,0,{c}{PR_['ebitda']}/{c}{PR_['rev']})", PCT),
        ("Revenue growth", lambda c: "" if c == "C" else f"=IF({chr(ord(c) - 1)}{PR_['rev']}=0,0,{c}{PR_['rev']}/{chr(ord(c) - 1)}{PR_['rev']}-1)", PCT),
        ("Revenue (₹ crore)", lambda c: f"={c}{PR_['rev']}/100", INR2),
        ("EBITDA (₹ crore)", lambda c: f"={c}{PR_['ebitda']}/100", INR2),
        ("Revenue per average head (₹ lakh)", lambda c: f"=IF({c}{PR_['avg_heads']}=0,0,{c}{PR_['rev']}/{c}{PR_['avg_heads']})", INR1),
    ]:
        P.cell(row=rr, column=1, value=lab)
        for c in COLS:
            v = f(c)
            if v != "":
                put(P, f"{c}{rr}", v, BLACK, fmt)
        PR_[lab] = rr
        rr += 1
    P.freeze_panes = "C4"

    # ------------------------------------------------------------- Cash (base)
    K = wb.create_sheet("Cash")
    K["A1"] = "Cash, runway and the ask: Base case"
    K["A1"].font = TITLE
    K["A2"] = "Year-end view of the monthly engine. The low point and break-even month come from the monthly rows."
    K["A2"].font = GREY
    K.column_dimensions["A"].width = 52
    K.column_dimensions["B"].width = 18
    for c in COLS:
        K.column_dimensions[c].width = 13
    hdr(K, 3)
    KR = {}
    rr = 4
    close_row = rr + 6
    for lab, f, bold in [
        ("Opening cash", lambda c, y: f"={a1('open_cash')}" if y == 0 else f"={COLS[y - 1]}{close_row}", False),
        ("Equity raised", lambda c, y: f"={bA('equity', c)}", False),
        ("EBITDA", lambda c, y: f"={bA('ebitda', c)}", False),
        ("Tax paid", lambda c, y: f"=-{bA('taxann', c)}", False),
        ("Capex", lambda c, y: f"=-{bA('capex', c)}", False),
        ("Increase in working capital", lambda c, y: f"=-{bA('dwc', c)}", False),
        ("Closing cash", lambda c, y: f"=SUM({c}{rr - 6}:{c}{rr - 1})", True),
    ]:
        KR[lab] = rr
        K.cell(row=rr, column=1, value=lab).font = BOLD if bold else BLACK
        for y, c in enumerate(COLS):
            fml = f(c, y)
            if lab == "Closing cash":
                fml = f"=SUM({c}{KR['Opening cash']}:{c}{rr - 1})"
            cell = put(K, f"{c}{rr}", fml, GREEN if lab not in ("Opening cash", "Closing cash") else BLACK, INR1, bold=bold)
            if bold:
                cell.border = TOP
        rr += 1
    K.cell(row=rr, column=1, value="Check: equals the monthly engine")
    for c in COLS:
        put(K, f"{c}{rr}", f"=ROUND({c}{KR['Closing cash']}-{bA('close', c)},6)", BLACK, INR2)
    KR["check"] = rr
    rr += 2
    section(K, rr, "The ask", 7)
    rr += 1
    ask = [
        ("seed", "Seed round", "₹ lakh", f"={a1('seed')}", INR1),
        ("equity", "Equity offered", "%", f"={a1('equity')}", PCT0),
        ("post", "Implied post-money valuation", "₹ lakh", f"=C{rr}/C{rr + 1}", INR1),
        ("post_cr", "Implied post-money valuation", "₹ crore", f"=C{rr + 2}/100", INR2),
        ("be", "EBITDA break-even (positive every month from)", "month", f"={BS}!C{B['MR']['be']}", None),
        ("trough", "Lowest cash balance", "₹ lakh", f"={BS}!C{B['MR']['trough']}", INR1),
        ("trough_m", "Month of the low point", "month", f"={BS}!C{B['MR']['trough_m']}", None),
        ("fy28burn", "Average monthly operating burn, FY28", "₹ lakh",
         f"=SUM({BS}!{mcol(FYCOLS[1][0])}{B['R']['burn']}:{mcol(FYCOLS[1][1])}{B['R']['burn']})/12", INR1),
        ("cushion", "Low point ÷ FY28 average burn", "months", f"=C{rr + 5}/C{rr + 7}", '0.0'),
        ("down_gap", "Downside: extra funding needed", "₹ lakh", f"={q('M-Downside')}!C{ENG['Downside']['MR']['gap']}", INR1),
        ("down_out", "Downside: month cash would run out", "month", f"={q('M-Downside')}!C{ENG['Downside']['MR']['cash_out']}", None),
    ]
    for key, lab, unit, f, fmt in ask:
        K.cell(row=rr, column=1, value=lab)
        K.cell(row=rr, column=2, value=unit).font = GREY
        put(K, f"C{rr}", f, GREEN if "!" in f else BLACK, fmt, bold=key in ("seed", "be", "trough"))
        KR[key] = rr
        rr += 1
    rr += 1
    section(K, rr, "Use of funds: seed-period (FY27*-FY28) spend mix applied to the seed", 7)
    rr += 1
    K.cell(row=rr, column=1, value="Bucket").font = BOLD
    K.cell(row=rr, column=3, value="Spend FY27*-28").font = BOLD
    K.cell(row=rr, column=4, value="Share").font = BOLD
    K.cell(row=rr, column=5, value="Of the seed").font = BOLD
    rr += 1
    t = lambda key: f"{bA(key, 'C')}+{bA(key, 'D')}"  # noqa: E731
    buckets = [
        ("Product & engineering (team, AI, devices)", f"={t('pay_eng')}+{t('ai')}+{t('capex')}"),
        ("Growth (acquisition + growth team)", f"={t('acq')}+{t('pay_growth')}"),
        ("Installer network, lead verification & support", f"={t('pay_network')}+{t('pay_callers')}+{t('pay_support')}+{t('ops')}"),
        ("G&A, compliance, office & state sales", f"={t('ga')}+{t('pay_ga')}+{t('office')}+{t('pay_b2g')}"),
    ]
    first = rr
    for lab, f in buckets:
        K.cell(row=rr, column=1, value=lab)
        put(K, f"C{rr}", f, GREEN, INR1)
        put(K, f"D{rr}", f"=C{rr}/SUM($C${first}:$C${first + 3})", BLACK, PCT0)
        put(K, f"E{rr}", f"=D{rr}*$C${KR['seed']}", BLACK, INR1)
        rr += 1
    K.cell(row=rr, column=1, value="Total").font = BOLD
    put(K, f"C{rr}", f"=SUM(C{first}:C{rr - 1})", BLACK, INR1, bold=True)
    put(K, f"D{rr}", f"=SUM(D{first}:D{rr - 1})", BLACK, PCT0, bold=True)
    put(K, f"E{rr}", f"=SUM(E{first}:E{rr - 1})", BLACK, INR1, bold=True)
    KR["uof_first"] = first

    # ------------------------------------------------------------- Scenarios
    Z = wb.create_sheet("Scenarios")
    Z["A1"] = "Scenarios side by side"
    Z["A1"].font = TITLE
    Z["A2"] = "Every figure links to its monthly engine. Same ₹6 crore seed in all three."
    Z["A2"].font = GREY
    Z.column_dimensions["A"].width = 44
    Z.column_dimensions["B"].width = 16
    for c in COLS:
        Z.column_dimensions[c].width = 13
    rr = 4
    ZR = {}
    for sc in SCENARIOS:
        e = ENG[sc]
        sh = q(e["sheet"])
        section(Z, rr, f"{sc}: {SCEN_NOTE[sc]}", 7)
        rr += 1
        hdr(Z, rr, "₹ crore")
        rr += 1
        for lab, key, fmt, div in [("Revenue", "rev", INR2, 100), ("EBITDA", "ebitda", INR2, 100),
                                   ("EBITDA margin", "margin", PCT, None), ("Year-end cash", "close", INR2, 100),
                                   ("Installed homes", "installs", INR, None), ("Average heads", "avg_heads", INR, None)]:
            Z.cell(row=rr, column=1, value=lab)
            for c in COLS:
                f = f"={sh}!{c}{e['AR'][key]}" + (f"/{div}" if div else "")
                put(Z, f"{c}{rr}", f, GREEN, fmt)
            ZR[(sc, key)] = rr
            rr += 1
        for lab, key, fmt in [("Break-even month", "be", None), ("Lowest cash (₹ crore)", "trough", INR2),
                              ("Month of the low point", "trough_m", None), ("Extra funding needed (₹ crore)", "gap", INR2)]:
            Z.cell(row=rr, column=1, value=lab).font = BOLD
            f = f"={sh}!C{e['MR'][key]}" + ("/100" if fmt else "")
            put(Z, f"C{rr}", f, GREEN, fmt, bold=True)
            ZR[(sc, key)] = rr
            rr += 1
        rr += 1

    # ------------------------------------------------------------- Unit economics (FY28, base)
    U = wb.create_sheet("Unit economics")
    U["A1"] = "Unit economics: FY28, Base case"
    U["A1"].font = TITLE
    U.column_dimensions["A"].width = 58
    U.column_dimensions["B"].width = 14
    U.column_dimensions["C"].width = 10
    U.column_dimensions["D"].width = 90
    for i, h in enumerate(["Metric", "Value", "Unit", "How"]):
        cell = U.cell(row=3, column=i + 1, value=h)
        cell.font = HEAD
        cell.fill = HEAD_FILL
    D = "D"
    ue_rows = [
        ("rep", "Reports, FY28", f"={bA('reports', D)}", INR, "count", "M-Base annual block"),
        ("rev_r", "Revenue per report", f"={bA('rev', D)}*100000/B4", INR1, "₹", "All five streams ÷ reports"),
        ("cac", "Acquisition per report", f"={a1('cac@Base', 'D')}", INR1, "₹", "Assumptions"),
        ("ai_r", "AI + infrastructure per report", f"={a1('ai_cost', 'D')}", '#,##0.00', "₹", "AI cost sheet"),
        ("callers_r", "Lead verification per report", f"={bA('pay_callers', D)}*100000/B4", INR1, "₹", "Caller payroll ÷ reports"),
        ("ops_r", "Payments + partner ops per report", f"=B5*{a1('ops_pct')}", INR1, "₹", "3% of revenue"),
        ("var_r", "Variable cost per report", "=SUM(B6:B9)", INR1, "₹", None),
        ("contrib_r", "Contribution per report", "=B5-B10", INR1, "₹", None),
        ("mult", "Revenue ÷ variable cost", "=IF(B10=0,0,B5/B10)", MULT, "x", None),
        ("blank", None, None, None, None, None),
        ("rph", "Reports per installed home", f"=1/({a1('lead_rate@Base', 'D')}*{a1('install_rate@Base', 'D')})", INR1, "count", "1 ÷ (8% × 20%)"),
        ("sysv", "System value (3.2 kW)", f"={a1('kw')}*{a1('price_kw', 'D')}", INR, "₹", None),
        ("lead_h", "Lead fees per installed home", f"={a1('lead_fee@Base', 'D')}*(1-{a1('refund')})/{a1('install_rate@Base', 'D')}", INR, "₹", "5 leads per install, net of credits"),
        ("succ_h", "Success fee per installed home (collected)", f"=B15*{a1('success_fee')}*{a1('collect')}", INR, "₹", None),
        ("loan_h", "Loan fee per installed home (average)", f"={a1('loan_share')}*{a1('loan_amt')}*{a1('orig_fee')}", INR, "₹", None),
        ("mkt_h", "Marketplace revenue per installed home", "=SUM(B16:B18)", INR, "₹", "Steady state, FY28 prices"),
        ("var_h", "Variable cost per installed home", f"=B14*(B6+B7)+B14*B8+B19*{a1('ops_pct')}", INR, "₹", "Acquisition, AI and verification for 62.5 reports, plus payments"),
        ("contrib_h", "Contribution per installed home", "=B19-B20", INR, "₹", None),
        ("margin_h", "Contribution margin", "=IF(B19=0,0,B21/B19)", PCT, "%", None),
        ("blank2", None, None, None, None, None),
        ("installer", "Installer's cost per closed sale", f"=B16+B15*{a1('success_fee')}", INR, "₹", "Lead fees + full success fee"),
        ("installer_pct", "…as a share of system value", "=B24/B15", PCT, "%", "US installers aim for cost per closed sale under $1,500, roughly 5-7% of a home system"),
        ("ai_pct", "AI + infrastructure as share of revenue, FY28", f"={bA('ai', D)}/{bA('rev', D)}", '0.00%', "%", None),
        ("saving", "Homeowner's saving, 3 kW in Delhi, year 1", MARKET["saving_yr"], INR, "₹", "Chhat Roof Report output (NASA POWER, DISCOM tariff)"),
        ("take", "Chhat's take as share of 25 years of that saving", "=B19/(B27*25)", PCT, "%", None),
    ]
    UR = {}
    rr = 4
    for key, lab, f, fmt, unit, how in ue_rows:
        if lab is None:
            rr += 1
            continue
        U.cell(row=rr, column=1, value=lab)
        put(U, f"B{rr}", f, BLUE if isinstance(f, (int, float)) else (GREEN if "!" in str(f) else BLACK), fmt,
            bold=key in ("contrib_r", "contrib_h", "mkt_h"))
        U.cell(row=rr, column=3, value=unit).font = GREY
        if how:
            U.cell(row=rr, column=4, value=how).font = SMALL
        UR[key] = rr
        rr += 1
    assert UR["rev_r"] == 5 and UR["var_r"] == 10 and UR["sysv"] == 15 and UR["mkt_h"] == 19 and UR["installer"] == 24 and UR["saving"] == 27

    # ------------------------------------------------------------- Market
    Mk = wb.create_sheet("Market")
    Mk["A1"] = "Market sizing"
    Mk["A1"].font = TITLE
    Mk["A2"] = "TAM is a stock (every economic roof, once). SAM and SOM are annual, so FY31 revenue is compared with an annual pool."
    Mk["A2"].font = GREY
    Mk.column_dimensions["A"].width = 64
    Mk.column_dimensions["B"].width = 16
    Mk.column_dimensions["C"].width = 18
    Mk.column_dimensions["D"].width = 90
    mk = [
        ("ceew", "Economic residential rooftop potential, with subsidy", MARKET["ceew_gw"], INR, "GW", "CEEW 2023: 637 GW technical, 32 GW economic with subsidy", BLUE),
        ("homes", "Homes in that potential at 3.2 kW", f"=B4*1000000/{a1('kw')}/100000", INR1, "lakh homes", None, BLACK),
        ("sysv", "Average system value (FY28 prices)", "='Unit economics'!B15", INR, "₹", None, GREEN),
        ("tam", "TAM: installation value of the economic potential", "=B5*100000*B6/10000000", INR, "₹ crore", "Stock, not per year", BLACK),
        (None,),
        ("hh", "PM Surya Ghar households benefited, 9 Oct 2026", MARKET["hh_benefited"], INR, "homes", "National portal counter, quoted by Blues Renewables (10 Oct 2026)", BLUE),
        ("inst", "PM Surya Ghar rooftop installations, 9 Oct 2026", MARKET["installations"], INR, "systems", "Same counter; one system can serve several homes (RWA)", BLUE),
        ("target", "Scheme target", MARKET["target"], INR, "homes", "1 crore households by 31 Mar 2027 (MNRE guidelines)", BLUE),
        ("left", "Homes still to reach the target", "=B11-B9", INR, "homes", "≈ 39 lakh in under 6 months", BLACK),
        ("jul", "Record month: July 2026 additions", MARKET["jul_adds"], INR, "homes", "SolarQuarter, 7 Aug 2026 (16,328 a day)", BLUE),
        ("pace", "Peak annual pace", "=B13*12/100000", INR1, "lakh homes / year", "Subsidy-driven; not assumed to last", BLACK),
        (None,),
        ("national", "Planning base: national home installs a year, FY28-FY31", MARKET["national"], INR1, "lakh homes / year", "Assumption: one-third of the 2026 peak (lighter successor scheme or none)", BLUE),
        ("annual_value", "Annual installation value at that pace", "=B16*100000*B6/10000000", INR, "₹ crore / year", None, BLACK),
        ("mkt_h", "Chhat marketplace revenue per installed home", "='Unit economics'!B19", INR, "₹", "Unit economics sheet", GREEN),
        ("pool_mkt", "Marketplace revenue pool", "=B16*100000*B18/10000000", INR, "₹ crore / year", None, BLACK),
        ("vendors", "Active rooftop vendors on the national portal", MARKET["vendors"], INR, "vendors", "SolarQuarter, Aug 2026 (34,219 registered)", BLUE),
        ("pool_saas", "Installer SaaS pool", f"=B20*{a1('saas_price')}*12/10000000", INR1, "₹ crore / year", None, BLACK),
        ("states", "States and union territories", MARKET["states_uts"], INR, "count", None, BLUE),
        ("pool_b2g", "State analytics pool", f"=B22*{a1('state_fee')}/100", INR1, "₹ crore / year", None, BLACK),
        ("sam", "SAM: annual revenue pool Chhat can serve", "=B19+B21+B23", INR, "₹ crore / year", None, BLACK),
        ("som", "SOM: FY31 revenue, Base case", "='P&L'!G" + str(PR_["Revenue (₹ crore)"]), INR1, "₹ crore", None, GREEN),
        ("som_share", "SOM as share of SAM", "=B25/B24", PCT, "%", None, BLACK),
        ("inst_share", "FY31 installs influenced as share of national installs", f"={bA('installs', 'G')}/(B16*100000)", PCT, "%", None, GREEN),
    ]
    rr = 4
    MKR = {}
    for item in mk:
        if item[0] is None:
            rr += 1
            continue
        key, lab, v, fmt, unit, note, font = item
        Mk.cell(row=rr, column=1, value=lab).font = BOLD if key in ("tam", "sam", "som") else BLACK
        put(Mk, f"B{rr}", v, font, fmt, KEY if key == "national" else None, bold=key in ("tam", "sam", "som"))
        Mk.cell(row=rr, column=3, value=unit).font = GREY
        if note:
            Mk.cell(row=rr, column=4, value=note).font = SMALL
        MKR[key] = rr
        rr += 1
    assert MKR["homes"] == 5 and MKR["sysv"] == 6 and MKR["hh"] == 9 and MKR["target"] == 11 and MKR["jul"] == 13
    assert MKR["national"] == 16 and MKR["mkt_h"] == 18 and MKR["vendors"] == 20 and MKR["states"] == 22 and MKR["sam"] == 24 and MKR["som"] == 25

    # ------------------------------------------------------------- Sensitivity
    Sn = wb.create_sheet("Sensitivity")
    Sn["A1"] = "FY29 EBITDA (₹ lakh), Base case, vs lead fee and lead → install conversion"
    Sn["A1"].font = TITLE
    Sn["A2"] = ("Exact, not approximate: FY29 EBITDA moves one-for-one with lead-fee revenue and in proportion to install-driven "
                "revenue (success and loan fees), net of 3% payments cost. Every other FY29 line is unchanged.")
    Sn["A2"].font = GREY
    Sn["A4"] = "Lead → install ↓ / Lead fee (₹) →"
    Sn["A4"].font = BOLD
    Sn.column_dimensions["A"].width = 36
    E_ = "E"
    for j, fee in enumerate(SENS_FEES):
        put(Sn, f"{get_column_letter(2 + j)}4", fee, BLUE, INR)
        Sn.column_dimensions[get_column_letter(2 + j)].width = 14
    for i, conv in enumerate(SENS_CONV):
        put(Sn, f"A{5 + i}", conv, BLUE, PCT0)
        for j in range(len(SENS_FEES)):
            col = get_column_letter(2 + j)
            f = (f"={bA('ebitda', E_)}+(1-{a1('ops_pct')})*(({col}$4-{a1('lead_fee@Base', E_)})*(1-{a1('refund')})*{bA('leads', E_)}/100000"
                 f"+($A{5 + i}/{a1('install_rate@Base', E_)}-1)*({bA('r_succ', E_)}+{bA('r_loan', E_)}))")
            put(Sn, f"{col}{5 + i}", f, BLACK, INR)
    Sn["A11"] = ("Base case is ₹1,500 and 20%. FY29 EBITDA breaks even at about ₹1,200 a lead (at 20% conversion) "
                 "or about 11% conversion (at ₹1,500 a lead); a ₹900 lead fee needs about 29% conversion. "
                 "These points come from the grid, which is linear in both inputs.")
    Sn["A11"].font = SMALL

    # ------------------------------------------------------------- Sources
    So = wb.create_sheet("Sources")
    So["A1"] = "Sources (read 30-31 Oct 2026)"
    So["A1"].font = TITLE
    srcs = [
        ("Scheme progress", "51,72,635 installations; 61,36,209 households benefited; 90,32,142 applications (portal counter, 9 Oct 2026)", "https://bluesrenewables.com/blog/pm-surya-ghar-last-date/"),
        ("Scheme progress", "50.06 lakh homes; record 5.06 lakh additions in July 2026; 16,328 a day; 29,469 active vendors; 21.87 lakh loans sanctioned", "https://solarquarter.com/2026/08/07/pm-surya-ghar-scheme-crosses-50-lakh-rooftop-solar-installations-adds-record-5-06-lakh-homes-in-july-2026/"),
        ("Scheme end date", "31 Mar 2027; a 3-4 month extension is reported, not notified", "https://bluesrenewables.com/blog/pm-surya-ghar-last-date/"),
        ("Rooftop potential", "637 GW technical, 32 GW economic with subsidy, 5% of households willing (CEEW 2023)", "https://pv-magazine-india.com/2023/11/16/indias-residential-rooftop-solar-potential-estimated-at-637-gw"),
        ("System prices", "₹55,000-85,000 per kW before subsidy (2026 guides); Tata Power ₹55,000-72,000", "https://tatapower.solar/"),
        ("Lead prices", "Indian solar leads ₹150-400 (low) and ₹1,200-3,500 (medium-high quality)", "https://www.mocaup.in/high-quality-solar-leads-ultimate-guide-for-indian-solar-installers/"),
        ("Cost per close", "US installers target cost per closed sale under ~$1,500", "https://www.solarreviews.com/solar-leads"),
        ("Search ads", "Solar keywords in India ₹15-45 per click; Google Ads invoices carry 18% GST (input credit available)", "https://quickestimate.co/blog/google-ads-for-solar-india"),
        ("Claude API prices", "Opus 5.5 $4/$20; Sonnet 5.5 $2/$10; Haiku 5.5 $0.10/$0.50 per MTok; cache hits 0.05x on Opus/Sonnet 5.5", "https://platform.claude.com/docs/en/about-claude/pricing"),
        ("Image tokens", "⌈width/28⌉ × ⌈height/28⌉ visual tokens", "https://platform.claude.com/docs/en/build-with-claude/vision"),
        ("Exchange rate", "₹94.93 per US$ close, 30 Oct 2026", "https://www.deccanherald.com/business/markets/rupee-rises-33-paise-to-close-at-9493-against-us-dollar-4201069"),
        ("Pay rises", "Aon: 9.1% average for 2026; Mercer: 9% median", "https://www.aon.com.au/apac/in-the-press/asia-newsroom/2026/aon-survey-projects-slight-uptick-in-salaries-in-india-2026"),
        ("Engineer pay", "SDE-2 bands, India and Bengaluru", "https://ambitionbox.com/profile/sde-2-salary"),
        ("Caller pay", "Voice-process median CTC ₹2.3 lakh a year (2026 model)", "https://hyring.com/jobseeker-toolkit/salary/voice-process-executive-salary-in-india"),
        ("Corporate tax", "Income-tax Act, 2025 s.200 = old s.115BAA (22% + surcharge + cess)", "https://bharattax.co/income-tax/act-2025/section/200"),
        ("Loss carry-forward", "Income-tax Act, 2025 s.112: business losses up to 8 tax years", "https://www.taxheal.com/?p=125767"),
        ("Hackathon rules", "Deliverables and scoring weights", "https://hackindia.org/2026/ai-first-startup-hackathon-build-a-startup-using-ai-only"),
    ]
    for i, h in enumerate(["Topic", "What it supports", "URL"]):
        cell = So.cell(row=3, column=i + 1, value=h)
        cell.font = HEAD
        cell.fill = HEAD_FILL
    for i, (a, b, u) in enumerate(srcs):
        So.cell(row=4 + i, column=1, value=a)
        So.cell(row=4 + i, column=2, value=b)
        So.cell(row=4 + i, column=3, value=u).font = Font(name=F, color="1F4E99", underline="single")
    So.column_dimensions["A"].width = 20
    So.column_dimensions["B"].width = 110
    So.column_dimensions["C"].width = 70

    # ------------------------------------------------------------- Cover (first)
    cv = wb.create_sheet("Cover", 0)
    cv["A1"] = "Chhat: the independent AI solar advisor for Indian homes"
    cv["A1"].font = TITLE
    cv["A2"] = f"Five-year financial model with monthly cash, three scenarios and a token-level AI cost. Prepared by Claude (AI). Facts as of {AS_OF}."
    cv["A2"].font = GREY
    cv.column_dimensions["A"].width = 46
    cv.column_dimensions["B"].width = 22
    cv.column_dimensions["C"].width = 90
    rows = [
        ("Headline (Base case)", None, None),
        ("Seed ask", f"=Cash!C{KR['seed']}/100", "₹ crore for 15%"),
        ("Post-money valuation", f"=Cash!C{KR['post_cr']}", "₹ crore"),
        ("EBITDA positive every month from", f"=Cash!C{KR['be']}", "first full positive year: FY29"),
        ("Lowest cash balance", f"=Cash!C{KR['trough']}/100", "₹ crore"),
        ("…in", f"=Cash!C{KR['trough_m']}", None),
        ("FY31 revenue", f"='P&L'!G{PR_['Revenue (₹ crore)']}", "₹ crore"),
        ("FY31 EBITDA margin", f"='P&L'!G{PR_['EBITDA margin']}", None),
        ("Downside: extra funding needed", f"=Cash!C{KR['down_gap']}/100", "₹ crore in total (deepest shortfall)"),
        ("Downside: cash would run out in", f"=Cash!C{KR['down_out']}", None),
        ("", None, None),
        ("How to read this model", None, None),
        ("Blue text", None, "Hard-coded input. Change these."),
        ("Black text", None, "Formula. Don't overwrite."),
        ("Green text", None, "Link to another sheet."),
        ("Yellow fill", None, "Key lever."),
        ("FY27*", None, "Part year: Nov 2026 to Mar 2027 (5 months). Units are ₹ lakh unless a row says otherwise; 1 crore = 100 lakh."),
        ("", None, None),
        ("Sheets", None, None),
        ("Assumptions", None, "Every input, with its source or rationale. Three scenario blocks."),
        ("AI cost", None, "Claude tokens × prices × ₹/$ → ₹ per report, for today's code and for routed models."),
        ("M-Base / M-Downside / M-Upside", None, "Monthly engines: funnel, revenue, people, costs, tax, working capital, cash."),
        ("P&L, Cash", None, "Base case by year; the ask, runway and use of funds."),
        ("Scenarios", None, "All three cases side by side."),
        ("Unit economics", None, "Per report and per installed home, FY28."),
        ("Market", None, "TAM (stock), SAM and SOM (annual)."),
        ("Sensitivity", None, "FY29 EBITDA vs lead fee and conversion."),
        ("Sources", None, "Every external fact, with its URL."),
    ]
    for i, (k, v, note) in enumerate(rows):
        rr = 4 + i
        cv.cell(row=rr, column=1, value=k).font = BOLD if (v is None and note is None and k) else BLACK
        if v is not None:
            fmt = PCT if "margin" in k else (INR2 if "crore" in (note or "") else None)
            put(cv, f"B{rr}", v, GREEN, fmt, bold=True)
        if note:
            cv.cell(row=rr, column=3, value=note).font = GREY
    cv["A16"].font = BLUE
    cv["A18"].font = GREEN
    cv["A19"].fill = KEY

    for ws in wb.worksheets:
        ws.sheet_view.showGridLines = ws.title not in ("Cover",)
    wb.calculation.fullCalcOnLoad = True
    wb.save(OUT)
    return dict(ENG=ENG, KR=KR, PR=PR_, UR=UR, MKR=MKR)


# ----------------------------------------------------------------------------- verification
def verify(layout, results):
    """Recalculate the saved workbook with the `formulas` package and compare key cells to the engine."""
    import formulas  # noqa: PLC0415

    xl = formulas.ExcelModel().loads(OUT).finish()
    sol = xl.calculate()
    book = OUT.split("/")[-1]
    vals, errors = {}, []
    for k, v in sol.items():
        try:
            x = v.value[0][0]
        except Exception:  # noqa: BLE001
            continue
        vals[k] = x
        if isinstance(x, str) and x.startswith("#"):
            errors.append((k, x))
        elif type(x).__name__ in ("XlError",):
            errors.append((k, str(x)))

    def cell(sheet, ref):
        return vals.get(f"'[{book}]{sheet.upper()}'!{ref}")

    checks = []
    for sc, e in layout["ENG"].items():
        R = results[sc]
        for key, eng_key in [("rev", "rev"), ("ebitda", "ebitda"), ("taxann", "tax"), ("close", "close"), ("installs", "installs")]:
            for y, c in enumerate(COLS):
                checks.append((f"{sc} {key} {FY[y]}", cell(e["sheet"], f"{c}{e['AR'][key]}"), R["A"][eng_key][y]))
        checks.append((f"{sc} trough", cell(e["sheet"], f"C{e['MR']['trough']}"), R["trough"]))
        checks.append((f"{sc} break-even", cell(e["sheet"], f"C{e['MR']['be']}"), R["breakeven"]))
        checks.append((f"{sc} low-point month", cell(e["sheet"], f"C{e['MR']['trough_m']}"), R["trough_month"]))
        checks.append((f"{sc} cash-out month", cell(e["sheet"], f"C{e['MR']['cash_out']}"), R["cash_out_month"]))
    base = results["Base"]
    ue = unit_economics(base)
    for key in ("rev_r", "var_r", "contrib_r", "mkt_h", "contrib_h", "installer"):
        checks.append((f"unit {key}", cell("Unit economics", f"B{layout['UR'][key]}"), ue[key if key != "installer" else "installer_cost"]))
    mk = market(base, ue)
    for key in ("tam", "sam"):
        checks.append((f"market {key}", cell("Market", f"B{layout['MKR'][key]}"), mk[key]))
    grid = sensitivity(base)
    for i in range(5):
        for j in range(5):
            checks.append((f"sens {i},{j}", cell("Sensitivity", f"{get_column_letter(2 + j)}{5 + i}"), grid[i][j]))
    ai = ai_unit_costs()
    checks.append(("ai opus", cell("AI cost", "C20"), ai["opus"]))
    checks.append(("ai routed", cell("AI cost", "C21"), ai["routed"]))
    checks.append(("cash check", cell("Cash", f"G{layout['KR']['check']}"), 0.0))
    bad = []
    for name, xv, pv in checks:
        if isinstance(pv, str):
            ok = xv == pv
        else:
            ok = xv is not None and not isinstance(xv, str) and abs(float(xv) - pv) <= 1e-6 * max(1.0, abs(pv))
        if not ok:
            bad.append((name, xv, pv))
    n_formulas = sum(1 for k in vals if True)
    return dict(errors=errors, bad=bad, n_checks=len(checks), n_cells=n_formulas, values=vals)


def count_formulas():
    from openpyxl import load_workbook  # noqa: PLC0415

    wb = load_workbook(OUT)
    return sum(1 for ws in wb.worksheets for row in ws.iter_rows() for c in row
               if isinstance(c.value, str) and c.value.startswith("="))


def embed_cached_values(values):
    """Write each formula's computed value into the file so viewers that do not recalculate still show numbers.
    Excel, LibreOffice and Google Sheets recalculate on open anyway (fullCalcOnLoad)."""
    import re  # noqa: PLC0415

    book = OUT.split("/")[-1]
    zin = zipfile.ZipFile(OUT)
    wbxml = zin.read("xl/workbook.xml").decode("utf-8")
    rels = zin.read("xl/_rels/workbook.xml.rels").decode("utf-8")
    rid_target = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="/?(?:xl/)?([^"]+)"', rels))
    rid_target.update({a: b for b, a in re.findall(r'Target="/?(?:xl/)?([^"]+)"[^>]*Id="(rId\d+)"', rels)})
    sheet_file = {}
    for name, rid in re.findall(r'<sheet[^>]*name="([^"]+)"[^>]*r:id="(rId\d+)"', wbxml):
        sheet_file["xl/" + rid_target[rid]] = name.replace("&amp;", "&")
    out_files = {}
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename in sheet_file:
            sname = sheet_file[item.filename].upper()
            xml = data.decode("utf-8")

            def fill(m):
                ref, attrs, f = m.group(1), m.group(2), m.group(3)
                v = values.get(f"'[{book}]{sname}'!{ref}")
                if v is None:
                    return m.group(0)
                attrs = re.sub(r'\s*t="[^"]*"', "", attrs)
                if isinstance(v, str):
                    return f'<c r="{ref}"{attrs} t="str"><f>{f}</f><v>{escape(v)}</v></c>'
                if isinstance(v, bool):
                    return f'<c r="{ref}"{attrs} t="b"><f>{f}</f><v>{int(v)}</v></c>'
                try:
                    fv = float(v)
                except (TypeError, ValueError):
                    return m.group(0)
                return f'<c r="{ref}"{attrs}><f>{f}</f><v>{repr(fv)}</v></c>'

            xml = re.sub(r'<c r="([A-Z]+\d+)"([^>]*)><f>(.*?)</f><v\s*/?>(?:</v>)?</c>', fill, xml)
            xml = re.sub(r'<c r="([A-Z]+\d+)"([^>]*)><f>(.*?)</f></c>', fill, xml)
            data = xml.encode("utf-8")
        out_files[item.filename] = (item, data)
    zin.close()
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, (item, data) in out_files.items():
            zout.writestr(item, data)


def summary(results):
    lines = []
    for sc, R in results.items():
        A = R["A"]
        lines.append(f"\n{sc}  (₹ crore)          " + "".join(f"{x:>9}" for x in FY))
        lines.append("  Revenue          " + "".join(f"{v / 100:9.2f}" for v in A["rev"]))
        lines.append("  EBITDA           " + "".join(f"{v / 100:9.2f}" for v in A["ebitda"]))
        lines.append("  EBITDA margin    " + "".join(f"{(e / r if r else 0):9.1%}" for e, r in zip(A["ebitda"], A["rev"])))
        lines.append("  PAT              " + "".join(f"{v / 100:9.2f}" for v in A["pat"]))
        lines.append("  Year-end cash    " + "".join(f"{v / 100:9.2f}" for v in A["close"]))
        lines.append("  Installs         " + "".join(f"{v:9.0f}" for v in A["installs"]))
        lines.append("  Average heads    " + "".join(f"{v:9.1f}" for v in A["avg_heads"]))
        lines.append(f"  Break-even (EBITDA > 0 every month from): {R['breakeven']} | low point ₹{R['trough'] / 100:.2f} cr in "
                     f"{R['trough_month']} | extra funding needed ₹{R['gap'] / 100:.2f} cr | cash runs out: {R['cash_out_month']}")
    return "\n".join(lines)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--verify", action="store_true")
    ap.add_argument("--json")
    args = ap.parse_args(argv)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")  # ₹ on Windows consoles
    results = {sc: run_scenario(sc) for sc in SCENARIOS}
    layout = build()
    print("saved", OUT, f"({count_formulas()} formulas)")
    print(summary(results))
    if args.verify:
        v = verify(layout, results)
        print(f"\nverify: {v['n_checks']} checks against the Python engine, {len(v['bad'])} mismatches; "
              f"{len(v['errors'])} formula errors across {v['n_cells']} calculated cells")
        for b in v["bad"][:20]:
            print("  MISMATCH", b)
        for e in v["errors"][:20]:
            print("  ERROR", e)
        if not v["bad"] and not v["errors"]:
            embed_cached_values(v["values"])
            print("cached values embedded")
        else:
            sys.exit(1)
    if args.json:
        base = results["Base"]
        ue = unit_economics(base)
        uof, uof_tot = use_of_funds(base)
        dump = {
            "scenarios": {sc: dict(annual={k: v for k, v in R["A"].items() if k != "pay_f"},
                                   pay_f=R["A"]["pay_f"],
                                   monthly={k: R["M"][k] for k in ("reports", "leads", "rev", "ebitda", "burn", "close", "heads")},
                                   breakeven=R["breakeven"], trough=R["trough"], trough_month=R["trough_month"],
                                   gap=R["gap"], peak_burn=R["peak_burn"], cash_out_month=R["cash_out_month"])
                          for sc, R in results.items()},
            "months": MLAB, "fy": FY, "unit_economics": ue, "market": market(base, ue),
            "use_of_funds": {k: dict(spend=v[0], share=v[1]) for k, v in uof.items()}, "use_of_funds_total": uof_tot,
            "ai": ai_unit_costs(), "sensitivity": dict(fees=SENS_FEES, conv=SENS_CONV, grid=sensitivity(base)),
        }
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(dump, fh, indent=1, ensure_ascii=False)
        print("wrote", args.json)


if __name__ == "__main__":
    main()
