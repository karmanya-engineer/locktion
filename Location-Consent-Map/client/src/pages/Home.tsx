import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, ShieldCheck, Phone, MapPin, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { mockBackend } from "@/lib/mockBackend";
import MapView from "@/components/MapView";
import bgImage from "@assets/generated_images/secure_network_data_visualization_background.png";

type Step = "phone" | "otp" | "permission" | "tracking";

export default function Home() {
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await mockBackend.requestOtp(phoneNumber);
      setStep("otp");
    } catch (err) {
      setError("Failed to connect to telecom provider.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await mockBackend.verifyOtp(phoneNumber, otp);
      setStep("permission");
    } catch (err) {
      setError("Invalid OTP code. Try 123456.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        await mockBackend.storeLocation(phoneNumber, latitude, longitude, accuracy);
        setLocationData({ lat: latitude, lng: longitude, accuracy });
        setStep("tracking");
        setIsLoading(false);
      },
      (err) => {
        setError(`Location access denied: ${err.message}`);
        setIsLoading(false);
      }
    );
  };

  const resetDemo = () => {
    setStep("phone");
    setPhoneNumber("");
    setOtp("");
    setLocationData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <img src={bgImage} className="w-full h-full object-cover" alt="" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">GeoConsent</h1>
              <p className="text-sm text-slate-500">Lawful Location Intelligence Demo</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Lock size={14} /> End-to-End Encrypted</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} /> GDPR Compliant</span>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column: Interactive Flow */}
          <div>
            <AnimatePresence mode="wait">
              {step === "phone" && (
                <motion.div key="phone" variants={fadeIn} initial="hidden" animate="visible" exit="exit">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Initiate Trace</CardTitle>
                      <CardDescription>Enter the subject's mobile number to begin the consent request protocol.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleRequestOtp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Mobile Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                              id="phone" 
                              placeholder="+1 (555) 000-0000" 
                              className="pl-9"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                          </div>
                        </div>
                        {error && <p className="text-destructive text-sm font-medium">{error}</p>}
                        <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-request-otp">
                          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : "Request Consent"}
                        </Button>
                      </form>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
                      <p className="text-xs text-slate-500">
                        <AlertTriangle className="inline h-3 w-3 mr-1 text-amber-500" /> 
                        Educational Mode: No real SMS will be sent.
                      </p>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div key="otp" variants={fadeIn} initial="hidden" animate="visible" exit="exit">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Verify Consent</CardTitle>
                      <CardDescription>Enter the One-Time Password (OTP) sent to the device to prove ownership.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="otp">OTP Code</Label>
                          <Input 
                            id="otp" 
                            placeholder="123456" 
                            className="tracking-widest text-center text-lg"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                          />
                        </div>
                        {error && <p className="text-destructive text-sm font-medium">{error}</p>}
                        <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-verify-otp">
                           {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify Identity"}
                        </Button>
                      </form>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
                      <p className="text-xs text-slate-500">Use code <b>123456</b></p>
                      <button onClick={() => setStep("phone")} className="text-xs text-primary hover:underline">Change Number</button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {step === "permission" && (
                <motion.div key="permission" variants={fadeIn} initial="hidden" animate="visible" exit="exit">
                  <Card className="border-slate-200 shadow-sm bg-blue-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Activate Location
                      </CardTitle>
                      <CardDescription>Consent verified. Ready to request device coordinates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert className="bg-white border-blue-100">
                        <AlertTitle>Privacy Check</AlertTitle>
                        <AlertDescription className="text-xs text-slate-600">
                          The browser will now ask for explicit permission to share GPS data. This is a client-side OS-level security feature that cannot be bypassed.
                        </AlertDescription>
                      </Alert>
                      
                      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
                      
                      <Button onClick={handleRequestLocation} className="w-full" size="lg" disabled={isLoading} data-testid="button-share-location">
                         {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Acquiring Signal...</> : "Share Location Now"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === "tracking" && (
                <motion.div key="tracking" variants={fadeIn} initial="hidden" animate="visible" exit="exit">
                   <Card className="border-green-200 shadow-sm bg-green-50/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        Signal Acquired
                      </CardTitle>
                      <CardDescription>Subject location successfully triangulated and logged.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-white rounded border border-slate-100">
                           <span className="block text-xs text-slate-400 uppercase">Latitude</span>
                           <span className="font-mono text-slate-700">{locationData?.lat.toFixed(6)}</span>
                        </div>
                        <div className="p-3 bg-white rounded border border-slate-100">
                           <span className="block text-xs text-slate-400 uppercase">Longitude</span>
                           <span className="font-mono text-slate-700">{locationData?.lng.toFixed(6)}</span>
                        </div>
                        <div className="p-3 bg-white rounded border border-slate-100 col-span-2">
                           <span className="block text-xs text-slate-400 uppercase">Accuracy</span>
                           <span className="font-mono text-slate-700">Within {locationData?.accuracy ? Math.round(locationData.accuracy) : 0} meters</span>
                        </div>
                      </div>
                      <Button variant="outline" onClick={resetDemo} className="w-full" data-testid="button-reset">New Session</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Information & Map */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Live Surveillance Map</h2>
              {step === "tracking" && locationData ? (
                <MapView lat={locationData.lat} lng={locationData.lng} accuracy={locationData.accuracy} />
              ) : (
                <div className="h-[400px] w-full rounded-lg border border-slate-200 bg-slate-100 flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="bg-slate-200 p-4 rounded-full">
                    <MapPin className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="text-sm">Waiting for signal...</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2">How Lawful Tracking Works</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="bg-blue-100 text-blue-700 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shrink-0">1</span>
                  <span><strong>Initiation:</strong> Authorized party requests location via phone number.</span>
                </li>
                 <li className="flex gap-2">
                  <span className="bg-blue-100 text-blue-700 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shrink-0">2</span>
                  <span><strong>Consent (Handshake):</strong> The device owner receives an SMS/Notification to verify identity and approve the request.</span>
                </li>
                 <li className="flex gap-2">
                  <span className="bg-blue-100 text-blue-700 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shrink-0">3</span>
                  <span><strong>Transmission:</strong> Once approved, the device securely transmits GPS coordinates to the server.</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs leading-relaxed">
              <strong>DISCLAIMER:</strong> This is a simulation. Real-time location tracking using only a phone number (SS7/HLR lookup) is a restricted capability available only to law enforcement and mobile carriers under strict legal warrant. Commercial applications must always obtain explicit user consent via app permissions or SMS opt-in.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
