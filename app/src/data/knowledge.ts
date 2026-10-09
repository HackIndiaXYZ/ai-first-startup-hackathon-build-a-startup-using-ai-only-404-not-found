// Chhat's knowledge base. Short, sourced answers the agent can quote.
// The on-device agent retrieves from it with BM25; the Claude agent gets it
// through the search_knowledge tool.

export interface KBEntry {
  id: string;
  title: string;
  keywords: string;
  en: string;
  hi?: string;
  source?: { label: string; url: string };
}

export const KNOWLEDGE: KBEntry[] = [
  {
    id: "scheme",
    title: "What PM Surya Ghar is",
    keywords: "pm surya ghar muft bijli yojana scheme what is free electricity 300 units government",
    en: "PM Surya Ghar: Muft Bijli Yojana is the central government's rooftop solar scheme for homes, launched in February 2024 with a target of 1 crore households. It pays a capital subsidy of up to ₹78,000 (₹85,800 in special-category states), offers collateral-free loans, and aims to give households up to 300 free units a month from their own roof. By late September 2026 about 51 lakh homes had installed systems.",
    hi: "PM सूर्य घर: मुफ़्त बिजली योजना घरों के लिए केंद्र सरकार की रूफ़टॉप सोलर योजना है, जो फ़रवरी 2024 में 1 करोड़ घरों के लक्ष्य के साथ शुरू हुई। इसमें ₹78,000 तक सब्सिडी (विशेष श्रेणी राज्यों में ₹85,800), बिना गारंटी लोन, और हर महीने 300 यूनिट तक मुफ़्त बिजली का लक्ष्य है।",
    source: { label: "pmsuryaghar.gov.in", url: "https://www.pmsuryaghar.gov.in/" },
  },
  {
    id: "subsidy",
    title: "How much subsidy you get",
    keywords: "subsidy how much amount cfa central financial assistance 78000 30000 18000 kw slab sabsidi kitna",
    en: "Central subsidy is ₹30,000 per kW for the first 2 kW and ₹18,000 for the 3rd kW, capped at ₹78,000 for 3 kW and above. Special-category states and UTs (North East, Uttarakhand, Himachal, J&K, Ladakh, Andaman & Nicobar, Lakshadweep) get ₹33,000 and ₹19,800, capped at ₹85,800. Some states add a top-up: Delhi ₹10,000/kW up to ₹30,000; UP ₹15,000/kW up to ₹30,000; J&K ₹3,000/kW up to ₹9,000. Nothing extra is paid beyond 3 kW.",
    hi: "केंद्र की सब्सिडी पहले 2 kW के लिए ₹30,000 प्रति kW और तीसरे kW के लिए ₹18,000 है, अधिकतम ₹78,000। विशेष श्रेणी राज्यों में ₹33,000 और ₹19,800, अधिकतम ₹85,800। दिल्ली, यूपी और जम्मू-कश्मीर जैसे राज्य ऊपर से अतिरिक्त सब्सिडी देते हैं। 3 kW से बड़े सिस्टम पर केंद्र से अतिरिक्त पैसा नहीं मिलता।",
    source: { label: "CAG consumer manual on PM Surya Ghar", url: "https://www.cag.org.in/sites/default/files/database/2.%20PM%20Surya%20Ghar%20Scheme-%20A%20consumer%20manual%20%281%29.pdf" },
  },
  {
    id: "dcr",
    title: "DCR panels and ALMM List-II",
    keywords: "dcr domestic content requirement almm list ii cells panel made in india eligible subsidy non dcr",
    en: "Subsidy is paid only for DCR (Domestic Content Requirement) panels. Since 1 June 2026, the cells inside those panels must also come from manufacturers on ALMM List-II. MNRE did not relax DCR for PM Surya Ghar. Ask your vendor for the DCR certificate with module serial numbers and the cell maker's name before you pay. DCR panels cost roughly ₹3,000/kW more than imported ones.",
    hi: "सब्सिडी सिर्फ़ DCR (घरेलू सामग्री) पैनल पर मिलती है। 1 जून 2026 से पैनल के अंदर के सेल भी ALMM List-II वाली कंपनियों के होने चाहिए। पैसे देने से पहले वेंडर से मॉड्यूल सीरियल नंबर वाला DCR सर्टिफिकेट और सेल बनाने वाली कंपनी का नाम लें।",
    source: { label: "TaiyangNews: MNRE clarifies ALMM List-II", url: "https://taiyangnews.info/markets/mnre-clarifies-almm-list-ii-exemption-pm-surya-ghar-users" },
  },
  {
    id: "process",
    title: "Step-by-step application",
    keywords: "how to apply process steps register portal application feasibility vendor installation inspection apply kaise",
    en: "1) Register on pmsuryaghar.gov.in with your state, DISCOM, consumer number and mobile. 2) Apply for rooftop solar; the DISCOM checks technical feasibility. 3) Pick a vendor registered for your DISCOM and install. 4) Submit plant details and apply for the net meter. 5) The DISCOM installs the net meter and inspects. 6) A commissioning certificate is generated on the portal. 7) Submit your bank details and a cancelled cheque; the subsidy reaches your account, usually within about 30 days.",
    hi: "1) pmsuryaghar.gov.in पर राज्य, DISCOM, कंज़्यूमर नंबर और मोबाइल से रजिस्टर करें। 2) रूफ़टॉप सोलर के लिए आवेदन करें; DISCOM तकनीकी जाँच करेगा। 3) अपने DISCOM के लिए रजिस्टर्ड वेंडर से इंस्टॉल कराएँ। 4) प्लांट की जानकारी देकर नेट मीटर के लिए आवेदन करें। 5) DISCOM नेट मीटर लगाकर जाँच करेगा। 6) पोर्टल पर कमीशनिंग सर्टिफिकेट बनेगा। 7) बैंक विवरण और कैंसल चेक जमा करें; सब्सिडी लगभग 30 दिन में खाते में आती है।",
    source: { label: "pmsuryaghar.gov.in", url: "https://www.pmsuryaghar.gov.in/" },
  },
  {
    id: "loan",
    title: "Solar loans",
    keywords: "loan emi bank interest rate collateral free sbi finance credit margin money tenure",
    en: "Public sector banks offer collateral-free loans for systems up to 3 kW, up to ₹2 lakh, at repo + 0.5% (about 5.75% in July 2026) for up to 10 years, with ~10% margin money. Above that, rates are higher (SBI quotes around 7.9% up to ₹6 lakh). A smart move: when the subsidy arrives, prepay it into the loan, which drops your EMI below your monthly savings in most cities. Apply through jansamarth.in or your bank.",
    hi: "3 kW तक के सिस्टम के लिए सरकारी बैंक ₹2 लाख तक का बिना गारंटी लोन रेपो + 0.5% (जुलाई 2026 में लगभग 5.75%) पर 10 साल तक देते हैं, लगभग 10% मार्जिन मनी के साथ। सब्सिडी आते ही उसे लोन में जमा कर दें, ज़्यादातर शहरों में EMI आपकी मासिक बचत से कम हो जाती है।",
    source: { label: "SBI Surya Ghar loan", url: "https://sbi.bank.in/web/personal-banking/loans/pm-surya-ghar-loan-for-solar-roof-top" },
  },
  {
    id: "netmeter",
    title: "How net metering works",
    keywords: "net metering net meter export import bidirectional credit banking units feed in surplus how works",
    en: "A net meter counts units you import from the grid and units your roof exports. You pay only for the difference. In most states, surplus units roll forward as credit within the settlement year, and leftover credit is paid at a lower feed-in rate (often ₹2 to ₹3.5/unit). So size the system to your annual use, not your summer peak.",
    hi: "नेट मीटर ग्रिड से ली गई और छत से भेजी गई बिजली दोनों गिनता है। आप सिर्फ़ अंतर का भुगतान करते हैं। ज़्यादातर राज्यों में अतिरिक्त यूनिट अगले महीनों के लिए क्रेडिट बनती हैं, और साल के अंत में बची यूनिट कम दर (₹2 से ₹3.5) पर मिलती हैं।",
  },
  {
    id: "wrongbill",
    title: "Wrong bill after installing solar",
    keywords: "wrong bill high bill after solar overbilled billing error discom complaint export not counted net meter not working",
    en: "MNRE acknowledged in July 2026 that many households got incorrect DISCOM bills after installing rooftop solar. Common errors: export shown as zero because the net meter isn't configured, billing on import instead of net units, carried credit missing, and unexplained 'other charges'. Write to your DISCOM sub-division first; escalate to the Consumer Grievance Redressal Forum after 30 days, and file a grievance on the PM Surya Ghar portal. Chhat's Bill Audit drafts the letter.",
    hi: "जुलाई 2026 में MNRE ने माना कि सोलर लगाने के बाद कई घरों के बिल ग़लत आए। आम ग़लतियाँ: नेट मीटर कॉन्फ़िगर न होने से एक्सपोर्ट शून्य, नेट की जगह इम्पोर्ट पर बिल, क्रेडिट ग़ायब, और बिना वजह 'अन्य शुल्क'। पहले DISCOM सब-डिवीज़न को लिखें, 30 दिन बाद CGRF जाएँ और पोर्टल पर शिकायत करें।",
    source: { label: "Energetica: MNRE flags incorrect billing", url: "https://www.energetica-india.net/news/mnre-flags-incorrect-rooftop-solar-billing-by-discoms-refers-complaints-for-resolution" },
  },
  {
    id: "maintenance",
    title: "Cleaning and maintenance",
    keywords: "cleaning maintenance dust wash panels service amc o&m warranty vendor 5 years safai",
    en: "Under PM Surya Ghar, your registered vendor owes you 5 years of all-inclusive maintenance, including cleaning and fault repair at their cost, plus a 5-year system warranty. Dust can cut output 5 to 15% in North India's dry months, so rinse panels with plain water every 2 to 3 weeks, early morning or evening. Avoid detergents and high-pressure jets.",
    hi: "PM सूर्य घर में रजिस्टर्ड वेंडर को 5 साल तक मुफ़्त मेंटेनेंस देना होता है, जिसमें सफ़ाई और ख़राबी ठीक करना शामिल है। धूल से उत्पादन 5 से 15% घट सकता है, इसलिए हर 2-3 हफ़्ते सुबह या शाम सादे पानी से पैनल धोएँ।",
    source: { label: "Delhi solar portal: O&M procedure", url: "https://solar.delhi.gov.in/page/operation-and-maintenance-procedure" },
  },
  {
    id: "monsoon",
    title: "Monsoon and cloudy days",
    keywords: "monsoon rain cloudy winter fog less generation july august output drop baarish",
    en: "Generation drops in the monsoon (often 25 to 40% below May in western and central India) and on foggy winter days in the north. Net metering smooths this: surplus banked in March to May covers the dip. Chhat's month-by-month chart uses 20 years of NASA satellite data, so the monsoon dip is already in your numbers.",
    hi: "मानसून में उत्पादन घटता है (पश्चिम और मध्य भारत में मई से 25-40% कम) और उत्तर भारत में कोहरे वाले दिनों में भी। नेट मीटरिंग से मार्च-मई की अतिरिक्त यूनिट इस कमी को पूरा करती हैं।",
  },
  {
    id: "battery",
    title: "Do I need a battery?",
    keywords: "battery storage hybrid inverter power cut backup off grid lithium need battery",
    en: "Not for savings. An on-grid system with net metering uses the grid as your battery and is what the subsidy covers. Batteries add ₹40,000 to ₹1.5 lakh and wear out in 5 to 10 years. Consider a hybrid inverter with a small battery only if you have frequent long power cuts. Note that a plain on-grid system shuts down during a grid outage for safety.",
    hi: "बचत के लिए नहीं। नेट मीटरिंग वाला ऑन-ग्रिड सिस्टम ग्रिड को ही बैटरी की तरह इस्तेमाल करता है और सब्सिडी इसी पर मिलती है। बार-बार लंबे पावर कट हों तभी छोटी बैटरी वाले हाइब्रिड इन्वर्टर पर विचार करें।",
  },
  {
    id: "roof",
    title: "How much roof space I need",
    keywords: "roof space area sq ft square feet how much space kw per area shadow free terrace chhat",
    en: "Plan about 100 sq ft of shadow-free roof per kW on an elevated structure (MNRE's rule of thumb is about 10 m² per kW). A 3 kW system needs about 300 sq ft. Leave room for the water tank, stair room and walkways. Elevated structures keep the roof usable underneath for drying clothes or sitting out.",
    hi: "हर kW के लिए लगभग 100 वर्ग फ़ुट छायारहित छत चाहिए। 3 kW के लिए लगभग 300 वर्ग फ़ुट। पानी की टंकी, सीढ़ी के कमरे और चलने की जगह छोड़ें। ऊँचे स्ट्रक्चर से नीचे की छत इस्तेमाल लायक रहती है।",
  },
  {
    id: "size",
    title: "What size should I install?",
    keywords: "what size how many kw system size recommend 2kw 3kw 5kw kitne kw ka lagaye",
    en: "Size to your annual consumption, capped by your roof and sanctioned load. A home using 300 units a month on average needs about 2.5 to 3 kW in most of India. 3 kW is a sweet spot because it captures the full ₹78,000 subsidy. Use Chhat's Roof Report for your exact number from your own bill and NASA sunlight for your city.",
    hi: "अपनी सालाना खपत के हिसाब से साइज़ तय करें, छत और स्वीकृत लोड की सीमा में। औसतन 300 यूनिट महीना इस्तेमाल करने वाले घर के लिए ज़्यादातर भारत में 2.5 से 3 kW काफ़ी है। 3 kW पर पूरी ₹78,000 सब्सिडी मिलती है।",
  },
  {
    id: "payback",
    title: "Is solar worth it? Payback",
    keywords: "worth it payback return roi savings how long recover money fayda labh worth",
    en: "With the subsidy, most Indian homes recover the cost in about 3 to 5 years, and panels keep producing for 25 years with about 0.5% output loss a year. Payback is faster where electricity is expensive (Maharashtra, West Bengal, Telangana) and slower where the first units are free (Punjab, Delhi's lowest slab). Chhat computes yours with a 25-year cash flow, including an inverter replacement around year 12.",
    hi: "सब्सिडी के साथ ज़्यादातर घर 3 से 5 साल में लागत वसूल कर लेते हैं, और पैनल 25 साल तक बिजली बनाते हैं। जहाँ बिजली महँगी है वहाँ जल्दी, और जहाँ शुरुआती यूनिट मुफ़्त हैं वहाँ धीरे।",
  },
  {
    id: "price",
    title: "Fair price for a system",
    keywords: "price cost rate per kw how much cost fair price quote 3kw cost lakh kharcha",
    en: "In October 2026, an on-grid system with DCR panels and an elevated galvanized structure typically costs ₹55,000 to ₹66,000 per kW for 3 kW (about ₹1.65 to ₹2 lakh before subsidy), less per kW for bigger systems and more for 1 to 2 kW. DCR panels with ALMM List-II cells added roughly ₹3,000/kW after June 2026. Upload a quote to Chhat's Quote Check to compare line by line.",
    hi: "अक्टूबर 2026 में DCR पैनल और ऊँचे गैल्वनाइज़्ड स्ट्रक्चर वाला 3 kW ऑन-ग्रिड सिस्टम आम तौर पर ₹55,000 से ₹66,000 प्रति kW (सब्सिडी से पहले लगभग ₹1.65 से ₹2 लाख) में लगता है।",
  },
  {
    id: "gst",
    title: "GST on solar",
    keywords: "gst tax 5% 12% 13.8% 8.9% rate solar system invoice",
    en: "From 22 September 2025, GST on solar power generating systems fell to 5% on goods. Installed systems are usually taxed under the 70:30 rule (70% goods at 5%, 30% services at 18%), about 8.9% effective. A quote that still charges 12% or 13.8% is using old rates.",
    hi: "22 सितंबर 2025 से सोलर सिस्टम के सामान पर GST 5% हो गया। इंस्टॉल किए गए सिस्टम पर 70:30 नियम से लगभग 8.9% प्रभावी GST लगता है। 12% या 13.8% वाला कोटेशन पुरानी दरों पर है।",
    source: { label: "EQ: GST rationalised to 5%", url: "https://www.eqmagpro.com/gst-on-renewable-energy-devices-rationalised-to-5-to-accelerate-indias-clean-energy-transition-eq/" },
  },
  {
    id: "vendor",
    title: "Choosing a vendor",
    keywords: "vendor installer choose select company trust registered list fraud which company",
    en: "Only vendors registered on pmsuryaghar.gov.in for your DISCOM can install a subsidised system. Before signing, check: DCR certificate, written 5-year system warranty and maintenance, structure material (hot-dip galvanized or ZAM), inverter brand and warranty, earthing and lightning arrester included, a named grievance contact, and milestone payments with 30% held until net metering is live.",
    hi: "सिर्फ़ आपके DISCOM के लिए pmsuryaghar.gov.in पर रजिस्टर्ड वेंडर ही सब्सिडी वाला सिस्टम लगा सकते हैं। साइन करने से पहले DCR सर्टिफिकेट, 5 साल वारंटी और मेंटेनेंस, स्ट्रक्चर, इन्वर्टर, अर्थिंग, शिकायत संपर्क, और किश्तों में भुगतान लिखवाएँ।",
    source: { label: "REC vendor framework", url: "https://www.mercomindia.com/rec-issues-guidance-framework-for-vendor-operations-under-pm-surya-ghar" },
  },
  {
    id: "eligibility",
    title: "Who is eligible",
    keywords: "eligible eligibility who can apply rented tenant owner house own roof valid connection",
    en: "You need an Indian household with a valid electricity connection in your name, a roof suitable for panels, and no earlier rooftop solar subsidy. Tenants usually need the owner's consent and the connection in the applicant's name. Group housing societies and RWAs can apply for common areas at ₹18,000/kW up to 500 kW.",
    hi: "आपके नाम पर वैध बिजली कनेक्शन, पैनल लायक छत, और पहले कोई रूफ़टॉप सोलर सब्सिडी न ली हो। किराएदारों को आम तौर पर मालिक की सहमति चाहिए। हाउसिंग सोसायटी और RWA साझा जगह के लिए ₹18,000/kW पर आवेदन कर सकते हैं।",
  },
  {
    id: "time",
    title: "How long it takes",
    keywords: "how long time days weeks timeline when subsidy credited delay kitne din",
    en: "Feasibility approval takes a few days to a few weeks depending on the DISCOM. Installation itself takes 1 to 3 days. Net-meter installation and inspection can take 2 to 6 weeks. The central subsidy usually arrives within about 30 days of commissioning, though some states' top-ups have been delayed for months (Assam's arrears crossed ₹150 crore).",
    hi: "DISCOM के हिसाब से मंज़ूरी में कुछ दिन से कुछ हफ़्ते लगते हैं। इंस्टॉलेशन 1-3 दिन में हो जाता है। नेट मीटर और जाँच में 2-6 हफ़्ते लग सकते हैं। केंद्र की सब्सिडी आम तौर पर कमीशनिंग के लगभग 30 दिन में आती है।",
    source: { label: "Sentinel Assam: state subsidy arrears", url: "https://www.sentinelassam.com/north-east-india-news/assam-news/assam-yet-to-release-state-subsidy-to-pm-surya-ghar-beneficiaries-dues-cross-rs-150-crore" },
  },
  {
    id: "structure",
    title: "Mounting structure",
    keywords: "structure stand frame mounting galvanized gi zam aluminium rust height elevated",
    en: "MNRE's specification (amended 19 May 2026) allows hot-dip galvanized steel to IS 4759, ZAM alloy to IS 18513, and aluminium. Painted mild steel rusts within a few monsoons. An 80-micron zinc coating is a common benchmark for inland cities; coastal homes need more protection.",
    hi: "MNRE के नियम (19 मई 2026 संशोधन) में IS 4759 वाला हॉट-डिप गैल्वनाइज़्ड स्टील, ZAM और एल्युमिनियम मान्य हैं। पेंट किया हुआ माइल्ड स्टील कुछ मानसून में ज़ंग खा जाता है।",
    source: { label: "SolarQuarter: MNRE approves ZAM", url: "https://solarquarter.com/2026/05/25/mnre-approves-zam-alloy-for-rooftop-solar-structures-under-pm-surya-ghar-scheme/" },
  },
  {
    id: "inverter",
    title: "Inverter basics",
    keywords: "inverter string micro hybrid size kw warranty brand dc ac ratio",
    en: "Most homes use a single-phase string inverter sized close to the panel capacity (DC:AC ratio 0.9 to 1.3). Expect a 5 to 10-year warranty, and budget for one replacement around year 12. Choose a model with Wi-Fi monitoring so you can spot faults the same day.",
    hi: "ज़्यादातर घरों में पैनल क्षमता के बराबर सिंगल-फ़ेज़ स्ट्रिंग इन्वर्टर लगता है (DC:AC 0.9 से 1.3)। 5-10 साल की वारंटी लें और 12वें साल के आसपास एक बार बदलने का बजट रखें।",
  },
  {
    id: "carbon",
    title: "Carbon impact",
    keywords: "carbon co2 emissions environment climate trees impact green",
    en: "Each unit of solar displaces grid power that emits about 0.727 kg of CO₂ (CEA, FY 2023-24). A 3 kW system in North India makes roughly 4,500 units a year, avoiding about 3.3 tonnes of CO₂ annually.",
    hi: "सोलर की हर यूनिट ग्रिड की लगभग 0.727 किलो CO₂ बचाती है। उत्तर भारत में 3 kW सिस्टम साल में लगभग 4,500 यूनिट बनाकर करीब 3.3 टन CO₂ बचाता है।",
    source: { label: "CEA CO₂ baseline database", url: "https://solarquarter.com/2025/01/06/co2-baseline-database-highlights-indias-progress-in-renewable-energy-and-emission-reduction-cea/" },
  },
  {
    id: "independent",
    title: "Why Chhat is independent",
    keywords: "chhat who are you independent unbiased commission sell panels installer conflict about",
    en: "Chhat doesn't sell or install panels. Installers' calculators exist to close a sale; Chhat exists to check the numbers. We earn from installers who pass our quote audit and from lenders, and we show every assumption and source so you can verify us.",
    hi: "छत पैनल नहीं बेचता, न लगाता है। इंस्टॉलर के कैलकुलेटर बिक्री के लिए होते हैं; छत आँकड़े जाँचने के लिए है। हम हर अनुमान और स्रोत दिखाते हैं ताकि आप ख़ुद जाँच सकें।",
  },
];
