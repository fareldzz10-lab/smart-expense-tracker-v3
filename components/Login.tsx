import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import {
  ArrowRight,
  ScanFace,
  CheckCircle2,
  ShieldCheck,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { User as UserType } from "../types";
import { Logo } from "./ui/Logo";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";

interface LoginProps {
  onLogin: (user: UserType) => void;
}

// Background Grid Animation
const GridBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"></div>
    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
  </div>
);

// Spotlight Card Wrapper
const SpotlightCard = ({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(99, 102, 241, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginStep, setLoginStep] = useState<"idle" | "scanning" | "success">(
    "idle"
  );
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoginStep("scanning");
    setError("");

    // Check if config is still placeholder
    if (auth.app.options.apiKey === "YOUR_API_KEY") {
      setLoginStep("idle");
      setError(
        "Configuration Error: You need to paste your Firebase API Keys in services/firebase.ts"
      );
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      setLoginStep("success");

      // Pass user info to App
      setTimeout(() => {
        const userToLogin: UserType = {
          name: user.displayName || "User",
          email: user.email || "",
        };
        onLogin(userToLogin);
      }, 1000);
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = "Failed to sign in.";
      if (err.code === "auth/configuration-not-found")
        msg = "Firebase Authentication is not enabled in the console.";
      if (err.code === "auth/api-key-not-valid")
        msg = "Invalid API Key. Check services/firebase.ts.";
      if (err.code === "auth/cancelled-popup-request")
        msg = "Popup was cancelled.";
      if (err.code === "auth/popup-closed-by-user")
        msg = "Login window closed.";

      setError(msg);
      setLoginStep("idle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-200 p-4 relative selection:bg-indigo-500/30 transition-colors duration-300">
      <GridBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <SpotlightCard className="rounded-3xl backdrop-blur-xl shadow-2xl shadow-indigo-500/10 dark:shadow-black/50">
          <div className="p-8 sm:p-10 relative z-20">
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="mx-auto mb-6 flex items-center justify-center"
              >
                <Logo className="w-20 h-20" />
              </motion.div>

              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={14} /> Cloud Sync Enabled
              </p>
            </div>

            <div className="relative min-h-[160px]">
              <AnimatePresence mode="wait">
                {loginStep === "idle" ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl transition-all shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 group"
                    >
                      <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        className="w-6 h-6"
                        alt="Google"
                      />
                      <span>Sign in with Google</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-50" />
                    </button>

                    {error && (
                      <div className="flex items-start gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                  </motion.div>
                ) : loginStep === "scanning" ? (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6"
                  >
                    <div className="relative">
                      <ScanFace
                        size={60}
                        className="text-indigo-500 dark:text-indigo-400 opacity-80"
                        strokeWidth={1}
                      />
                      <motion.div
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_#818cf8]"
                      />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                      Authenticating...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <CheckCircle2
                      size={50}
                      className="text-green-600 dark:text-green-400"
                    />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Success
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
};
