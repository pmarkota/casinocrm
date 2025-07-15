"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiUpload, FiAlertCircle, FiCheck } from 'react-icons/fi';

export default function DocumentFormModal({ isOpen, onClose, document, clients, onSuccess }) {
  const [formData, setFormData] = useState({
    client_id: '',
    type: '',
    valid_until: '',
    id_number: '',
    status: 'valid',
    notes: '',
    file: null
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadPreview, setUploadPreview] = useState(null);
  const [isEditMode] = useState(!!document);
  
  useEffect(() => {
    // Pre-populate form if editing an existing document
    if (document) {
      setFormData({
        client_id: document.client_id || '',
        type: document.type || '',
        valid_until: document.valid_until ? new Date(document.valid_until).toISOString().split('T')[0] : '',
        id_number: document.id_number || '',
        status: document.status || 'valid',
        notes: document.notes || '',
        file: null // File needs to be uploaded again if changed
      });
    }
  }, [document]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Document type is required';
    }
    
    // File is required only when creating a new document
    if (!isEditMode && !formData.file) {
      newErrors.file = 'Document file is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setFormData({
        ...formData,
        file
      });
      setUploadedFileName(file.name);
      
      // Clear file error if it exists
      if (errors.file) {
        setErrors({
          ...errors,
          file: null
        });
      }
      
      // Show preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadPreview(null);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const apiUrl = isEditMode 
        ? `/api/documents/${document.id}` 
        : '/api/documents';
      
      const method = isEditMode ? 'PATCH' : 'POST';
      
      // Create FormData for file upload
      const submitFormData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'file' && formData.file) {
          submitFormData.append('file', formData.file);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          submitFormData.append(key, formData[key]);
        }
      });
      
      const response = await fetch(apiUrl, {
        method,
        body: submitFormData,
        // Do not set Content-Type header, it will be automatically set with the correct boundary
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save document');
      }
      
      // Success!
      onSuccess();
    } catch (err) {
      console.error('Error saving document:', err);
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800/90 border border-white/10 rounded-xl shadow-xl max-w-2xl w-full backdrop-blur-sm max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h3 className="text-xl font-bold text-blue-100">
                {isEditMode ? 'Edit Document' : 'Add New Document'}
              </h3>
              
              <motion.button
                onClick={onClose}
                className="p-2 text-blue-200 hover:text-blue-100 hover:bg-white/5 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX size={20} />
              </motion.button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Client <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border ${errors.client_id ? 'border-red-400' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-blue-100`}
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.firstname} {client.lastname}
                      </option>
                    ))}
                  </select>
                  {errors.client_id && (
                    <p className="mt-2 text-sm text-red-400">{errors.client_id}</p>
                  )}
                </div>
                
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Document Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border ${errors.type ? 'border-red-400' : 'border-white/10'} rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-blue-100`}
                  >
                    <option value="">Select Type</option>
                    <option value="ID">ID Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver License">Driver License</option>
                    <option value="Proof of Address">Proof of Address</option>
                    <option value="Contract">Contract</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.type && (
                    <p className="mt-2 text-sm text-red-400">{errors.type}</p>
                  )}
                </div>
                
                {/* ID Number */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    ID Number
                  </label>
                  <input
                    type="text"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleInputChange}
                    placeholder="Document ID number"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-blue-100"
                  />
                </div>
                
                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    name="valid_until"
                    value={formData.valid_until}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-blue-100"
                  />
                </div>
                
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-blue-100"
                  >
                    <option value="valid">Valid</option>
                    <option value="expired">Expired</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                
                {/* File Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Document File {!isEditMode && <span className="text-red-400">*</span>}
                  </label>
                  
                  <div className={`border-2 border-dashed ${errors.file ? 'border-red-400' : 'border-white/10'} rounded-lg p-6 text-center`}>
                    <input
                      type="file"
                      id="file"
                      name="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    
                    {uploadPreview ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={uploadPreview} 
                          alt="Preview" 
                          className="max-h-40 mb-3 rounded-lg"
                        />
                        <p className="text-sm text-blue-200">{uploadedFileName}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FiUpload size={24} className="text-blue-300 mb-2" />
                        <p className="text-blue-200 mb-1">
                          {uploadedFileName || (isEditMode ? 'Replace current file (optional)' : 'Drag & drop file or click to browse')}
                        </p>
                        <p className="text-sm text-blue-300/60">
                          Accepts PDF, JPG, PNG, DOC
                        </p>
                      </div>
                    )}
                    
                    <label 
                      htmlFor="file"
                      className="mt-4 inline-block px-4 py-2 bg-violet-600/50 hover:bg-violet-600 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      {uploadedFileName ? 'Change File' : 'Select File'}
                    </label>
                  </div>
                  
                  {errors.file && (
                    <p className="mt-2 text-sm text-red-400">{errors.file}</p>
                  )}
                </div>
                
                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Additional notes about this document"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-blue-100"
                  ></textarea>
                </div>
              </div>
              
              {/* Error Message */}
              {submitError && (
                <div className="mt-6 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 flex items-center gap-3">
                  <FiAlertCircle size={18} />
                  <p>{submitError}</p>
                </div>
              )}
              
              {/* Form Actions */}
              <div className="mt-8 flex justify-end gap-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-blue-200 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-violet-500/20 flex items-center gap-2"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave size={18} />
                      <span>Save Document</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
