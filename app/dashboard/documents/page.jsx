"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFile, FiSearch, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiFilter, FiRefreshCw, FiDownload, FiEye } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import DocumentFormModal from './components/DocumentFormModal';
import DocumentDetailsSidebar from './components/DocumentDetailsSidebar';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [limit] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clients, setClients] = useState([]);
  const [clientFilter, setClientFilter] = useState('');
  const router = useRouter();
  
  // Fetch documents with current filters and pagination
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(clientFilter && { clientId: clientFilter }),
      });
      
      const response = await fetch(`/api/documents?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, typeFilter, statusFilter, clientFilter]);
  
  // Fetch clients for document assignment
  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch('/api/clients');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clients');
      }
      
      const data = await response.json();
      setClients(data.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  }, []);
  
  // Handle document deletion
  const handleDeleteDocument = async (id) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }
      
      // Remove from state and refresh list
      setDocuments(documents.filter(document => document.id !== id));
      setDeleteConfirmation(null);
      // Fetch updated list if we might have changed pages
      if (documents.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle document download
  const handleDocumentDownload = async (document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download document');
      }
      
      const data = await response.json();
      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error downloading document:', err);
      setError(err.message);
    }
  };
  
  // Load documents on mount and when dependencies change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Load clients on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
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
      setSortOrder('desc');
    }
    setPage(1); // Reset to first page on sort change
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'valid':
        return 'bg-green-500/20 text-green-300';
      case 'expired':
        return 'bg-red-500/20 text-red-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-blue-500/20 text-blue-300';
    }
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
            <FiFile size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-200 to-indigo-200 text-transparent bg-clip-text">
            Document Tracking
          </h1>
        </motion.div>
        
        <motion.p 
          className="text-blue-200/70 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Manage and track client documents
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
            placeholder="Search documents..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-blue-100 placeholder-blue-300/50"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Filter dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-blue-100 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="valid">Valid</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-300/50">
              <FiFilter size={18} />
            </div>
          </div>
          
          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-blue-100 appearance-none"
            >
              <option value="">All Types</option>
              <option value="ID">ID</option>
              <option value="Passport">Passport</option>
              <option value="Driver License">Driver License</option>
              <option value="Proof of Address">Proof of Address</option>
              <option value="Contract">Contract</option>
              <option value="Other">Other</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-300/50">
              <FiFile size={18} />
            </div>
          </div>
          
          {/* Refresh button */}
          <motion.button
            onClick={() => fetchDocuments()}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-blue-300 transition-all border border-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw size={18} />
          </motion.button>
          
          {/* Add document button */}
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
            <span>Add Document</span>
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
      
      {/* Document table */}
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
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    {sortBy === 'type' && (
                      <span className="text-violet-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-blue-200">
                  Client
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-blue-200">
                  ID Number
                </th>
                <th 
                  className="px-6 py-4 text-sm font-semibold text-blue-200 cursor-pointer"
                  onClick={() => handleSort('valid_until')}
                >
                  <div className="flex items-center gap-2">
                    Valid Until
                    {sortBy === 'valid_until' && (
                      <span className="text-violet-400">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-blue-200">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-blue-200 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody>
              {loading && documents.length === 0 ? (
                [...Array(3)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-white/5">
                    <td className="px-6 py-4">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-28"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-16"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-6 bg-white/10 rounded animate-pulse w-16 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-blue-200/70">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-3 bg-violet-500/20 rounded-full">
                        <FiFile size={24} className="text-violet-300" />
                      </div>
                      <p>No documents found</p>
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
                documents.map(document => (
                  <motion.tr 
                    key={document.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    onClick={() => {
                      setSelectedDocumentId(document.id);
                      setShowDetailsSidebar(true);
                    }}
                  >
                    <td className="px-6 py-4 text-blue-100">
                      {document.type || '—'}
                    </td>
                    <td className="px-6 py-4 text-blue-100">
                      {document.client ? `${document.client.firstname} ${document.client.lastname}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-blue-100">
                      {document.id_number || '—'}
                    </td>
                    <td className="px-6 py-4 text-blue-100">
                      {document.valid_until ? new Date(document.valid_until).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {document.status ? (
                        <span className={`${getStatusColor(document.status)} text-xs px-2 py-1 rounded-full`}>
                          {document.status}
                        </span>
                      ) : (
                        <span className="bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded-full">
                          Unknown
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex space-x-2">
                        {/* View details button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingDocument(document.id);
                          }}
                          className="p-1 text-blue-300 hover:text-blue-100 hover:bg-white/10 rounded-full transition-colors"
                          title="View Document Details"
                        >
                          <FiEye size={16} />
                        </button>
                        
                        {/* Edit button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentDocument(document);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-blue-300 hover:text-blue-100 hover:bg-white/10 rounded-full transition-colors"
                          title="Edit Document"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmation(document.id);
                          }}
                          className="p-1 text-blue-300 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors"
                          title="Delete Document"
                        >
                          <FiTrash2 size={16} />
                        </button>
                        
                        {/* Download button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentDownload(document);
                          }}
                          className="p-1 text-blue-300 hover:text-green-400 hover:bg-white/10 rounded-full transition-colors"
                          title="Download Document"
                        >
                          <FiDownload size={16} />
                        </button>
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
                disabled={page === 1}
                className={`p-2 rounded-lg border ${page === 1 ? 'border-white/5 text-white/20' : 'border-white/10 text-blue-200 hover:bg-white/10'}`}
                whileHover={page !== 1 ? { scale: 1.05 } : {}}
                whileTap={page !== 1 ? { scale: 0.95 } : {}}
              >
                <FiChevronLeft size={18} />
              </motion.button>
              
              <motion.button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`p-2 rounded-lg border ${page === totalPages ? 'border-white/5 text-white/20' : 'border-white/10 text-blue-200 hover:bg-white/10'}`}
                whileHover={page !== totalPages ? { scale: 1.05 } : {}}
                whileTap={page !== totalPages ? { scale: 0.95 } : {}}
              >
                <FiChevronRight size={18} />
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Add/Edit Document Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <DocumentFormModal
            isOpen={showAddModal || showEditModal}
            onClose={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setCurrentDocument(null);
            }}
            document={currentDocument}
            clients={clients}
            onSuccess={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setCurrentDocument(null);
              fetchDocuments();
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Document Details Sidebar */}
      <AnimatePresence>
        {showDetailsSidebar && selectedDocumentId && (
          <DocumentDetailsSidebar
            isOpen={showDetailsSidebar}
            onClose={() => {
              setShowDetailsSidebar(false);
              setSelectedDocumentId(null);
            }}
            documentId={selectedDocumentId}
          />
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800/90 border border-white/10 rounded-xl p-6 max-w-md w-full shadow-xl backdrop-blur-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-blue-100 mb-4">Confirm Deletion</h3>
              <p className="text-blue-200/70 mb-6">
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <motion.button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-blue-200 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={() => handleDeleteDocument(deleteConfirmation)}
                  className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiTrash2 size={16} />
                  <span>Delete</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document details sidebar */}
      <DocumentDetailsSidebar
        isOpen={viewingDocument !== null}
        onClose={() => setViewingDocument(null)}
        documentId={viewingDocument}
      />
    </>
  );
}
