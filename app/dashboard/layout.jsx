"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/dashboard/Sidebar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Check if user is authenticated
  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      setLoading(false);
    }

    getUser();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/30 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <motion.div 
              className="h-16 w-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">C</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.p 
            className="text-blue-200/70 text-lg"
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Loading dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/30 to-gray-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-violet-600/20 to-indigo-600/20 blur-3xl"
            style={{
              width: `${Math.random() * 30 + 20}rem`,
              height: `${Math.random() * 30 + 20}rem`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              zIndex: -1,
              filter: 'blur(120px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, Math.random() * 50 - 25, 0],
              y: [0, Math.random() * 50 - 25, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="flex">
        <Sidebar />
        
        <motion.div
          className="pl-[280px] lg:pl-[280px] min-h-screen w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <main className="p-8 max-w-7xl mx-auto">
            {children}
          </main>
        </motion.div>
      </div>
    </div>
  );
}
