import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { PhoneShell } from "@/components/PhoneShell";
import { 
  MapPin, Camera, ChevronRight, ChevronLeft, HelpCircle, 
  Upload, X, Check, ArrowRight, Eye, ShieldAlert, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Form State
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const saved = localStorage.getItem("onboarding_location");
    return saved ? JSON.parse(saved) : null;
  });
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">(() => {
    return localStorage.getItem("onboarding_location") ? "granted" : "idle";
  });
  const [cameraStatus, setCameraStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [pondCount, setPondCount] = useState<number>(() => {
    const saved = localStorage.getItem("onboarding_pond_count");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [pondImages, setPondImages] = useState<string[]>(() => {
    const saved = localStorage.getItem("onboarding_pond_images");
    return saved ? JSON.parse(saved) : [];
  });
  const [fishCount, setFishCount] = useState<string>(() => {
    return localStorage.getItem("onboarding_fish_count") || "";
  });
  const [species, setSpecies] = useState<string>(() => {
    return localStorage.getItem("onboarding_species") || "Tilapia";
  });
  const [avgWeight, setAvgWeight] = useState<string>(() => {
    return localStorage.getItem("onboarding_avg_weight") || "";
  });

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Request Location
  const requestLocation = () => {
    setLocationStatus("requesting");
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocationCoords(coords);
        setLocationStatus("granted");
        localStorage.setItem("onboarding_location", JSON.stringify(coords));
      },
      () => {
        setLocationStatus("denied");
      }
    );
  };

  // Request Camera
  const requestCamera = async () => {
    setCameraStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStatus("granted");
      stream.getTracks().forEach(track => track.stop());
    } catch {
      setCameraStatus("denied");
    }
  };

  // Handle Image Upload
  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedImages = [...pondImages];
      updatedImages[index] = reader.result as string;
      setPondImages(updatedImages);
      localStorage.setItem("onboarding_pond_images", JSON.stringify(updatedImages));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const updatedImages = [...pondImages];
    updatedImages[index] = "";
    setPondImages(updatedImages);
    localStorage.setItem("onboarding_pond_images", JSON.stringify(updatedImages));
  };

  // Skip step or save progress
  const saveProgressAndExit = () => {
    localStorage.setItem("onboarding_completed", "false");
    localStorage.setItem("onboarding_step", step.toString());
    localStorage.setItem("onboarding_pond_count", pondCount.toString());
    localStorage.setItem("onboarding_fish_count", fishCount);
    localStorage.setItem("onboarding_species", species);
    localStorage.setItem("onboarding_avg_weight", avgWeight);
    navigate("/home");
  };

  const completeOnboarding = () => {
    localStorage.setItem("onboarding_completed", "true");
    localStorage.setItem("onboarding_step", "5");
    localStorage.setItem("onboarding_pond_count", pondCount.toString());
    localStorage.setItem("onboarding_fish_count", fishCount);
    localStorage.setItem("onboarding_species", species);
    localStorage.setItem("onboarding_avg_weight", avgWeight);
    navigate("/home");
  };

  const handleNext = () => {
    if (step < 5) {
      localStorage.setItem("onboarding_step", (step + 1).toString());
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <PhoneShell>
      <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Farm Setup</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-semibold text-foreground">Step {step} of 5</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span 
                    key={s} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      s === step ? "w-4 bg-primary" : s < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-slate-200"
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors active:scale-95"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Why ask this?</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                {/* STEP 1: PERMISSIONS */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="display text-3xl text-slate-800 leading-tight">Enable AI Doctor Sensors</h2>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        Allow location and camera access to enable real-time local weather analysis and image diagnosis features.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        onClick={requestLocation}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          locationStatus === "granted" ? "bg-green-50 border-green-200" : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${locationStatus === "granted" ? "bg-green-100" : "bg-slate-100"}`}>
                            <MapPin className={`h-5 w-5 ${locationStatus === "granted" ? "text-green-600" : "text-slate-500"}`} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-900">Access Location</p>
                            <p className="text-[11px] text-muted-foreground">For local weather data</p>
                          </div>
                        </div>
                        {locationStatus === "granted" ? <Check className="h-5 w-5 text-green-600" /> : <ChevronRight className="h-5 w-5 text-slate-300" />}
                      </button>

                      <button
                        onClick={requestCamera}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          cameraStatus === "granted" ? "bg-green-50 border-green-200" : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${cameraStatus === "granted" ? "bg-green-100" : "bg-slate-100"}`}>
                            <Camera className={`h-5 w-5 ${cameraStatus === "granted" ? "text-green-600" : "text-slate-500"}`} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-900">Access Camera</p>
                            <p className="text-[11px] text-muted-foreground">For health diagnostics</p>
                          </div>
                        </div>
                        {cameraStatus === "granted" ? <Check className="h-5 w-5 text-green-600" /> : <ChevronRight className="h-5 w-5 text-slate-300" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: POND COUNT */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="display text-3xl text-slate-800 leading-tight">Your Water Ponds</h2>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        How many fish ponds do you manage? We'll generate custom telemetry interfaces for each pond.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-semibold text-muted-foreground block">Number of Ponds</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              setPondCount(num);
                              localStorage.setItem("onboarding_pond_count", num.toString());
                            }}
                            className={`py-4 rounded-xl font-bold border text-lg transition-all active:scale-95 ${
                              pondCount === num
                                ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            setPondCount(6);
                            localStorage.setItem("onboarding_pond_count", "6");
                          }}
                          className={`flex-1 py-3.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 text-center ${
                            pondCount >= 6
                              ? "bg-primary border-primary text-primary-foreground shadow-md"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          6 or more ponds
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: POND UPLOADS */}
                {step === 3 && (
                  <div className="space-y-6 flex-1 flex flex-col">
                    <div>
                      <h2 className="display text-3xl text-slate-800 leading-tight">Visual Pond Audits</h2>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        Take or upload a photo of your {pondCount} pond{pondCount > 1 ? "s" : ""}. This allows the AI Fish Doctor to analyze water color, setups, and detect health risks.
                      </p>
                    </div>

                    <div className="flex-1 space-y-4 pt-2 overflow-y-auto max-h-[320px] pr-1">
                      {Array.from({ length: Math.min(pondCount, 5) }).map((_, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-800">Pond {i + 1} Photo</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Capture water surface or setup</p>
                          </div>

                          <div className="shrink-0">
                            {pondImages[i] ? (
                              <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                                <img src={pondImages[i]} alt={`Pond ${i + 1}`} className="h-full w-full object-cover" />
                                <button
                                  onClick={() => removeImage(i)}
                                  className="absolute inset-0 bg-black/50 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4.5 w-4.5 text-white" />
                                </button>
                              </div>
                            ) : (
                              <div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(i, e)}
                                  className="hidden"
                                  ref={(el) => { fileInputRefs.current[i] = el; }}
                                />
                                <button
                                  onClick={() => fileInputRefs.current[i]?.click()}
                                  className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 flex items-center justify-center text-slate-500 transition-colors active:scale-95"
                                >
                                  <Upload className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {pondCount > 5 && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-[11px] flex gap-2">
                          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>We only require pictures for your first 5 ponds to configure initial diagnosis filters.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: FISH INVENTORY */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="display text-3xl text-slate-800 leading-tight">Fish Inventory Count</h2>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        Do you know how many fish are stocked in your ponds? This enables precise feed calculations.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-2">Total Fish Quantity</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={fishCount}
                            onChange={(e) => {
                              setFishCount(e.target.value);
                              localStorage.setItem("onboarding_fish_count", e.target.value);
                            }}
                            placeholder="e.g. 5000"
                            className="w-full py-4 px-5 rounded-xl border border-slate-200 bg-white text-base outline-none focus:border-primary transition-all font-semibold"
                          />
                          {fishCount && (
                            <button 
                              onClick={() => { setFishCount(""); localStorage.removeItem("onboarding_fish_count"); }} 
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              <X className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3 text-blue-900 leading-relaxed text-xs">
                        <Info className="h-4.5 w-4.5 shrink-0 mt-0.5 text-blue-600" />
                        <span>If you aren't sure, you can skip this step. The feed calculator can estimate your stock size using a standard pond volume ratio.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: SPECIES DETAILS */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="display text-3xl text-slate-800 leading-tight">Fish Species Profile</h2>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        What fish species are you farming, and what is their average size? We'll load matching dietary guidelines.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-2">Fish Species</label>
                        <select
                          value={species}
                          onChange={(e) => {
                            setSpecies(e.target.value);
                            localStorage.setItem("onboarding_species", e.target.value);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-primary appearance-none cursor-pointer"
                        >
                          <option value="Tilapia">Nile Tilapia</option>
                          <option value="Catfish">African Catfish</option>
                          <option value="Heterotis">Heterotis (Bonefish)</option>
                          <option value="Mixed">Mixed Stocking</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-2">Average Fish Weight (Grams)</label>
                        <input
                          type="number"
                          value={avgWeight}
                          onChange={(e) => {
                            setAvgWeight(e.target.value);
                            localStorage.setItem("onboarding_avg_weight", e.target.value);
                          }}
                          placeholder="e.g. 150"
                          className="w-full py-4 px-5 rounded-xl border border-slate-200 bg-white text-base outline-none focus:border-primary transition-all font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-3 rounded-full hover:bg-slate-100 text-sm font-semibold text-muted-foreground transition-all active:scale-95"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                onClick={saveProgressAndExit}
                className="px-5 py-3 rounded-full hover:bg-slate-100 text-xs font-semibold text-muted-foreground transition-all active:scale-95"
              >
                Skip for Now
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <span>{step === 5 ? "Complete Setup" : "Next"}</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Explanatory Help Modal */}
        {showHelpModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-50 animate-fade-in">
            <div className="w-full bg-white rounded-t-[32px] p-6 shadow-2xl pb-8 animate-slide-up max-h-[90%] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary">
                    <HelpCircle className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-800">Why do we ask this?</h3>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-muted-foreground transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="space-y-5 text-sm text-slate-600 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Location Access
                  </h4>
                  <p className="mt-1 text-xs">
                    We request access to coordinates to fetch real-time local forecasts (like rainfall and winds). Wind directions and severe drops in temperature affect water oxygen transfer.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-primary" /> Pond Photos
                  </h4>
                  <p className="mt-1 text-xs">
                    Aquaculture AI uses computer vision models to inspect water color. Dark green, brown, or turbid water points to algal density or soil runoff. Uploading pictures helps train the AI for your ponds.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ArrowRight className="h-4 w-4 text-primary" /> Stock Inventory & Species
                  </h4>
                  <p className="mt-1 text-xs">
                    Tilapia and Catfish have entirely different feeding regimes. Daily feed calculations require exact stocking sizes and estimated fish biomass to prevent food waste and keep water pure.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-7 py-3.5 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-xl text-center shadow-md transition-all active:scale-95"
              >
                I Understand
              </button>
            </div>
          </div>
        )}
      </div>
    </PhoneShell>
  );
}
