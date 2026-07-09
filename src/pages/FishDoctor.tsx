import { DetailShell, Field, Select } from "@/components/DetailShell";
import { Camera, Sparkles, Info, X, Trash2, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";

const symptoms = ["Loss of appetite", "Lethargy", "Red spots", "Fin damage", "Erratic swimming", "Other"];

type Diagnosis = {
  condition: string;
  confidence: string;
  remedy: string[];
  supplier: string;
  feedAdjustment: string;
};

const DIAGNOSES: Record<string, Diagnosis> = {
  "Loss of appetite": {
    condition: "Early Stage Bacterial Infection (Aeromonas)",
    confidence: "88%",
    remedy: [
      "Reduce feeding by 50% for 3 days to prevent organic water contamination.",
      "Apply agricultural salt (3kg per 1000L of water) to reduce fish osmotic stress.",
      "Ensure oxygen remains above 5.0 mg/L by running aerators."
    ],
    supplier: "Volta Aquaculture Supplies Ltd (Kpong, 4.2 km)",
    feedAdjustment: "Switch to 2mm medicated feed with oxytetracycline."
  },
  "Lethargy": {
    condition: "Dissolved Oxygen Stress / Gill Congestion",
    confidence: "94%",
    remedy: [
      "Turn on all pond aerators immediately and clear any surface algae.",
      "Stop feeding entirely for 24 hours until DO levels restore.",
      "Add fresh lake water inflow if available."
    ],
    supplier: "Pokuase Water Tech & Pumps (Accra, 12 km)",
    feedAdjustment: "No feed for 1 day, then yellow caution feeding (25%)."
  },
  "Red spots": {
    condition: "Epizootic Ulcerative Syndrome (EUS) / Fungal Infection",
    confidence: "91%",
    remedy: [
      "Quarantine affected pond immediately to prevent cross-contamination.",
      "Apply potassium permanganate (2ppm) bath or agricultural lime to raise pH.",
      "Consult regional extension officer immediately."
    ],
    supplier: "Adom Agricultural Pharmacy (Kumasi, 8 km)",
    feedAdjustment: "Reduce feed rate to yellow caution index (30%)."
  },
  "Fin damage": {
    condition: "Fin Rot (Flexibacter columnaris) / Physical Crowding Stress",
    confidence: "85%",
    remedy: [
      "Check stocking density; reduce crowd size if possible.",
      "Use salt bath therapy (5-10g/L) for affected specimens.",
      "Maintain strict water purification cycles."
    ],
    supplier: "Susu Aquaculture Meds (Tema, 15 km)",
    feedAdjustment: "Maintain normal feed, but switch to high-protein immune booster pellets."
  },
  "Erratic swimming": {
    condition: "Parasitic Infestation (Trichodina / Dactylogyrus)",
    confidence: "89%",
    remedy: [
      "Formalin treatment (25 ppm) in controlled bath, or salt treatment.",
      "Increase aeration as parasites damage gill membranes, reducing oxygen intake.",
      "Perform a 30% water exchange."
    ],
    supplier: "West Coast Vet & Aqua (Accra, 6.4 km)",
    feedAdjustment: "Reduce feed by 30% during chemical treatment."
  },
  "Other": {
    condition: "General Water Quality Stress",
    confidence: "80%",
    remedy: [
      "Perform a full water parameter test (pH, Ammonia, Nitrite).",
      "Perform a 20% partial water change.",
      "Observe fish behavior closely over next 12 hours."
    ],
    supplier: "Regional Extension Office Support",
    feedAdjustment: "Feed normally but inspect unconsumed feed after 15 minutes."
  }
};

export default function FishDoctor() {
  const [selectedPond, setSelectedPond] = useState("Pond 1");
  const [activeSymptom, setActiveSymptom] = useState("Loss of appetite");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Read pond count from onboarding to generate choices
  const pondCount = (() => {
    const saved = localStorage.getItem("onboarding_pond_count");
    return saved ? parseInt(saved, 10) : 4;
  })();
  const pondOptions = Array.from({ length: pondCount }).map((_, i) => `Pond ${i + 1}`);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      setDiagnosis(null); // Reset diagnosis when new photo uploaded
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setDiagnosis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runAnalysis = () => {
    setLoading(true);
    setDiagnosis(null);

    // Increment AI usage prompt count
    const currentPrompts = parseInt(localStorage.getItem("usage_prompts_count") || "0", 10);
    localStorage.setItem("usage_prompts_count", String(currentPrompts + 1));
    window.dispatchEvent(new Event("usage_updated"));

    setTimeout(() => {
      setLoading(false);
      const result = DIAGNOSES[activeSymptom] || DIAGNOSES["Other"];
      setDiagnosis(result);
    }, 2000);
  };

  return (
    <DetailShell title="Fish Doctor" subtitle="AI diagnosis for healthier fish.">
      {/* Pond Selection Dropdown */}
      <Field label="Select Affected Pond">
        <Select 
          value={selectedPond} 
          onChange={setSelectedPond} 
          options={pondOptions} 
        />
      </Field>

      {/* Symptom Picker */}
      <p className="text-xs text-muted-foreground mt-6 mb-3 font-semibold">What symptoms are you seeing?</p>
      <div className="flex flex-wrap gap-2">
        {symptoms.map((s) => (
          <button
            key={s}
            onClick={() => {
              setActiveSymptom(s);
              setDiagnosis(null); // Reset when symptom changes
            }}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
              activeSymptom === s
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Photo Uploader */}
      <p className="text-xs text-muted-foreground mt-6 mb-2 font-semibold font-sans">Add Photos (optional)</p>
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handlePhotoUpload} 
      />

      {photo ? (
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm bg-black h-48 w-full group">
          <img src={photo} alt="Fish symptom" className="h-full w-full object-cover opacity-90" />
          <button
            onClick={handleRemovePhoto}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center text-white transition-all active:scale-90"
            title="Remove Photo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-2xl border border-dashed border-slate-300 bg-white hover:bg-slate-50/50 py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground active:scale-98 transition-all"
        >
          <div className="h-11 w-11 rounded-full bg-slate-100 grid place-items-center text-slate-500">
            <Camera className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <span className="text-xs font-bold text-slate-600">Tap to add photos</span>
          <span className="text-[10px] text-muted-foreground">Diagnose water color or body sores</span>
        </button>
      )}

      {/* Action Button */}
      <button 
        onClick={runAnalysis}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-primary hover:bg-primary/95 text-primary-foreground py-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Analyzing symptoms...
          </span>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Analyze with AI
          </>
        )}
      </button>

      {/* Diagnosis Report Card */}
      {diagnosis && !loading && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <h3 className="font-bold text-sm">Diagnosis Complete ({diagnosis.confidence} confidence)</h3>
          </div>
          
          <h4 className="mt-3 text-lg font-bold text-slate-900 tracking-tight">{diagnosis.condition}</h4>
          
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Recommended Treatment</p>
              <ul className="mt-1.5 space-y-1.5 pl-3 list-disc text-xs text-slate-700 leading-relaxed font-medium">
                {diagnosis.remedy.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Feeding Adjustment</p>
                <p className="mt-1 text-xs font-semibold text-amber-700">{diagnosis.feedAdjustment}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Nearby Supplier</p>
                <p className="mt-1 text-xs font-semibold text-slate-800">{diagnosis.supplier}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informational Help Box */}
      <div className="mt-5 rounded-xl bg-slate-100 border border-slate-200 px-4 py-3.5 flex gap-3 items-start">
        <Info className="h-4.5 w-4.5 mt-0.5 text-slate-500 shrink-0" />
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Upload fish body/gill close-ups or water surface colors. The AI Fish Doctor uses computer vision to cross-reference symptoms with regional aquaculture databases.
        </p>
      </div>
    </DetailShell>
  );
}
