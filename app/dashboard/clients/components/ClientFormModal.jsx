"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function ClientFormModal({ 
  onClose, 
  client = null, 
  agents = [],
  onSuccess 
}) {
  const isEditing = !!client;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    prefix: '',
    lastname: '',
    street: '',
    city: '',
    country: '',
    zipcode: '',
    phone_number: '',
    email_address: '',
    email_internal_address: '',
    email_internal_address_password: '',
    contact_number_whatsapp: '',
    socials: '',
    location_sms_receive: '',
    agent_id: '',
    start_date: '',
    end_date: '',
    employed: false,
    job_title: '',
    average_salary: '',
    forward_email_address_clicker: '',
    client_responsive: true,
  });

  // Populate form when editing
  useEffect(() => {
    if (client) {
      setFormData({
        firstname: client.firstname || '',
        prefix: client.prefix || '',
        lastname: client.lastname || '',
        street: client.street || '',
        city: client.city || '',
        country: client.country || '',
        zipcode: client.zipcode || '',
        phone_number: client.phone_number || '',
        email_address: client.email_address || '',
        email_internal_address: client.email_internal_address || '',
        email_internal_address_password: client.email_internal_address_password || '',
        contact_number_whatsapp: client.contact_number_whatsapp || '',
        socials: client.socials || '',
        location_sms_receive: client.location_sms_receive || '',
        agent_id: client.agent_id || '',
        start_date: client.start_date ? new Date(client.start_date).toISOString().split('T')[0] : '',
        end_date: client.end_date ? new Date(client.end_date).toISOString().split('T')[0] : '',
        employed: client.employed ?? false,
        job_title: client.job_title || '',
        average_salary: client.average_salary || '',
        forward_email_address_clicker: client.forward_email_address_clicker || '',
        client_responsive: client.client_responsive ?? true,
      });
    }
  }, [client]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing 
        ? `/api/clients/${client.id}`
        : '/api/clients';
      
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await response.json();
      
      onSuccess(data.data);
      onClose();
    } catch (err) {
      console.error('Error submitting client:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Escape key to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    // Component is only mounted when it should be shown
    window.addEventListener('keydown', handleEscKey);

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [loading, onClose]);

  // Modal is conditionally rendered by parent component

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80">
        <motion.div 
          className="bg-gray-800 border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl shadow-violet-500/10 overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-800/30 to-indigo-800/30">
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Client' : 'Add New Client'}
            </h2>
            <button 
              onClick={onClose} 
              disabled={loading}
              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 flex items-center gap-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FiAlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Section: Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-violet-300 mb-3 pb-2 border-b border-white/10">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Prefix */}
                <div>
                  <label htmlFor="prefix" className="block mb-2 text-sm font-medium text-blue-200">
                    Prefix
                  </label>
                  <input
                    type="text"
                    id="prefix"
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Mr/Mrs/Ms"
                  />
                </div>
                
                {/* First name */}
                <div>
                  <label htmlFor="firstname" className="block mb-2 text-sm font-medium text-blue-200">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                
                {/* Last name */}
                <div>
                  <label htmlFor="lastname" className="block mb-2 text-sm font-medium text-blue-200">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Section: Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-violet-300 mb-3 pb-2 border-b border-white/10">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Email */}
                <div>
                  <label htmlFor="email_address" className="block mb-2 text-sm font-medium text-blue-200">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email_address"
                    name="email_address"
                    value={formData.email_address}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="client@example.com"
                  />
                </div>
                
                {/* Phone */}
                <div>
                  <label htmlFor="phone_number" className="block mb-2 text-sm font-medium text-blue-200">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* WhatsApp */}
                <div>
                  <label htmlFor="contact_number_whatsapp" className="block mb-2 text-sm font-medium text-blue-200">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    id="contact_number_whatsapp"
                    name="contact_number_whatsapp"
                    value={formData.contact_number_whatsapp}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Enter WhatsApp number"
                  />
                </div>
                
                {/* Social Media */}
                <div>
                  <label htmlFor="socials" className="block mb-2 text-sm font-medium text-blue-200">
                    Social Media
                  </label>
                  <input
                    type="text"
                    id="socials"
                    name="socials"
                    value={formData.socials}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Social media handles"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Internal Email */}
                <div>
                  <label htmlFor="email_internal_address" className="block mb-2 text-sm font-medium text-blue-200">
                    Internal Email
                  </label>
                  <input
                    type="email"
                    id="email_internal_address"
                    name="email_internal_address"
                    value={formData.email_internal_address}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="internal@example.com"
                  />
                </div>
                
                {/* Internal Email Password */}
                <div>
                  <label htmlFor="email_internal_address_password" className="block mb-2 text-sm font-medium text-blue-200">
                    Internal Email Password
                  </label>
                  <input
                    type="text"
                    id="email_internal_address_password"
                    name="email_internal_address_password"
                    value={formData.email_internal_address_password}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>
            
            {/* Section: Address */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-violet-300 mb-3 pb-2 border-b border-white/10">Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Street */}
                <div>
                  <label htmlFor="street" className="block mb-2 text-sm font-medium text-blue-200">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Enter street address"
                  />
                </div>
                
                {/* City */}
                <div>
                  <label htmlFor="city" className="block mb-2 text-sm font-medium text-blue-200">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Enter city"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Zipcode */}
                <div>
                  <label htmlFor="zipcode" className="block mb-2 text-sm font-medium text-blue-200">
                    Zip/Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Enter zip/postal code"
                  />
                </div>
                
                {/* Country */}
                <div>
                  <label htmlFor="country" className="block mb-2 text-sm font-medium text-blue-200">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>
            
            {/* Section: Employment Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-violet-300 mb-3 pb-2 border-b border-white/10">Employment Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {/* Employed */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="employed"
                    name="employed"
                    checked={formData.employed}
                    onChange={(e) => setFormData({...formData, employed: e.target.checked})}
                    className="w-5 h-5 bg-white/5 border-white/10 rounded focus:ring-violet-500/50"
                  />
                  <label htmlFor="employed" className="ml-2 text-sm font-medium text-blue-200">
                    Currently Employed
                  </label>
                </div>
                
                {/* Job Title */}
                <div>
                  <label htmlFor="job_title" className="block mb-2 text-sm font-medium text-blue-200">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="job_title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Enter job title"
                  />
                </div>
                
                {/* Average Salary */}
                <div>
                  <label htmlFor="average_salary" className="block mb-2 text-sm font-medium text-blue-200">
                    Average Salary
                  </label>
                  <input
                    type="number"
                    id="average_salary"
                    name="average_salary"
                    value={formData.average_salary}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Enter average salary"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label htmlFor="start_date" className="block mb-2 text-sm font-medium text-blue-200">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                  />
                </div>
                
                {/* End Date */}
                <div>
                  <label htmlFor="end_date" className="block mb-2 text-sm font-medium text-blue-200">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            {/* Section: System Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-violet-300 mb-3 pb-2 border-b border-white/10">System Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Agent assignment */}
                <div>
                  <label htmlFor="agent_id" className="block mb-2 text-sm font-medium text-blue-200">
                    Assigned Agent
                  </label>
                  <select
                    id="agent_id"
                    name="agent_id"
                    value={formData.agent_id}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                  >
                    <option value="">No Agent (Unassigned)</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.firstname} {agent.lastname}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Location for SMS */}
                <div>
                  <label htmlFor="location_sms_receive" className="block mb-2 text-sm font-medium text-blue-200">
                    SMS Receiving Location
                  </label>
                  <input
                    type="text"
                    id="location_sms_receive"
                    name="location_sms_receive"
                    value={formData.location_sms_receive}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="Location for SMS reception"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Forward Email */}
                <div>
                  <label htmlFor="forward_email_address_clicker" className="block mb-2 text-sm font-medium text-blue-200">
                    Forward Email (Clicker)
                  </label>
                  <input
                    type="email"
                    id="forward_email_address_clicker"
                    name="forward_email_address_clicker"
                    value={formData.forward_email_address_clicker}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-blue-100 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
                    placeholder="forward@example.com"
                  />
                </div>
                
                {/* Client Responsive */}
                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="client_responsive"
                    name="client_responsive"
                    checked={formData.client_responsive}
                    onChange={(e) => setFormData({...formData, client_responsive: e.target.checked})}
                    className="w-5 h-5 bg-white/5 border-white/10 rounded focus:ring-violet-500/50"
                  />
                  <label htmlFor="client_responsive" className="ml-2 text-sm font-medium text-blue-200">
                    Client is Responsive
                  </label>
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-2">
              <motion.button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg shadow-lg shadow-violet-500/20"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiCheck size={18} />
                )}
                <span>{isEditing ? 'Update Client' : 'Create Client'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
