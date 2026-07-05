import { DetailShell } from "@/components/DetailShell";
import { MapPin, Scale, Calendar, ChevronRight, CheckCircle } from "lucide-react";
import { useState } from "react";

const listings = [
  { farmer: "Emmanuel M.", location: "Volta Lake, Accra", species: "Tilapia", size: "450g avg", qty: "1,200 kg", date: "Jul 12", buyers: ["Restaurant", "Hotel"] },
  { farmer: "Kwame A.", location: "Kumasi Region", species: "Catfish", size: "600g avg", qty: "800 kg", date: "Jul 15", buyers: ["Smokehouse", "Exporter"] },
  { farmer: "Abena S.", location: "Eastern Region", species: "Tilapia", size: "380g avg", qty: "500 kg", date: "Jul 18", buyers: ["Market"] },
];

const tabs = ["Available", "My Harvest", "Requests"] as const;

export default function HarvestMarketplace() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Available");
  const [requested, setRequested] = useState<Set<number>>(new Set());

  return (
    <DetailShell
      title="Harvest Marketplace"
      subtitle="Connect directly with restaurants, hotels, and buyers."
    >
      <div className="rounded-full bg-white/70 border border-border p-1 flex text-sm">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full transition-colors text-xs font-medium ${
              tab === t ? "bg-primary text-primary-foreground" : "text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Available" && (
        <div className="mt-5 space-y-3">
          {listings.map((l, i) => (
            <div key={i} className="rounded-2xl bg-white/70 border border-border/70 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold tracking-tight">{l.species}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{l.farmer}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {l.buyers.map((b) => (
                    <span key={b} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{l.location}</span>
                <span className="flex items-center gap-1"><Scale className="h-3 w-3" />{l.qty}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{l.date}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{l.size}</p>
              <button
                onClick={() => setRequested((prev) => new Set([...prev, i]))}
                className={`mt-3 w-full py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  requested.has(i)
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {requested.has(i) ? (
                  <><CheckCircle className="h-4 w-4" /> Requested</>
                ) : "Request Harvest"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "My Harvest" && (
        <div className="mt-8 flex flex-col items-center text-center gap-3 py-10">
          <div className="h-14 w-14 rounded-full bg-surface border border-border/70 grid place-items-center">
            <Scale className="h-6 w-6 text-muted-foreground" strokeWidth={1.6} />
          </div>
          <p className="font-semibold">No harvest listed yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">When your fish are ready, press the button below to let buyers know.</p>
          <button className="mt-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-lg">
            Ready for Harvest
          </button>
        </div>
      )}

      {tab === "Requests" && (
        <div className="mt-8 flex flex-col items-center text-center gap-3 py-10">
          <div className="h-14 w-14 rounded-full bg-surface border border-border/70 grid place-items-center">
            <ChevronRight className="h-6 w-6 text-muted-foreground" strokeWidth={1.6} />
          </div>
          <p className="font-semibold">No requests yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">Buyer requests for your fish will appear here.</p>
        </div>
      )}
    </DetailShell>
  );
}
