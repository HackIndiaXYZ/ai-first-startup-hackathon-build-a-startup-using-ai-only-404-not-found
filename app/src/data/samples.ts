// Sample documents for the demo. Every company, consumer and number here is
// fictional. They are plain text, so both the on-device parser and the Claude
// extractor read them the same way a real upload is read.

export interface SampleDoc {
  id: string;
  label: string;
  blurb: string;
  city: string;
  text: string;
}

export const SAMPLE_BILLS: SampleDoc[] = [
  {
    id: "delhi-may",
    label: "Delhi, May",
    blurb: "Two-storey house, AC season",
    city: "Delhi",
    text: `SAMPLE POWER DISTRIBUTION LTD (FICTIONAL)
ELECTRICITY BILL  ·  DOMESTIC LT
Consumer Name   : R. MEHRA
CA Number       : 1500 2231 8890
Address         : B-14, Sector 9, Rohini, Delhi
Bill Month      : May 2026
Billing Period  : 01-05-2026 to 31-05-2026 (31 days)
Sanctioned Load : 5.00 kW
Tariff Category : DOMESTIC

METER READINGS
Current Reading  : 18,642
Previous Reading : 18,166
Units Consumed   : 476 kWh

CHARGES                         Rs.
Fixed Charges                 250.00
Energy Charges              2,620.50
PPAC Surcharge                285.40
Electricity Tax               148.80
Amount Payable              3,304.70
Due Date : 15-06-2026`,
  },
  {
    id: "pune-apr",
    label: "Pune, April",
    blurb: "Flat roof bungalow, MSEDCL-style slabs",
    city: "Pune",
    text: `SAMPLE STATE ELECTRICITY CO. (FICTIONAL) · MAHARASHTRA
LT-I RESIDENTIAL BILL
Consumer No.: 170024559871   Name: A. KULKARNI
Bill Month: APR-2026
Sanctioned Load: 3 KW
Units Consumed : 382
Fixed Charge              Rs   128.00
Energy Charges            Rs 3,156.20
Wheeling Charges          Rs   561.54
FAC                       Rs    76.40
Electricity Duty          Rs   598.10
Net Bill Amount           Rs 4,520.24`,
  },
  {
    id: "chennai-bimonthly",
    label: "Chennai, two months",
    blurb: "Bimonthly bill, Jun-Jul",
    city: "Chennai",
    text: `SAMPLE GENERATION & DISTRIBUTION CORP (FICTIONAL)
TAMIL NADU · DOMESTIC LA1A · BIMONTHLY
Service No : 09-123-456-789
Name       : S. NARAYANAN
Assessment Date : 31-07-2026
Billing Period  : JUN-JUL 2026 (2 months)
Units Consumed  : 742
Energy Charges  : Rs. 3,688.00
Fixed Charges   : Rs.   120.00
Total Amount    : Rs. 3,808.00`,
  },
];

export const SAMPLE_QUOTES: SampleDoc[] = [
  {
    id: "overcharger",
    label: "The overcharger",
    blurb: "Shiny brochure, quiet problems",
    city: "Delhi",
    text: `BRIGHTLINE ROOFTOP SOLUTIONS (SAMPLE, FICTIONAL)
QUOTATION No. BRS/Q/2026/1187       Date: 02-10-2026
To: Mr. R. Mehra, Rohini, Delhi

Subject: 3 kW On-Grid Rooftop Solar System under PM Surya Ghar

Sl  Item                                         Qty
1   Mono PERC Solar Module 540 Wp (Imported, Non-DCR)   5 Nos
2   Solar On-Grid Inverter 3 kW (Brand: Voltaro)   1 No
3   Module Mounting Structure, MS Painted         1 Set
4   AC/DC cables, MC4 connectors, ACDB/DCDB       1 Lot
5   Installation & Commissioning                  1 Job

System Capacity       : 3 kW
Basic Amount          : Rs. 2,12,000
GST @ 13.8%           : Rs.   29,256
Grand Total           : Rs. 2,41,256

Warranty:
- Panel product warranty 5 years, performance warranty 25 years
- Inverter warranty 3 years
- Workmanship warranty 1 year
Net metering charges extra as per DISCOM.
Payment Terms: 70% advance with order, balance on installation.
Earthing: 1 pit included. Lightning arrester: not included.`,
  },
  {
    id: "fair",
    label: "The fair deal",
    blurb: "Boring in the best way",
    city: "Pune",
    text: `SAHYADRI SUNWORKS (SAMPLE, FICTIONAL) · Registered vendor, PM Surya Ghar
Quotation SSW-2026-0412     Date: 28-09-2026
Customer: A. Kulkarni, Kothrud, Pune, Maharashtra

3.27 kWp Grid-Connected Rooftop Solar Power Plant
- 6 x 545 Wp Mono PERC Bifacial Modules, DCR certified (cells: ALMM List-II listed manufacturer)
- 3.3 kW single-phase on-grid string inverter, Wi-Fi monitoring, 8 years warranty
- Elevated module mounting structure, hot-dip galvanized (IS 4759), 80 micron
- 3 earthing pits + 1 lightning arrester
- Net meter application and DISCOM fees included
- 5 years comprehensive warranty and O&M (including cleaning)
Module warranty: 12 years product, 30 years performance

Total project cost (incl. GST @ 8.9% effective): Rs. 1,92,000
Payment: 20% booking, 50% on material delivery, 30% after net meter commissioning
Grievance officer: Ms. P. Joshi, 98xxxx1234, care@sahyadrisun.example`,
  },
  {
    id: "short",
    label: "Short on panels",
    blurb: "Says 4 kW, ships less",
    city: "Lucknow",
    text: `NAGAR SOLAR POINT (SAMPLE, FICTIONAL)
Estimate for: 4 KW Solar Rooftop System, Lucknow, Uttar Pradesh
DCR Solar Panels 545W x 6 nos
Inverter: 4 kW on grid, warranty 5 years
Structure: GI hot dip galvanised, elevated
Earthing and LA included
System warranty: 5 years
Total Amount (inclusive of GST): Rs 2,38,000
Advance: 30%`,
  },
];

export const SAMPLE_SOLAR_BILLS: SampleDoc[] = [
  {
    id: "import-billed",
    label: "Export ignored",
    blurb: "Billed on import units",
    city: "Lucknow",
    text: `SAMPLE VIDYUT VITRAN NIGAM (FICTIONAL) · NET METERING BILL
Consumer Name : P. SRIVASTAVA
Account No.   : 4821 7730 1102
Bill Month    : APR-2026
Solar Plant Capacity : 3.27 kWp
Import Units  : 410
Export Units  : 236
Previous Credit Units : 0
Net Units Billed : 410
Energy Charges : Rs. 2,665.00
Fixed Charges  : Rs.   330.00
Other Charges (Misc. Adjustment) : Rs. 1,180.00
Electricity Duty : Rs. 199.90
Total Amount Payable : Rs. 4,374.90`,
  },
  {
    id: "zero-export",
    label: "Net meter not live",
    blurb: "Solar installed, export shows zero",
    city: "Jaipur",
    text: `SAMPLE DISCOM (FICTIONAL) · RAJASTHAN · DOMESTIC NET METERED
Name: K. RATHORE      K No.: 210933118204
Bill Month: MAR-2026
Rooftop Solar: 3.27 kWp (commissioned 12-01-2026)
Import Units: 344
Export Units: 0
Net Units Billed: 344
Energy Charges: Rs. 2,580.00
Fixed Charges: Rs. 260.00
Total: Rs. 3,105.20`,
  },
  {
    id: "correct",
    label: "Correct bill",
    blurb: "Everything adds up",
    city: "Delhi",
    text: `SAMPLE POWER DISTRIBUTION LTD (FICTIONAL) · NET METERING
Consumer Name : R. MEHRA      CA Number : 1500 2231 8890
Bill Month : MAR-2026
Import Units : 312
Export Units : 268
Previous Credit Units : 22
Net Units Billed : 22
Energy Charges : Rs. 66.00
Fixed Charges : Rs. 250.00
Electricity Tax : Rs. 12.60
Total Amount Payable : Rs. 328.60`,
  },
];
