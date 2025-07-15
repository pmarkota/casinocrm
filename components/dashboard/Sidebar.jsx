"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiFolder, 
  FiPhone, 
  FiBriefcase, 
  FiDollarSign, 
  FiUploadCloud, 
  FiHome,
  FiMenu,
  FiX,
  FiChevronRight,
  FiSettings,
  FiLogOut
} from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const modules = [
  { name: 'Dashboard', icon: <FiHome />, href: '/dashboard' },
  { name: 'Client Management', icon: <FiUsers />, href: '/dashboard/clients' },
  { name: 'Document Tracking', icon: <FiFolder />, href: '/dashboard/documents' },
  { name: 'Contact History', icon: <FiPhone />, href: '/dashboard/contacts' },
  { name: 'Casino Integration', icon: <FiBriefcase />, href: '/dashboard/casinos' },
  { name: 'Banking Integration', icon: <FiDollarSign />, href: '/dashboard/banking' },
  { name: 'Import Tool', icon: <FiUploadCloud />, href: '/dashboard/import' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' },
  };

  const mobileSidebarVariants = {
    open: { 
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      x: '-100%',
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    expanded: { opacity: 1 },
    collapsed: { opacity: 0 }
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-6 left-6 z-30 text-white bg-violet-600/90 p-2 rounded-lg shadow-lg backdrop-blur-sm"
          onClick={() => setMobileOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMenu size={24} />
        </motion.button>
      )}

      {/* Mobile Overlay */}
      {isMobile && (
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed ${isMobile ? 'left-0 top-0 bottom-0 z-40' : 'left-0 top-0 bottom-0'} h-full bg-white/5 backdrop-blur-md border-r border-white/10 shadow-[0_0_25px_rgba(124,58,237,0.15)] flex flex-col`}
        initial={isMobile ? "closed" : "expanded"}
        animate={isMobile ? (mobileOpen ? "open" : "closed") : (collapsed ? "collapsed" : "expanded")}
        variants={isMobile ? mobileSidebarVariants : sidebarVariants}
      >
        {/* Header */}
        <div className="relative h-20 flex items-center px-6 border-b border-white/10">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="relative w-10 h-10 mr-3">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-lg"
                  animate={{
                    boxShadow: ['0 0 0 rgba(139, 92, 246, 0.3)', '0 0 20px rgba(139, 92, 246, 0.6)', '0 0 0 rgba(139, 92, 246, 0.3)']
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3
                  }}
                />
                <div className="absolute inset-0.5 bg-gray-900 rounded-md flex items-center justify-center text-white font-bold text-lg">
                  C
                </div>
              </div>
              
              {(!collapsed || isMobile) && (
                <motion.h1
                  className="text-lg font-semibold bg-gradient-to-r from-violet-300 to-indigo-300 text-transparent bg-clip-text"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: 0.3 }}
                >
                  Casino CRM
                </motion.h1>
              )}
            </div>
          </motion.div>

          {/* Close button for mobile */}
          {isMobile && (
            <button 
              className="absolute right-4 text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <FiX size={24} />
            </button>
          )}
          
          {/* Collapse toggle for desktop */}
          {!isMobile && (
            <button 
              className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-1 rounded-full border border-white/10 shadow-lg"
              onClick={() => setCollapsed(!collapsed)}
            >
              <motion.div
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiChevronRight size={14} />
              </motion.div>
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {modules.map((module) => {
              const isActive = pathname === module.href || pathname.startsWith(`${module.href}/`);
              return (
                <Link key={module.href} href={module.href}>
                  <motion.div
                    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isActive 
                      ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-white' 
                      : 'text-blue-100/70 hover:bg-white/5'
                    }`}
                    whileHover={{ 
                      x: 4,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`${isActive ? 'text-violet-300' : 'text-blue-300/70 group-hover:text-blue-200'}`}>
                      {module.icon}
                    </div>
                    
                    {(!collapsed || isMobile) && (
                      <motion.span 
                        className="ml-3 flex-1"
                        variants={itemVariants}
                        transition={{ duration: 0.2 }}
                        initial={false}
                      >
                        {module.name}
                      </motion.span>
                    )}
                    
                    {isActive && (
                      <motion.div
                        className="w-1 h-full absolute left-0 bg-violet-500"
                        layoutId="activeIndicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="space-y-2">
            <Link href="/dashboard/settings">
              <motion.div
                className="flex items-center px-3 py-3 text-blue-100/70 rounded-xl hover:bg-white/5 transition-all duration-200"
                whileHover={{ 
                  x: 4,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <FiSettings className="text-blue-300/70" />
                {(!collapsed || isMobile) && (
                  <motion.span 
                    className="ml-3"
                    variants={itemVariants}
                    transition={{ duration: 0.2 }}
                    initial={false}
                  >
                    Settings
                  </motion.span>
                )}
              </motion.div>
            </Link>

            <motion.div
              className="flex items-center px-3 py-3 text-blue-100/70 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer"
              whileHover={{ 
                x: 4,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
            >
              <FiLogOut className="text-blue-300/70" />
              {(!collapsed || isMobile) && (
                <motion.span 
                  className="ml-3"
                  variants={itemVariants}
                  transition={{ duration: 0.2 }}
                  initial={false}
                >
                  Sign Out
                </motion.span>
              )}
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
