import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AREA_UNITS, STAMP_RATES, convertArea, emi, inr, roi, stampDuty, type Buyer } from "@/lib/calc";

const selectCls = "mt-1 flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm";

function Num({ label, value, onChange, step }: { label: string; value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type="number" className="mt-1" value={value} step={step} min={0} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function Result({ rows }: { rows: [string, string, boolean?][] }) {
  return (
    <div className="rounded-md bg-ink p-6 text-ink-foreground">
      {rows.map(([k, v, big]) => (
        <div key={k} className="flex items-baseline justify-between border-b border-ink-foreground/10 py-3 last:border-0">
          <span className="text-sm opacity-75">{k}</span>
          <span className={big ? "font-display text-3xl" : "font-semibold"}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function StampDuty() {
  const [value, setValue] = useState(10000000);
  const [state, setState] = useState("Delhi");
  const [buyer, setBuyer] = useState<Buyer>("male");
  const r = stampDuty(value, state, buyer);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <Num label="Property value (₹)" value={value} onChange={setValue} step={100000} />
        <div>
          <Label>State</Label>
          <select className={selectCls} value={state} onChange={(e) => setState(e.target.value)}>
            {Object.keys(STAMP_RATES).map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <Label>Buyer</Label>
          <select className={selectCls} value={buyer} onChange={(e) => setBuyer(e.target.value as Buyer)}>
            <option value="male">Man</option>
            <option value="female">Woman</option>
            <option value="joint">Joint (man & woman)</option>
          </select>
        </div>
      </div>
      <Result rows={[[`Stamp duty (${r.rate}%)`, inr(r.duty)], ["Registration (1%)", inr(r.registration)], ["Total payable", inr(r.total), true]]} />
    </div>
  );
}

function Emi() {
  const [p, setP] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [yrs, setYrs] = useState(20);
  const r = emi(p, rate, yrs);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <Num label="Loan amount (₹)" value={p} onChange={setP} step={100000} />
        <Num label="Interest rate (% per year)" value={rate} onChange={setRate} step={0.1} />
        <Num label="Tenure (years)" value={yrs} onChange={setYrs} />
      </div>
      <Result rows={[["Monthly EMI", inr(r.monthly), true], ["Total interest", inr(r.interest)], ["Total payment", inr(r.total)]]} />
    </div>
  );
}

function Roi() {
  const [price, setPrice] = useState(10000000);
  const [rent, setRent] = useState(35000);
  const [app, setApp] = useState(7);
  const [yrs, setYrs] = useState(5);
  const [costs, setCosts] = useState(40000);
  const r = roi(price, rent, app, yrs, costs);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <Num label="Purchase price (₹)" value={price} onChange={setPrice} step={100000} />
        <Num label="Monthly rent (₹)" value={rent} onChange={setRent} step={1000} />
        <Num label="Yearly appreciation (%)" value={app} onChange={setApp} step={0.5} />
        <Num label="Holding period (years)" value={yrs} onChange={setYrs} />
        <Num label="Yearly costs — maintenance, tax (₹)" value={costs} onChange={setCosts} step={1000} />
      </div>
      <Result rows={[["Total return", `${r.totalRoi.toFixed(1)}%`, true], ["Net rental yield", `${r.rentalYield.toFixed(2)}% / yr`], ["Estimated future value", inr(r.futureValue)], ["Net rent earned", inr(r.netRent)]]} />
    </div>
  );
}

function AreaConverter() {
  const [v, setV] = useState(1000);
  const [from, setFrom] = useState("Square feet");
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <Num label="Area" value={v} onChange={setV} />
        <div>
          <Label>Unit</Label>
          <select className={selectCls} value={from} onChange={(e) => setFrom(e.target.value)}>
            {Object.keys(AREA_UNITS).map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <Result
        rows={Object.keys(AREA_UNITS)
          .filter((u) => u !== from)
          .map((u) => [u, convertArea(v, from, u).toLocaleString("en-IN", { maximumFractionDigits: 4 })] as [string, string])}
      />
    </div>
  );
}

export function Calculators() {
  return (
    <Tabs defaultValue="stamp">
      <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-secondary p-1">
        <TabsTrigger value="stamp">Stamp Duty</TabsTrigger>
        <TabsTrigger value="emi">Home Loan EMI</TabsTrigger>
        <TabsTrigger value="roi">ROI</TabsTrigger>
        <TabsTrigger value="area">Area Converter</TabsTrigger>
      </TabsList>
      <div className="mt-8 rounded-md border bg-card p-6 md:p-8">
        <TabsContent value="stamp"><StampDuty /></TabsContent>
        <TabsContent value="emi"><Emi /></TabsContent>
        <TabsContent value="roi"><Roi /></TabsContent>
        <TabsContent value="area"><AreaConverter /></TabsContent>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Results are indicative. Rates change — confirm with your lawyer, bank or the sub-registrar office.</p>
    </Tabs>
  );
}
