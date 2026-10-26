"""Builds business/Chhat-financial-model.xlsx: a formula-driven 5-year model.

Blue = input, black = formula, green = link to another sheet, yellow fill = key lever.
Run:  python3 business/build_model.py  then recalc with LibreOffice.
"""
from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

OUT = "business/Chhat-financial-model.xlsx"
YEARS = ["FY27*", "FY28", "FY29", "FY30", "FY31"]
COLS = ["C", "D", "E", "F", "G"]

F = "Arial"
BLUE = Font(name=F, color="0000FF")
BLACK = Font(name=F, color="000000")
GREEN = Font(name=F, color="008000")
BOLD = Font(name=F, bold=True)
TITLE = Font(name=F, bold=True, size=14)
HEAD = Font(name=F, bold=True, color="FFFFFF")
HEAD_FILL = PatternFill("solid", fgColor="1E2A4A")
KEY = PatternFill("solid", fgColor="FFFF00")
SUB = PatternFill("solid", fgColor="EEF2F8")
thin = Side(style="thin", color="C9CED6")
TOP = Border(top=thin)

INR = '#,##0;(#,##0);"-"'
LAKH = '#,##0.0;(#,##0.0);"-"'
PCT = '0.0%;(0.0%);"-"'
MULT = '0.0"x"'

wb = Workbook()


def header(ws, row, label="₹ lakh unless stated"):
    ws.cell(row=row, column=1, value=label).font = HEAD
    ws.cell(row=row, column=1).fill = HEAD_FILL
    ws.cell(row=row, column=2, value="Unit / note").font = HEAD
    ws.cell(row=row, column=2).fill = HEAD_FILL
    for c, y in zip(COLS, YEARS):
        cell = ws[f"{c}{row}"]
        cell.value = y
        cell.font = HEAD
        cell.fill = HEAD_FILL
        cell.alignment = Alignment(horizontal="right")


def widths(ws, a=46, b=34, rest=14):
    ws.column_dimensions["A"].width = a
    ws.column_dimensions["B"].width = b
    for c in COLS + ["H", "I"]:
        ws.column_dimensions[c].width = rest


# ---------------------------------------------------------------- Cover
cv = wb.active
cv.title = "Cover"
cv["A1"] = "Chhat: the independent AI solar advisor for Indian homes"
cv["A1"].font = TITLE
cv["A2"] = "Five-year financial model, base case. Prepared by Claude (AI) for the HackIndia AI-First Startup Hackathon, Oct 2026."
cv["A2"].font = BLACK
rows = [
    ("How to read this model", None),
    ("Blue text", "Hard-coded input. Change these."),
    ("Black text", "Formula. Don't overwrite."),
    ("Green text", "Link to another sheet."),
    ("Yellow fill", "Key lever with the largest effect on the outcome."),
    ("FY27*", "Part year: Nov 2026 to Mar 2027 (5 months)."),
    ("Units", "₹ lakh unless a row says otherwise. 1 crore = 100 lakh."),
    ("", ""),
    ("Sheets", None),
    ("Assumptions", "Every input, with its source or rationale."),
    ("Revenue", "Funnel and five revenue streams."),
    ("P&L", "Revenue, costs, EBITDA, tax, PAT."),
    ("Cash", "Funding, burn, runway."),
    ("Unit economics", "Per report and per installed home."),
    ("Market", "TAM / SAM / SOM."),
    ("Sensitivity", "FY29 EBITDA vs lead fee and lead-to-install conversion."),
]
r = 4
for k, v in rows:
    cv.cell(row=r, column=1, value=k).font = BOLD if v is None else BLACK
    if v:
        cv.cell(row=r, column=2, value=v).font = BLACK
    r += 1
cv["A5"].font = BLUE
cv["A6"].font = BLACK
cv["A7"].font = GREEN
cv["A8"].fill = KEY
cv.column_dimensions["A"].width = 26
cv.column_dimensions["B"].width = 90

# ---------------------------------------------------------------- Assumptions
A = wb.create_sheet("Assumptions")
widths(A, 52, 70)
A["A1"] = "Assumptions"
A["A1"].font = TITLE
header(A, 3, "Input")

inputs = [
    # key, label, unit/note, values (single or per-year), fmt, key_lever, comment
    ("months", "Months in year", "FY27 is a part year from launch in Nov 2026", [5, 12, 12, 12, 12], INR, False, None),
    ("reports", "Roof Reports generated", "count; organic + WhatsApp shares + paid search", [40000, 400000, 1200000, 2500000, 4000000], INR, True,
     "Plan assumption. FY31 = 40 lakh reports, against ~45 lakh residential installs a year nationally (PM Surya Ghar pace: 16,328/day in Jul 2026, DD India)."),
    ("lead_rate", "Report → verified lead", "% of reports that ask for vetted installer quotes", [0.08] * 5, PCT, True,
     "Assumption. Comparable intent marketplaces convert 5-12% of tool users to leads."),
    ("install_rate", "Verified lead → installed home", "%", [0.20] * 5, PCT, True,
     "Assumption. Pre-qualified leads with a bill and roof model close better than cold leads (industry 8-15%)."),
    ("lead_fee", "Lead fee paid by installer", "₹ per verified lead", [1500] * 5, INR, True,
     "Assumption. Indian solar leads trade at ₹300-1,500 unverified; verified, sized leads at the top of that range."),
    ("kw", "Average system size", "kWp", [3.2] * 5, '0.0', False, "Most PM Surya Ghar homes install ~3 kW to capture the full ₹78,000 subsidy."),
    ("price_kw", "Average installed price", "₹ per kW", [58000, 57000, 56000, 55000, 54000], INR, False,
     "Chhat fair-price band, Oct 2026, falling ~2%/yr. Sources: Avaada, VoltFlow, installer lists."),
    ("success_fee", "Success fee on completed installs", "% of system value", [0.02] * 5, PCT, False, "Assumption, paid by installer on commissioning."),
    ("loan_share", "Installs financed", "% of installs", [0.35] * 5, PCT, False, "Assumption. PM Surya Ghar collateral-free loans up to ₹2 lakh at repo + 0.5%."),
    ("loan_amt", "Average loan", "₹", [160000] * 5, INR, False, "≈ 90% of a 3 kW system before subsidy."),
    ("orig_fee", "Loan origination fee", "% of loan", [0.01] * 5, PCT, False, "Typical DSA payout from banks/NBFCs for small-ticket retail loans."),
    ("saas_subs", "Paying installers on SaaS (average)", "count", [25, 300, 900, 1600, 2500], INR, False, "India has 10,000+ registered rooftop vendors on the national portal (assumption)."),
    ("saas_price", "Installer SaaS price", "₹ per month", [2999] * 5, INR, False, None),
    ("states", "State / DISCOM analytics contracts", "count", [0, 1, 3, 6, 10], INR, False, "B2G sales: billing-error heatmaps, net-meter backlog, subsidy funnel."),
    ("state_fee", "Contract value", "₹ lakh per state per year", [40] * 5, LAKH, False, None),
    ("cac", "Blended acquisition cost", "₹ per report", [100, 85, 75, 65, 60], INR, True, "Paid search + content + referral. Falls slowly as shares and SEO compound; kept high for caution."),
    ("ai_cost", "AI + infrastructure cost", "₹ per report", [6, 5, 4, 3.5, 3], '#,##0.0', False,
     "Claude Opus 5.5 at $4/$20 per MTok: ~2 extraction calls + chat ≈ ₹5. Falls with caching and routing."),
    ("heads", "Team size (average)", "people", [10, 35, 70, 110, 150], INR, False, "Product/eng, growth, installer ops, lead-verification callers, B2G sales."),
    ("ctc", "Loaded cost per person", "₹ lakh per year", [15] * 5, LAKH, False, "Blended Indian startup CTC incl. benefits."),
    ("ga_pct", "G&A", "% of payroll", [0.15] * 5, PCT, False, None),
    ("tools", "Tools, office, compliance", "₹ lakh per year", [10, 50, 100, 150, 200], LAKH, False, None),
    ("ops_pct", "Payments + partner ops", "% of revenue", [0.03] * 5, PCT, False, None),
    ("tax", "Corporate tax rate", "% of positive PBT", [0.2517] * 5, PCT, False, "Section 115BAA base rate incl. surcharge and cess. Losses not carried forward here (conservative)."),
    ("funding", "Equity raised", "₹ lakh", [600, 0, 4000, 0, 0], LAKH, True, "Seed ₹6 crore at launch; Series A ₹40 crore in FY29 (assumption)."),
    ("opening_cash", "Opening cash", "₹ lakh", [20, None, None, None, None], LAKH, False, "Founders' capital."),
]
REF = {}
r = 4
for key, label, unit, vals, fmt, lever, note in inputs:
    A.cell(row=r, column=1, value=label).font = BLACK
    A.cell(row=r, column=2, value=unit).font = Font(name=F, color="666666", italic=True)
    for c, v in zip(COLS, vals):
        if v is None:
            continue
        cell = A[f"{c}{r}"]
        cell.value = v
        cell.font = BLUE
        cell.number_format = fmt
        if lever:
            cell.fill = KEY
    if note:
        A.cell(row=r, column=1).comment = Comment(note, "Claude")
        A.cell(row=r, column=9, value=note).font = Font(name=F, size=9, color="666666")
    REF[key] = r
    r += 1
A.column_dimensions["I"].width = 120
A.cell(row=3, column=9, value="Source / rationale").font = HEAD
A.cell(row=3, column=9).fill = HEAD_FILL


def a(key, col):
    return f"Assumptions!{col}${REF[key]}"


# ---------------------------------------------------------------- Revenue
R = wb.create_sheet("Revenue")
widths(R)
R["A1"] = "Revenue build"
R["A1"].font = TITLE
header(R, 3)
rev_rows = [
    ("Reports generated", "count", lambda c: f"={a('reports', c)}", INR, GREEN),
    ("Verified leads", "count", lambda c: f"={c}4*{a('lead_rate', c)}", INR, BLACK),
    ("Installed homes", "count", lambda c: f"={c}5*{a('install_rate', c)}", INR, BLACK),
    ("Average system value", "₹", lambda c: f"={a('kw', c)}*{a('price_kw', c)}", INR, BLACK),
    ("Financed installs", "count", lambda c: f"={c}6*{a('loan_share', c)}", INR, BLACK),
    ("", "", None, None, None),
    ("Lead fees", "₹ lakh", lambda c: f"={c}5*{a('lead_fee', c)}/100000", LAKH, BLACK),
    ("Success fees", "₹ lakh", lambda c: f"={c}6*{c}7*{a('success_fee', c)}/100000", LAKH, BLACK),
    ("Loan origination", "₹ lakh", lambda c: f"={c}8*{a('loan_amt', c)}*{a('orig_fee', c)}/100000", LAKH, BLACK),
    ("Installer SaaS", "₹ lakh", lambda c: f"={a('saas_subs', c)}*{a('saas_price', c)}*{a('months', c)}/100000", LAKH, BLACK),
    ("DISCOM / state analytics", "₹ lakh", lambda c: f"={a('states', c)}*{a('state_fee', c)}*{a('months', c)}/12", LAKH, BLACK),
    ("Total revenue", "₹ lakh", lambda c: f"=SUM({c}10:{c}14)", LAKH, BOLD),
    ("Growth", "% y/y", lambda c: "" if c == "C" else f"=IF({chr(ord(c)-1)}15=0,0,{c}15/{chr(ord(c)-1)}15-1)", PCT, BLACK),
    ("Marketplace share of revenue", "%", lambda c: f"=IF({c}15=0,0,SUM({c}10:{c}12)/{c}15)", PCT, BLACK),
]
r = 4
for label, unit, fn, fmt, font in rev_rows:
    R.cell(row=r, column=1, value=label).font = font if font is BOLD else BLACK
    R.cell(row=r, column=2, value=unit).font = Font(name=F, color="666666", italic=True)
    if fn:
        for c in COLS:
            v = fn(c)
            if v == "":
                continue
            cell = R[f"{c}{r}"]
            cell.value = v
            cell.font = font if font in (GREEN, BOLD) else BLACK
            cell.number_format = fmt
            if label == "Total revenue":
                cell.border = TOP
    r += 1

# ---------------------------------------------------------------- P&L
P = wb.create_sheet("P&L")
widths(P)
P["A1"] = "Profit and loss"
P["A1"].font = TITLE
header(P, 3)
pl = [
    ("Revenue", lambda c: f"=Revenue!{c}15", GREEN, LAKH),
    ("", None, None, None),
    ("Customer acquisition", lambda c: f"={a('reports', c)}*{a('cac', c)}/100000", BLACK, LAKH),
    ("AI + infrastructure", lambda c: f"={a('reports', c)}*{a('ai_cost', c)}/100000", BLACK, LAKH),
    ("Payments + partner ops", lambda c: f"={c}4*{a('ops_pct', c)}", BLACK, LAKH),
    ("Gross profit", lambda c: f"={c}4-SUM({c}6:{c}8)", BOLD, LAKH),
    ("Gross margin", lambda c: f"=IF({c}4=0,0,{c}9/{c}4)", BLACK, PCT),
    ("", None, None, None),
    ("Payroll", lambda c: f"={a('heads', c)}*{a('ctc', c)}*{a('months', c)}/12", BLACK, LAKH),
    ("G&A", lambda c: f"={c}12*{a('ga_pct', c)}", BLACK, LAKH),
    ("Tools, office, compliance", lambda c: f"={a('tools', c)}", GREEN, LAKH),
    ("Total operating expenses", lambda c: f"=SUM({c}12:{c}14)", BOLD, LAKH),
    ("", None, None, None),
    ("EBITDA", lambda c: f"={c}9-{c}15", BOLD, LAKH),
    ("EBITDA margin", lambda c: f"=IF({c}4=0,0,{c}17/{c}4)", BLACK, PCT),
    ("Tax", lambda c: f"=MAX(0,{c}17)*{a('tax', c)}", BLACK, LAKH),
    ("Profit after tax", lambda c: f"={c}17-{c}19", BOLD, LAKH),
    ("Revenue (₹ crore)", lambda c: f"={c}4/100", BLACK, '#,##0.00'),
    ("EBITDA (₹ crore)", lambda c: f"={c}17/100", BLACK, '#,##0.00;(#,##0.00);"-"'),
]
r = 4
for label, fn, font, fmt in pl:
    P.cell(row=r, column=1, value=label).font = BOLD if font is BOLD else BLACK
    if fn:
        for c in COLS:
            cell = P[f"{c}{r}"]
            cell.value = fn(c)
            cell.font = font
            cell.number_format = fmt
            if font is BOLD:
                cell.border = TOP
    r += 1

# ---------------------------------------------------------------- Cash
C = wb.create_sheet("Cash")
widths(C)
C["A1"] = "Cash and runway"
C["A1"].font = TITLE
header(C, 3)
cash = [
    ("Opening cash", lambda c: f"={a('opening_cash', 'C')}" if c == "C" else f"={chr(ord(c)-1)}9", GREEN, LAKH),
    ("Equity raised", lambda c: f"={a('funding', c)}", GREEN, LAKH),
    ("EBITDA", lambda c: f"='P&L'!{c}17", GREEN, LAKH),
    ("Tax paid", lambda c: f"=-'P&L'!{c}19", GREEN, LAKH),
    ("Capex (laptops, devices)", lambda c: f"=-{a('heads', c)}*1.2*{a('months', c)}/12", BLACK, LAKH),
    ("Closing cash", lambda c: f"=SUM({c}4:{c}8)", BOLD, LAKH),
    ("Monthly net burn (if negative)", lambda c: f"=IF(({c}6+{c}7+{c}8)<0,-({c}6+{c}7+{c}8)/{a('months', c)},0)", BLACK, LAKH),
    ("Runway at that burn", lambda c: f'=IF({c}10=0,"cash positive",{c}9/{c}10)', BLACK, '0.0" months"'),
]
r = 4
for label, fn, font, fmt in cash:
    C.cell(row=r, column=1, value=label).font = BOLD if font is BOLD else BLACK
    for c in COLS:
        cell = C[f"{c}{r}"]
        cell.value = fn(c)
        cell.font = font
        cell.number_format = fmt
    r += 1
C.cell(row=8, column=2, value="₹1.2 lakh per head").font = Font(name=F, color="666666", italic=True)
C["A13"] = "Funding ask"
C["A13"].font = BOLD
C["A14"] = "Seed round"
C["B14"] = "₹ lakh"
C["C14"] = f"={a('funding', 'C')}"
C["C14"].font = GREEN
C["C14"].number_format = LAKH
C["A15"] = "Equity offered"
C["C15"] = 0.15
C["C15"].font = BLUE
C["C15"].number_format = PCT
C["C15"].fill = KEY
C["A16"] = "Implied post-money valuation"
C["B16"] = "₹ lakh"
C["C16"] = "=C14/C15"
C["C16"].number_format = LAKH
C["A17"] = "Lowest closing cash, FY27-FY31"
C["B17"] = "₹ lakh"
C["C17"] = "=MIN(C9:G9)"
C["C17"].number_format = LAKH
C["A18"] = "Use of funds"
C["A18"].font = BOLD
uof = [("Product & engineering", 0.45), ("Growth (content, referral, paid search)", 0.30), ("Installer network & lead verification", 0.15), ("Compliance, legal, G&A", 0.10)]
for i, (k, v) in enumerate(uof):
    C.cell(row=19 + i, column=1, value=k)
    cell = C.cell(row=19 + i, column=3, value=v)
    cell.font = BLUE
    cell.number_format = PCT
    amt = C.cell(row=19 + i, column=4, value=f"=C{19+i}*$C$14")
    amt.number_format = LAKH
C["D18"] = "₹ lakh"
C["C23"] = "=SUM(C19:C22)"
C["C23"].number_format = PCT

# ---------------------------------------------------------------- Unit economics
U = wb.create_sheet("Unit economics")
widths(U, 52, 30)
U["A1"] = "Unit economics (FY28 base)"
U["A1"].font = TITLE
ue = [
    ("Revenue per report", "₹", "=Revenue!D15*100000/Revenue!D4"),
    ("Variable cost per report (CAC + AI)", "₹", f"={a('cac', 'D')}+{a('ai_cost', 'D')}"),
    ("Contribution per report", "₹", "=B3-B4"),
    ("Revenue to variable cost", "x", "=IF(B4=0,0,B3/B4)"),
    ("", "", None),
    ("Reports needed per installed home", "count", f"=1/({a('lead_rate', 'D')}*{a('install_rate', 'D')})"),
    ("Marketplace revenue per installed home", "₹", "=SUM(Revenue!D10:D12)*100000/Revenue!D6"),
    ("Variable cost per installed home", "₹", "=B8*B4"),
    ("Contribution per installed home", "₹", "=B9-B10"),
    ("Contribution margin", "%", "=IF(B9=0,0,B11/B9)"),
    ("", "", None),
    ("Homeowner's saving, 3 kW in Delhi (year 1)", "₹", 28869),
    ("Chhat's take as share of the home's 25-yr savings", "%", "=B9/(B14*25)"),
]
U["A2"] = "Metric"
U["B2"] = "Value"
U["C2"] = "Unit"
for x in ("A2", "B2", "C2"):
    U[x].font = HEAD
    U[x].fill = HEAD_FILL
r = 3
for label, unit, f in ue:
    U.cell(row=r, column=1, value=label)
    if f is not None:
        cell = U.cell(row=r, column=2, value=f)
        cell.number_format = MULT if unit == "x" else PCT if unit == "%" else INR
        cell.font = BLUE if isinstance(f, (int, float)) else BLACK
        U.cell(row=r, column=3, value=unit)
    r += 1
U["D14"] = "Chhat Roof Report output for Delhi, 450 units in May (see app). Source: Chhat engine, NASA POWER."
U["D14"].font = Font(name=F, size=9, color="666666")

# ---------------------------------------------------------------- Market
M = wb.create_sheet("Market")
widths(M, 56, 18)
M["A1"] = "Market sizing"
M["A1"].font = TITLE
mk = [
    ("Homes still to reach the PM Surya Ghar target (1 crore − ~51 lakh)", "lakh homes", 49, BLUE, "DD India / MNRE, Sep 2026"),
    ("Average system value", "₹", f"={a('kw', 'D')}*{a('price_kw', 'D')}", GREEN, None),
    ("Installation value in the scheme window", "₹ crore", "=B3*100000*B4/10000000", BLACK, None),
    ("Economic residential rooftop potential (with subsidy)", "GW", 32, BLUE, "CEEW 2023: 637 GW technical, 118 GW after consumption, 32 GW economic"),
    ("Homes in that potential at 3.2 kW", "lakh homes", f"=B6*1000000/{a('kw', 'D')}/100000", BLACK, None),
    ("TAM: installation value of economic potential", "₹ crore", "=B7*100000*B4/10000000", BLACK, None),
    ("Chhat take rate on an installed home (marketplace)", "% of system value", "='Unit economics'!B9/B4", GREEN, None),
    ("SAM: Chhat revenue pool on the TAM", "₹ crore", "=B8*B9", BLACK, None),
    ("SOM: FY31 revenue", "₹ crore", "='P&L'!G21", GREEN, None),
    ("SOM as share of SAM", "%", "=IF(B10=0,0,B11/B10)", BLACK, None),
]
r = 3
for label, unit, val, font, note in mk:
    M.cell(row=r, column=1, value=label)
    cell = M.cell(row=r, column=2, value=val)
    cell.font = font
    cell.number_format = PCT if unit.startswith("%") else '#,##0'
    M.cell(row=r, column=3, value=unit).font = Font(name=F, color="666666", italic=True)
    if note:
        M.cell(row=r, column=4, value=note).font = Font(name=F, size=9, color="666666")
    r += 1
M.column_dimensions["C"].width = 22
M.column_dimensions["D"].width = 80

# ---------------------------------------------------------------- Sensitivity
S = wb.create_sheet("Sensitivity")
S["A1"] = "FY29 EBITDA (₹ lakh) vs lead fee and lead → install conversion"
S["A1"].font = TITLE
S["A3"] = "Lead → install ↓ / Lead fee (₹) →"
S["A3"].font = BOLD
fees = [900, 1200, 1500, 1800, 2100]
convs = [0.12, 0.16, 0.20, 0.24, 0.28]
for j, fee in enumerate(fees):
    cell = S.cell(row=3, column=2 + j, value=fee)
    cell.font = BLUE
    cell.number_format = INR
for i, cv_ in enumerate(convs):
    cell = S.cell(row=4 + i, column=1, value=cv_)
    cell.font = BLUE
    cell.number_format = PCT
    for j in range(len(fees)):
        col = get_column_letter(2 + j)
        E = "E"
        leads = f"{a('reports', E)}*{a('lead_rate', E)}"
        installs = f"{leads}*$A{4+i}"
        revenue = (
            f"({leads}*{col}$3"
            f"+{installs}*{a('kw', E)}*{a('price_kw', E)}*{a('success_fee', E)}"
            f"+{installs}*{a('loan_share', E)}*{a('loan_amt', E)}*{a('orig_fee', E)})/100000"
            f"+Revenue!E13+Revenue!E14"
        )
        f = f"=({revenue})*(1-{a('ops_pct', E)})-'P&L'!E6-'P&L'!E7-'P&L'!E15"
        cell = S.cell(row=4 + i, column=2 + j, value=f)
        cell.number_format = '#,##0;(#,##0);"-"'
S["A10"] = "Base case is ₹1,500 and 20%. Every cell recomputes FY29 revenue with that fee and conversion; costs stay at base."
S["A10"].font = Font(name=F, size=9, color="666666")
S.column_dimensions["A"].width = 36
for j in range(5):
    S.column_dimensions[get_column_letter(2 + j)].width = 14

for ws in wb.worksheets:
    for row in ws.iter_rows():
        for cell in row:
            if cell.font and cell.font.name != F:
                cell.font = Font(name=F, bold=cell.font.bold, italic=cell.font.italic, color=cell.font.color, size=cell.font.size)
    ws.freeze_panes = "C4" if ws.title in ("Assumptions", "Revenue", "P&L", "Cash") else None

wb.save(OUT)
print("saved", OUT)
