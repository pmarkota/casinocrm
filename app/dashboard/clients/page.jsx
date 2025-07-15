"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiSearch, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import ClientFormModal from './components/ClientFormModal';
import ClientDetailsSidebar from './components/ClientDetailsSidebar';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [limit] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [agents, setAgents] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [sortBy, setSortBy] = useState('lastname');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const router = useRouter();
  
  // Fetch clients with current filters and pagination
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder,
        ...(search && { search })
      });
      
      const response = await fetch(`/api/clients?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clients');
      }
      
      const data = await response.json();
      setClients(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder]);
  
  // Fetch agents for client assignment
  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch agents');
      }
      
      const data = await response.json();
      setAgents(data.data);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  }, []);
  
  // Handle client deletion
  const handleDeleteClient = async (id) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete client');
      }
      
      // Remove from state and refresh list
      setClients(clients.filter(client => client.id !== id));
      setDeleteConfirmation(null);
      // Fetch updated list if we might have changed pages
      if (clients.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchClients();
      }
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Load clients on mount and when dependencies change
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  // Load agents on mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);
  
  // Handle search input with debounce
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page on sort change
  };
  
  return (
    <>
      <div className="mb-12">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-3 bg-violet-500/20 rounded-lg text-violet-300">
            <FiUsers size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-200 to-indigo-200 text-transparent bg-clip-text">
            Client Management
          </h1>
        </motion.div>
        
        <motion.p 
          className="text-blue-200/70 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Manage your client database
        </motion.p>
      </div>
      
      {/* Actions bar */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-300/50">
            <FiSearch />
          </div>
          <input 
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-blue-100 placeholder-blue-300/50"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Refresh button */}
          <motion.button
            onClick={() => fetchClients()}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-blue-300 transition-all border border-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw size={18} />
          </motion.button>
          
          {/* Add client button */}
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-violet-500/20"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus size={18} />
            <span>Add Client</span>
          </motion.button>
        </div>
      </motion.div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="flex items-center gap-2">
              <FiX size={18} />
              <span>{error}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Client table */}
      <motion.div
        className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-lg shadow-violet-500/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/10 bg-white/5">
                <th 
                  className="px-6 py-4 text-sm font-semibold text-blue-200 cursor-pointer"
                  onClick={() => handleSort('firstname')}
                >
                  <div className="flex items-center gap-2">
                    First Name
                    {sortBy === 'firstname' && (
                      <span className="text-violet-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-sm font-semibold text-blue-200 cursor-pointer"
                  onClick={() => handleSort('lastname')}
                >
                  <div className="flex items-center gap-2">
                    Last Name
                    {sortBy === 'lastname' && (
                      <span className="text-violet-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-sm font-semibold text-blue-200 cursor-pointer"
                  onClick={() => handleSort('email_address')}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {sortBy === 'email_address' && (
                      <span className="text-violet-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-blue-200">
                  Agent
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-blue-200 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody>
              {loading && clients.length === 0 ? (
                [...Array(3)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-white/5">
                    <td className="px-6 py-4">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-28"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-48"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-16 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-blue-200/70">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-3 bg-violet-500/20 rounded-full">
                        <FiUsers size={24} className="text-violet-300" />
                      </div>
                      <p>No clients found</p>
                      {search && (
                        <button 
                          onClick={() => setSearch('')}
                          className="text-violet-400 hover:text-violet-300 text-sm"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map(client => (
                  <motion.tr 
                    key={client.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setShowDetailsSidebar(true);
                    }}
                  >
                    <td className="px-6 py-4 text-blue-100">
                      {client.firstname || '—'}
                    </td>
                    <td className="px-6 py-4 text-blue-100">
                      {client.lastname || '—'}
                    </td>
                    <td className="px-6 py-4 text-blue-100">
                      {client.email_address || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {client.agent ? (
                        <span className="bg-violet-500/20 text-violet-300 text-xs px-2 py-1 rounded-full">
                          {client.agent.firstname} {client.agent.lastname}
                        </span>
                      ) : (
                        <span className="bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded-full">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentClient(client);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-blue-300 hover:text-blue-100 hover:bg-white/10 rounded-md transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiEdit2 size={16} />
                        </motion.button>
                        <motion.button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmation(client.id);
                          }}
                          className="p-1.5 text-red-300 hover:text-red-100 hover:bg-red-500/10 rounded-md transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiTrash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
            <div className="text-sm text-blue-200/70">
              Showing page {page} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className={`p-2 rounded-md ${page <= 1 ? 'text-blue-300/30 cursor-not-allowed' : 'text-blue-300 hover:bg-white/10'}`}
                whileHover={page > 1 ? { scale: 1.05 } : {}}
                whileTap={page > 1 ? { scale: 0.95 } : {}}
              >
                <FiChevronLeft size={18} />
              </motion.button>
              
              <motion.button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className={`p-2 rounded-md ${page >= totalPages ? 'text-blue-300/30 cursor-not-allowed' : 'text-blue-300 hover:bg-white/10'}`}
                whileHover={page < totalPages ? { scale: 1.05 } : {}}
                whileTap={page < totalPages ? { scale: 0.95 } : {}}
              >
                <FiChevronRight size={18} />
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Client Modals */}
      <AnimatePresence>
        {showAddModal && (
          <ClientFormModal 
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchClients();
            }}
            agents={agents}
          />
        )}
        
        {showEditModal && currentClient && (
          <ClientFormModal
            onClose={() => {
              setShowEditModal(false);
              setCurrentClient(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setCurrentClient(null);
              fetchClients();
            }}
            client={currentClient}
            agents={agents}
          />
        )}
        
        {/* Delete confirmation modal */}
        {deleteConfirmation && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirmation(null)}
          >
            <motion.div 
              className="bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 rounded-lg shadow-lg p-6 m-4 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="flex items-center justify-center bg-red-500/20 w-16 h-16 mx-auto rounded-full mb-4">
                  <FiTrash2 size={32} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Confirm Deletion</h3>
                <p className="text-blue-200/70 mb-4">
                  Are you sure you want to delete this client? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-center space-x-3">
                <motion.button
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-blue-200"
                  onClick={() => setDeleteConfirmation(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white flex items-center gap-2"
                  onClick={() => handleDeleteClient(deleteConfirmation)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiTrash2 size={16} />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Client Details Sidebar */}
        <ClientDetailsSidebar
          isOpen={showDetailsSidebar}
          onClose={() => {
            setShowDetailsSidebar(false);
            setTimeout(() => setSelectedClientId(null), 300); // Clear ID after animation
          }}
          clientId={selectedClientId}
        />
      </AnimatePresence>
    </>
  );
}
