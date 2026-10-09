// Fetches 20-year NASA POWER climatology (2001-2020) for each seed city and
// writes src/data/cities.json. Run once; the app also fetches live for any lat/lon.
import { readFile, writeFile } from "node:fs/promises";

const seed = JSON.parse(await readFile(new URL("./cities-seed.json", import.meta.url), "utf8"));
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const out = [];

for (const [name, state, lat, lon] of seed) {
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,T2M&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`;
  let json;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      json = await res.json();
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  if (!json) { console.error("failed", name); continue; }
  const p = json.properties.parameter;
  out.push({
    name, state, lat, lon,
    ghi: MONTHS.map((m) => +p.ALLSKY_SFC_SW_DWN[m].toFixed(3)),
    t2m: MONTHS.map((m) => +p.T2M[m].toFixed(1)),
  });
  console.log(name, p.ALLSKY_SFC_SW_DWN.ANN);
}

await writeFile(new URL("../src/data/cities.json", import.meta.url), JSON.stringify({
  source: "NASA POWER Climatology API v2.10, ALLSKY_SFC_SW_DWN (kWh/m²/day) and T2M (°C), 2001-2020",
  fetched: new Date().toISOString().slice(0, 10),
  cities: out,
}, null, 0));
console.log("wrote", out.length, "cities");
