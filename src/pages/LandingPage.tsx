import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bug } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 gradient-glow pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 z-10 px-4 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-20 h-20 rounded-2xl gradient-button shadow-button flex items-center justify-center"
        >
          <Bug className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <div>
          <h1 className="text-5xl md:text-7xl font-bold font-heading text-foreground mb-4">
            Debug<span className="text-primary"> Killer</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto">
            Your smart debugging assistant powered by AI. Paste code, get instant fixes & learn.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/select-language")}
          className="gradient-button shadow-button text-primary-foreground font-semibold text-lg px-10 py-4 rounded-xl transition-all duration-300 hover:shadow-card-hover"
        >
          Start Debugging
        </motion.button>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + i * 0.5,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default LandingPage;
