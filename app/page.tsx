
"use client";

import { useMemo, useState } from "react";
import styles from "../styles/globals.css";

type Offer = {
  merchant: string;
  price: number;
  currency: string;
  in_stock: boolean;
  url: string;
  stock_msg?: string;
};
type Product = {
  id: string;
  category: "Regolatori" | "Computer" | "BCD/GAV" | "Mute";
  brand: string;
  name: string;
  variant?: string;
  specs: Record<string, any>;
  offers: Offer[];
  image?: string;
};

const CURRENCY = "EUR";

const PRODUCTS: Product[] = [
  {
    id: "p1",
    category: "Regolatori",
    brand: "Apeks",
    name: "Apeks XTX200 DIN",
    variant: "DIN",
    specs: { Bilanciato: "Sì", Porte_HP: 2, Porte_LP: 4, Peso_g: 1200 },
    image: "https://images.pexels.com/photos/37530/diver-scuba-underwater-ocean-37530.jpeg",
    offers: [
      { merchant: "DiveInn", price: 489.9, currency: "EUR", in_stock: true, url: "#" },
      { merchant: "LeisurePro", price: 475.0, currency: "EUR", in_stock: true, url: "#" },
      { merchant: "SubShop", price: 499.0, currency: "EUR", in_stock: false, url: "#", stock_msg: "Su ordinazione" },
    ],
  },
  {
    id: "p2",
    category: "Regolatori",
    brand: "Mares",
    name: "Mares Dual ADJ 62X DIN",
    variant: "DIN",
    specs: { Bilanciato: "Sì", Porte_HP: 2, Porte_LP: 4, Peso_g: 905 },
    image: "https://images.pexels.com/photos/290543/pexels-photo-290543.jpeg",
    offers: [
      { merchant: "DiveInn", price: 349.0, currency: "EUR", in_stock: true, url: "#" },
      { merchant: "Decathlon", price: 359.9, currency: "EUR", in_stock: true, url: "#" },
    ],
  },
  {
    id: "p3",
    category: "Computer",
    brand: "Shearwater",
    name: "Shearwater Peregrine",
    specs: { Algoritmo: "Bühlmann ZHL-16C", Gas: "Nitrox/Aria", AI: "No", Display: "A colori" },
    image: "https://images.pexels.com/photos/8910280/pexels-photo-8910280.jpeg",
    offers: [
      { merchant: "SubShop", price: 489.0, currency: "EUR", in_stock: true, url: "#" },
      { merchant: "LeisurePro", price: 469.0, currency: "EUR", in_stock: true, url: "#" },
    ],
  },
  {
    id: "p4",
    category: "Computer",
    brand: "Suunto",
    name: "Suunto D5",
    specs: { Algoritmo: "Suunto Fused RGBM 2", Gas: "Nitrox/Aria", AI: "Sì (opz)", Display: "A colori" },
    image: "https://images.pexels.com/photos/18990906/pexels-photo-18990906.jpeg",
    offers: [
      { merchant: "Decathlon", price: 599.0, currency: "EUR", in_stock: true, url: "#" },
      { merchant: "DiveInn", price: 589.0, currency: "EUR", in_stock: false, url: "#", stock_msg: "Esaurito" },
    ],
  },
];

function eur(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: CURRENCY }).format(n);
}

function estimateShipping(merchant: string, country: string, subtotal: number, zip?: string): number {
  const rules: any = {
    DiveInn: { IT: { base: 9.99, free_over: 150 } },
    LeisurePro: { IT: { base: 24.99, free_over: null } },
    Decathlon: { IT: { base: 5.99, free_over: 99 } },
    SubShop: { IT: { base: 7.49, free_over: 120 } },
  };
  const rule = rules[merchant]?.[country];
  if (!rule) return 14.99;
  if (rule.free_over && subtotal >= rule.free_over) return 0;
  const remote = zip && /^(97|98|99)/.test(zip) ? 3.0 : 0;
  return rule.base + remote;
}

function bestOfferWithShipping(p: Product, country: string, zip?: string) {
  const enriched = p.offers.map(o => ({
    ...o,
    ship: estimateShipping(o.merchant, country, o.price, zip),
    total: o.price + estimateShipping(o.merchant, country, o.price, zip),
  }));
  enriched.sort((a, b) => a.total - b.total);
  return enriched[0];
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Tutte" | Product["category"]>("Tutte");
  const [brand, setBrand] = useState<string>("Tutti");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMax, setPriceMax] = useState(800);
  const [country, setCountry] = useState("IT");
  const [zip, setZip] = useState("");
  const [compare, setCompare] = useState<Product[]>([]);

  const brands = Array.from(new Set(PRODUCTS.map(p => p.brand)));
  const results = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (category !== "Tutte" && p.category !== category) return false;
      if (brand !== "Tutti" && p.brand !== brand) return false;
      if (inStockOnly && !p.offers.some(o => o.in_stock)) return false;
      if (query) {
        const q = query.toLowerCase();
        const target = `${p.brand} ${p.name} ${p.variant || ""}`.toLowerCase();
        if (!target.includes(q)) return false;
      }
      const best = bestOfferWithShipping(p, country, zip);
      if (best.total > priceMax) return false;
      return true;
    });
  }, [query, category, brand, inStockOnly, priceMax, country, zip]);

  function toggleCompare(p: Product) {
    setCompare(prev => {
      const exist = prev.some(x => x.id === p.id);
      if (exist) return prev.filter(x => x.id !== p.id);
      if (prev.length >= 4) return prev;
      return [...prev, p];
    });
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <div className="badge">MVP Demo</div>
          <h1 className="h1">Motore di ricerca attrezzatura subacquea</h1>
        </div>
        <button className="btn secondary" onClick={() => location.reload()}>Reset</button>
      </header>

      <section className="card" style={{marginBottom:12}}>
        <div className="card-content">
          <div className="row small" style={{marginBottom:8}}>
            <span>Filtri e destinazione spedizione</span>
          </div>
          <div className="controls">
            <div style={{gridColumn:"span 4"}}>
              <label className="label">Cerca</label>
              <input className="input" placeholder="Regolatore, brand, codice..." value={query} onChange={e=>setQuery(e.target.value)} />
            </div>
            <div style={{gridColumn:"span 2"}}>
              <label className="label">Categoria</label>
              <select className="select" value={category} onChange={e=>setCategory(e.target.value as any)}>
                <option value="Tutte">Tutte</option>
                <option value="Regolatori">Regolatori</option>
                <option value="Computer">Computer</option>
                <option value="BCD/GAV">BCD/GAV</option>
                <option value="Mute">Mute</option>
              </select>
            </div>
            <div style={{gridColumn:"span 2"}}>
              <label className="label">Brand</label>
              <select className="select" value={brand} onChange={e=>setBrand(e.target.value)}>
                <option value="Tutti">Tutti</option>
                {brands.map(b=> <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={{gridColumn:"span 2"}}>
              <label className="label">Prezzo max</label>
              <input className="input" type="number" min={100} max={2000} step={10} value={priceMax} onChange={e=>setPriceMax(parseInt(e.target.value || "0"))} />
            </div>
            <div style={{gridColumn:"span 1"}}>
              <label className="label">Solo disponibili</label>
              <select className="select" value={inStockOnly ? "1" : "0"} onChange={e=>setInStockOnly(e.target.value==="1")}>
                <option value="0">No</option>
                <option value="1">Sì</option>
              </select>
            </div>
            <div style={{gridColumn:"span 1"}}>
              <label className="label">Paese</label>
              <select className="select" value={country} onChange={e=>setCountry(e.target.value)}>
                <option value="IT">IT</option>
                <option value="FR">FR</option>
                <option value="DE">DE</option>
              </select>
            </div>
            <div style={{gridColumn:"span 12"}}>
              <label className="label">CAP (per stima spedizione)</label>
              <input className="input" placeholder="es. 20100" value={zip} onChange={e=>setZip(e.target.value.replace(/\\D/g,'').slice(0,5))} />
            </div>
          </div>
        </div>
      </section>

      <section>
        {results.length === 0 ? (
          <div className="small">Nessun risultato con i criteri selezionati.</div>
        ) : (
          <div className="grid grid-3">
            {results.map(p => {
              const best = bestOfferWithShipping(p, country, zip);
              const anyInStock = p.offers.some(o=>o.in_stock);
              return (
                <div className="card" key={p.id}>
                  <div className="img" style={{backgroundImage:`url(${p.image})`}} />
                  <div className="card-content">
                    <div className="row">
                      <div>
                        <div className="small" style={{textTransform:"uppercase"}}>{p.brand}</div>
                        <div style={{fontWeight:700}}>{p.name}</div>
                      </div>
                      <span className="tag">{anyInStock ? "Disponibile" : "Non disponibile"}</span>
                    </div>
                    <div className="row" style={{marginTop:8}}>
                      <div style={{fontSize:22,fontWeight:800}}>{eur(best.total)}</div>
                      <div className="small">totale stimato</div>
                    </div>
                    <div className="row" style={{marginTop:8}}>
                      <div className="small">Miglior merchant: <strong>{best.merchant}</strong></div>
                      <div className="small">Sped.: {eur(best.ship)}</div>
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:10}}>
                      <a className="btn primary block" href={best.url} target="_blank">Vai al negozio</a>
                      <button className="btn secondary" onClick={()=>toggleCompare(p)}>{compare.some(x=>x.id===p.id) ? "Rimuovi" : "Confronta"}</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section style={{marginTop:24}}>
        <div className="card">
          <div className="card-content">
            <div className="row" style={{marginBottom:12}}>
              <strong>Confronto</strong>
              <span className="small">{compare.length}/4 selezionati</span>
            </div>
            {compare.length === 0 ? (
              <div className="small">Aggiungi fino a 4 prodotti per confrontarli.</div>
            ) : (
              <div style={{overflowX:"auto"}}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Caratteristica</th>
                      {compare.map(p => <th key={p.id}>{p.brand} {p.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(new Set(compare.flatMap(p => Object.keys(p.specs)))).map(key => (
                      <tr key={key}>
                        <td style={{fontWeight:600}}>{key}</td>
                        {compare.map(p => <td key={p.id+key}>{String(p.specs[key] ?? "–")}</td>)}
                      </tr>
                    ))}
                    <tr>
                      <td style={{fontWeight:600}}>Miglior totale stimato ({zip || country})</td>
                      {compare.map(p => {
                        const b = bestOfferWithShipping(p, country, zip);
                        return <td key={p.id+"best"} style={{fontWeight:700}}>{eur(b.total)} <span className="small">({b.merchant})</span></td>
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="footer">Prezzi e spedizioni sono simulati per scopi dimostrativi.</div>
    </div>
  );
}
