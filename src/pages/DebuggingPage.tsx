import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, RotateCcw, Copy, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DebugResult {
  error: string;
  explanation: string;
  reason: string;
  learning_tip: string;
  suggested_fix: string;
}

const cardLabels = [
  { key: "error", label: "🐛 Error", color: "from-red-500/20 to-red-600/10" },
  { key: "explanation", label: "💡 Explanation", color: "from-primary/20 to-accent/10" },
  { key: "reason", label: "🔍 Reason", color: "from-amber-500/20 to-amber-600/10" },
  { key: "learning_tip", label: "📚 Learning Tip", color: "from-emerald-500/20 to-emerald-600/10" },
  { key: "suggested_fix", label: "✅ Corrected Code", color: "from-cyan-500/20 to-cyan-600/10" },
] as const;

const FlashCard = ({
  label,
  content,
  color,
  isCode,
}: {
  label: string;
  content: string;
  color: string;
  isCode?: boolean;
}) => {
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="perspective-1000 cursor-pointer"
      onClick={() => setFlipped(!flipped)}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="relative w-full min-h-[160px]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 backface-hidden rounded-xl border border-border bg-gradient-to-br ${color} p-6 flex items-center justify-center`}
        >
          <h3 className="text-lg font-semibold font-heading text-foreground text-center">
            {label}
          </h3>
          <p className="absolute bottom-3 text-xs text-muted-foreground">
            Click to reveal
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl border border-border gradient-card p-5 overflow-auto"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
            {isCode && (
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
          {isCode ? (
            <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
              {content}
            </pre>
          ) : (
            <p className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const DebuggingPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<DebugResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lang = localStorage.getItem("debugai-language");
    if (lang) setLanguage(lang);
    else navigate("/select-language");
  }, [navigate]);

  const handleDebug = async () => {
    if (!code.trim()) {
      toast.error("Please paste some code first!");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("debug-code", {
        body: { code, language },
      });

      if (error) throw error;
      setResult(data as DebugResult);
    } catch (err: any) {
      console.error("Debug error:", err);
      toast.error(err.message || "Failed to analyze code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setResult(null);
  };

  const langLabel = language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <div className="min-h-screen gradient-hero relative">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 md:p-6 border-b border-border/50">
        <button
          onClick={() => navigate("/select-language")}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Change Language
        </button>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            {langLabel}
          </span>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Code Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-muted-foreground">
            Paste your {langLabel} code below
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`// Paste your ${langLabel} code here...`}
            className="w-full min-h-[160px] max-h-[400px] rounded-xl gradient-card border border-border p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 resize-y focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            rows={10}
          />
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDebug}
              disabled={loading}
              className="gradient-button shadow-button text-primary-foreground font-semibold px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {loading ? "Analyzing..." : "Run / Debug"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClear}
              className="bg-secondary text-secondary-foreground font-medium px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-secondary/80 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> New Entry
            </motion.button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold font-heading text-foreground">
                Analysis Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cardLabels.map(({ key, label, color }) => (
                  <FlashCard
                    key={key}
                    label={label}
                    content={result[key as keyof DebugResult]}
                    color={color}
                    isCode={key === "suggested_fix"}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Analyzing your code with AI...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DebuggingPage;
