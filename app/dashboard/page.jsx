"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  FiUsers, 
  FiFolder, 
  FiPhone, 
  FiBriefcase, 
  FiDollarSign, 
  FiUploadCloud,
  FiTrendingUp,
  FiClock,
  FiCalendar,
  FiActivity
} from 'react-icons/fi';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const modules = [
  { name: 'Clients', icon: <FiUsers size={24} />, count: '---', href: '/dashboard/clients', color: 'from-violet-500 to-indigo-500' },
  { name: 'Documents', icon: <FiFolder size={24} />, count: '---', href: '/dashboard/documents', color: 'from-blue-500 to-indigo-500' },
  { name: 'Contacts', icon: <FiPhone size={24} />, count: '---', href: '/dashboard/contacts', color: 'from-indigo-500 to-purple-500' },
  { name: 'Casinos', icon: <FiBriefcase size={24} />, count: '---', href: '/dashboard/casinos', color: 'from-violet-500 to-fuchsia-500' },
  { name: 'Banking', icon: <FiDollarSign size={24} />, count: '---', href: '/dashboard/banking', color: 'from-blue-500 to-violet-500' },
  { name: 'Import', icon: <FiUploadCloud size={24} />, count: '---', href: '/dashboard/import', color: 'from-indigo-500 to-blue-500' },
];

const statCards = [
  { title: 'Active Clients', value: '0', icon: <FiUsers size={20} />, change: '+0%', up: true },
  { title: 'Documents Pending', value: '0', icon: <FiFolder size={20} />, change: '0%', up: false },
  { title: 'Recent Contacts', value: '0', icon: <FiPhone size={20} />, change: '+0%', up: true },
  { title: 'Active Casinos', value: '0', icon: <FiBriefcase size={20} />, change: '+0%', up: true },
];

const recentActivity = [
  { id: 1, action: 'Client created', target: 'John Doe', time: '2 hours ago', icon: <FiUsers size={16} /> },
  { id: 2, action: 'Document uploaded', target: 'Passport - Jane Smith', time: '3 hours ago', icon: <FiFolder size={16} /> },
  { id: 3, action: 'Contact logged', target: 'Call with Michael Brown', time: '5 hours ago', icon: <FiPhone size={16} /> },
  { id: 4, action: 'Casino added', target: 'Golden Palace', time: '1 day ago', icon: <FiBriefcase size={16} /> },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStats = async () => {
      // In a real application, fetch actual stats from Supabase here
      // For now, we'll simulate a loading state and then set dummy data
      
      setTimeout(() => {
        setStats({
          clientsCount: 12,
          documentsCount: 47,
          contactsCount: 35,
          casinosCount: 8,
          bankingCount: 15,
          importsCount: 6
        });
        setLoading(false);
      }, 1500);
    };
    
    fetchStats();
  }, []);

  return (
    <>
      <div className="mb-12">
        <motion.h1 
          className="text-3xl font-bold bg-gradient-to-r from-violet-200 to-indigo-200 text-transparent bg-clip-text mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to Casino CRM
        </motion.h1>
        <motion.p 
          className="text-blue-200/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Here's an overview of your CRM system
        </motion.p>
      </div>

      {/* Stats cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 shadow-lg relative overflow-hidden"
            whileHover={{ 
              y: -5,
              boxShadow: "0 8px 30px rgba(124, 58, 237, 0.15)",
              transition: { duration: 0.3 }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-bl-full" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200/70 text-sm">{stat.title}</p>
                <div className="mt-1 flex items-baseline">
                  <p className="text-3xl font-semibold text-white">
                    {loading ? (
                      <motion.div 
                        className="w-12 h-8 bg-white/10 rounded animate-pulse"
                        animate={{
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`flex items-center mt-1 text-xs ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                  <span>{stat.change}</span>
                  <motion.span 
                    className="ml-1"
                    animate={{ 
                      rotate: stat.up ? [0, 10, 0] : [0, -10, 0] 
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {stat.up ? '↑' : '↓'}
                  </motion.span>
                  <span className="ml-1 text-blue-200/50">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-full text-blue-300/80">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick access modules */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-xl font-medium text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {modules.map((module, index) => (
            <motion.a
              key={module.name}
              href={module.href}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center text-center h-32 relative overflow-hidden group"
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <motion.div 
                className={`p-3 rounded-full bg-gradient-to-br ${module.color} bg-opacity-10 text-white mb-2`}
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {module.icon}
              </motion.div>
              <p className="text-blue-100 font-medium">{module.name}</p>
              <p className="text-blue-300/60 text-sm mt-1">
                {loading ? (
                  <motion.div 
                    className="w-6 h-4 bg-white/10 rounded mx-auto"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ) : (
                  module.count
                )}
              </p>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Recent activity and calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <motion.div 
          className="lg:col-span-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-white flex items-center">
              <FiActivity className="mr-2 text-blue-300/70" />
              Recent Activity
            </h2>
            <button className="text-blue-300/70 hover:text-blue-200 text-sm transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div 
                key={activity.id}
                className="flex items-start p-3 hover:bg-white/5 rounded-lg transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
              >
                <div className="p-2 bg-white/10 rounded-full mr-3 text-blue-300/80">
                  {activity.icon}
                </div>
                <div>
                  <p className="text-white text-sm">{activity.action}: <span className="text-blue-300">{activity.target}</span></p>
                  <p className="text-blue-200/50 text-xs mt-1 flex items-center">
                    <FiClock className="mr-1" size={12} />
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          className="lg:col-span-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex items-center mb-4">
            <FiCalendar className="mr-2 text-blue-300/70" />
            <h2 className="text-xl font-medium text-white">Upcoming</h2>
          </div>
          
          <div className="space-y-3">
            <motion.div 
              className="p-3 bg-white/5 border border-white/10 rounded-lg"
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-center">
                <p className="text-blue-100 text-sm font-medium">Client Meeting</p>
                <p className="text-blue-200/50 text-xs">Today, 3:00 PM</p>
              </div>
              <p className="text-blue-200/70 text-xs mt-1">John Doe - Account review</p>
            </motion.div>
            
            <motion.div 
              className="p-3 bg-white/5 border border-white/10 rounded-lg"
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-center">
                <p className="text-blue-100 text-sm font-medium">Document Deadline</p>
                <p className="text-blue-200/50 text-xs">Tomorrow, 12:00 PM</p>
              </div>
              <p className="text-blue-200/70 text-xs mt-1">Tax forms submission deadline</p>
            </motion.div>
            
            <motion.div 
              className="p-3 bg-white/5 border border-white/10 rounded-lg"
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-center">
                <p className="text-blue-100 text-sm font-medium">Weekly Report</p>
                <p className="text-blue-200/50 text-xs">Friday, 9:00 AM</p>
              </div>
              <p className="text-blue-200/70 text-xs mt-1">Prepare client acquisition report</p>
            </motion.div>
          </div>
          
          <motion.button 
            className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-blue-200 rounded-lg text-sm transition-colors"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            + Add New Event
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
