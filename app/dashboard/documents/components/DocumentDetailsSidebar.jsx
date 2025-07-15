"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFile, FiCalendar, FiUser, FiDownload, FiEdit, FiTrash2, FiCheck, FiAlertCircle, FiInfo, FiEdit2 } from 'react-icons/fi';

export default function DocumentDetailsSidebar({ isOpen, onClose, documentId }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch document details
        const response = await fetch(`/api/documents/${documentId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch document details');
        }
        
        const { data } = await response.json();
        setDocument(data);
        
        // Generate temporary URL for the file
        if (data.file_path) {
          try {
            const storageResponse = await fetch(`/api/documents/${documentId}/file`);
            
            if (storageResponse.ok) {
              const urlData = await storageResponse.json();
              setFileUrl(urlData.url);
              
              // If it's an image, set preview URL
              if (data.file_path.match(/\.(jpeg|jpg|png|webp)$/i)) {
                setPreviewUrl(urlData.url);
              } else if (data.file_path.match(/\.pdf$/i)) {
                // If PDF, we could use a PDF thumbnail or icon
                setPreviewUrl('/pdf-placeholder.png');
              }
            }
          } catch (storageError) {
            console.error('Error getting file URL:', storageError);
          }
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [documentId]);
  
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-gray-900/80 backdrop-blur-md border-l border-white/10 h-full overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-blue-100">Document Details</h3>
              
              <motion.button
                onClick={onClose}
                className="p-2 text-blue-200 hover:text-blue-100 hover:bg-white/5 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX size={20} />
              </motion.button>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col gap-4">
                  <div className="h-5 bg-white/10 rounded animate-pulse w-1/3"></div>
                  <div className="h-20 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-5 bg-white/10 rounded animate-pulse w-1/2"></div>
                  <div className="h-5 bg-white/10 rounded animate-pulse w-2/3"></div>
                  <div className="h-5 bg-white/10 rounded animate-pulse w-1/4"></div>
                  <div className="h-40 bg-white/10 rounded animate-pulse"></div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 flex items-center gap-3">
                  <FiAlertCircle size={18} />
                  <p>{error}</p>
                </div>
              ) : document ? (
                <div className="space-y-8">
                  {/* Document Preview */}
                  <div className="rounded-xl border border-white/10 overflow-hidden bg-gradient-to-br from-violet-900/20 to-indigo-900/20 flex items-center justify-center p-4">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Document Preview" 
                        className="max-h-52 object-contain rounded shadow-lg"
                      />
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-blue-300/70">
                        <FiFile size={48} className="mb-3" />
                        <p>No preview available</p>
                        {fileUrl && (
                          <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-4 px-4 py-2 bg-violet-600/50 hover:bg-violet-600 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <FiDownload size={16} />
                            <span>Download</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Primary Document Info */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                    <h4 className="text-lg font-semibold mb-4 text-blue-100">{document.type}</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-blue-300">Status</p>
                        <span className={`inline-block mt-1 ${getStatusColor(document.status)} text-xs px-2 py-1 rounded-full`}>
                          {document.status || 'Unknown'}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-xs text-blue-300">ID Number</p>
                        <p className="text-blue-100 mt-1">{document.id_number || '—'}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-blue-300">Valid Until</p>
                        <p className="text-blue-100 mt-1 flex items-center gap-1">
                          <FiCalendar size={14} className="text-blue-300" />
                          {document.valid_until ? new Date(document.valid_until).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-blue-300">Upload Date</p>
                        <p className="text-blue-100 mt-1 flex items-center gap-1">
                          <FiCalendar size={14} className="text-blue-300" />
                          {document.created_at ? new Date(document.created_at).toLocaleDateString() : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Client Info */}
                  {document.client && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-blue-200 mb-3">
                        <FiUser size={16} />
                        <span>Client Information</span>
                      </h4>
                      
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-violet-500/20 rounded-full flex items-center justify-center text-violet-300">
                          {document.client.firstname?.[0] || ''}{document.client.lastname?.[0] || ''}
                        </div>
                        <div>
                          <h5 className="text-blue-100 font-medium">
                            {document.client.firstname} {document.client.lastname}
                          </h5>
                          <a 
                            href={`/dashboard/clients?id=${document.client.id}`} 
                            className="text-xs text-violet-400 hover:text-violet-300"
                          >
                            View Client Profile
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {document.notes && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-blue-200 mb-3">
                        <FiInfo size={16} />
                        <span>Notes</span>
                      </h4>
                      
                      <p className="text-blue-100/80 whitespace-pre-line">
                        {document.notes}
                      </p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4">
                    {fileUrl && (
                      <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-blue-100 transition-colors"
                      >
                        <FiDownload size={18} />
                        <span>Download</span>
                      </a>
                    )}
                    
                    <button 
                      onClick={() => {
                        onClose();
                        // You could emit an event or call a function to open the edit modal
                        // For now we'll just navigate to the edit URL
                        window.location.href = `/dashboard/documents/edit/${documentId}`;
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-violet-500/20"
                    >
                      <FiEdit2 size={18} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-blue-200/70">
                  <FiFile size={48} className="mb-3" />
                  <p>Document not found</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
