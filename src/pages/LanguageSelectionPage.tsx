import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const languages = [
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    description: "Great for beginners. Clean syntax, powerful libraries.",
  },
  {
    id: "java",
    name: "Java",
    icon: "☕",
    description: "Industry standard. Strong typing, object-oriented.",
  },
  {
    id: "c",
    name: "C",
    icon: "⚙️",
    description: "Low-level power. Memory control, system programming.",
  },
];

const LanguageSelectionPage = () => {
  const navigate = useNavigate();

  const handleSelect = (langId: string) => {
    localStorage.setItem("debugai-language", langId);
    navigate("/debug");
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors z-10 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-2">
          Choose Your Language
        </h2>
        <p className="text-muted-foreground text-lg">
          Select the language you want to debug
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 w-full max-w-3xl">
        {languages.map((lang, i) => (
          <motion.button
            key={lang.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(lang.id)}
            className="gradient-card shadow-card hover:shadow-card-hover border border-border rounded-2xl p-8 flex flex-col items-center gap-4 transition-all duration-300 cursor-pointer group"
          >
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
              {lang.icon}
            </span>
            <h3 className="text-xl font-semibold font-heading text-foreground">
              {lang.name}
            </h3>
            <p className="text-muted-foreground text-sm text-center">
              {lang.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelectionPage;
