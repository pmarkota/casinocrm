"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";

// Separate component for search params usage
function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Account created successfully! Please sign in.");
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
          }}
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(124,58,237,0.15)] overflow-hidden">
          <div className="px-8 pt-10 pb-8 text-center relative">
            {/* Decorative glow elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-gradient-to-b from-purple-500/20 to-transparent blur-2xl opacity-50 rounded-full"></div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
            >
              <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-indigo-400">
                Casino CRM
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-violet-500 to-indigo-500 mx-auto rounded-full mb-6"></div>
            </motion.div>
            <motion.h2 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-blue-50 text-2xl font-semibold mb-4"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-blue-200/70 text-sm mb-6"
            >
              Sign in to continue to your account
            </motion.p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-8 mb-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-200 px-4 py-3 rounded-lg flex items-start"
              >
                <FiAlertCircle className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
            
            {successMessage && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-8 mb-4 bg-green-500/10 backdrop-blur-sm border border-green-500/30 text-green-200 px-4 py-3 rounded-lg flex items-start"
              >
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form 
            onSubmit={handleLogin} 
            className="px-8 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-6">
              <label className="text-blue-200 text-sm font-medium mb-2 flex items-center" htmlFor="email">
                <FiMail className="mr-2 text-blue-300/70" />
                <span>Email Address</span>
              </label>
              <div className="relative group">
                <motion.input
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(124, 58, 237, 0.3)" }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full bg-white/5 text-white rounded-xl border border-white/10 focus:border-violet-500 focus:outline-none px-5 py-3.5 text-base transition duration-200 placeholder-blue-200/50 backdrop-blur-sm"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 blur-sm"></div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="text-blue-200 text-sm font-medium mb-2 flex items-center" htmlFor="password">
                <FiLock className="mr-2 text-blue-300/70" />
                <span>Password</span>
              </label>
              <div className="relative group">
                <motion.input
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(124, 58, 237, 0.3)" }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full bg-white/5 text-white rounded-xl border border-white/10 focus:border-violet-500 focus:outline-none px-5 py-3.5 text-base transition duration-200 placeholder-blue-200/50 backdrop-blur-sm"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 blur-sm"></div>
              </div>
            </div>
            
            <div className="mb-6 flex justify-end">
              <motion.a 
                href="#" 
                className="text-sm text-blue-300 hover:text-violet-300 transition duration-200"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.6 }}
              >
                Forgot password?
              </motion.a>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(124, 58, 237, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 400, damping: 15 }}
              type="submit"
              disabled={loading}
              className={`relative w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg focus:outline-none transition-all duration-300 overflow-hidden ${
                loading ? "opacity-70" : ""
              }`}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70"></div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
            
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Link 
                href="/register" 
                className="text-sm text-blue-300 hover:text-violet-300 transition duration-200 inline-flex items-center"
              >
                <span>Dont have an account?</span>
                <span className="ml-1 font-medium text-violet-400 hover:text-violet-300 transition-colors">Sign up</span>
              </Link>
            </motion.div>
          </motion.form>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i}
                className="w-2 h-2 rounded-full bg-blue-400/30"
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1, 0.5] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2, 
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          <p className="text-blue-200/40 text-sm font-light">
            &copy; {new Date().getFullYear()} Casino CRM. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 p-4">
      <div className="text-white">Loading...</div>
    </div>}>
      <LoginContent />
    </Suspense>
  );
}
