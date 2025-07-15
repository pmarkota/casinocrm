"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiDollarSign, FiCheckCircle, FiUserX } from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';
import { FaRegBuilding } from 'react-icons/fa';

/**
 * Client Details Sidebar Component
 * Shows detailed information about a selected client
 */
export default function ClientDetailsSidebar({ isOpen, onClose, clientId }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agent, setAgent] = useState(null);

  // Fetch client data when sidebar opens
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch client details');
        }
        
        const data = await response.json();
        setClient(data.data); // Access the 'data' property in the API response
        
        // Fetch agent details if the client has an agent
        if (data.data.agent_id) {
          const agentResponse = await fetch(`/api/agents/${data.data.agent_id}`);
          if (agentResponse.ok) {
            const agentData = await agentResponse.json();
            setAgent(agentData.data); // Access the 'data' property in the agent API response
          }
        } else {
          setAgent(null);
        }
      } catch (err) {
        console.error('Error fetching client details:', err);
        setError('Could not load client details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen && clientId) {
      fetchClientDetails();
    }
  }, [isOpen, clientId]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-96 md:w-[450px] bg-gradient-to-br from-slate-900/95 to-indigo-950/95 backdrop-blur-md shadow-xl border-l border-white/10 z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-indigo-950/50 backdrop-blur-md z-10">
              <h2 className="text-lg font-semibold text-violet-100">Client Details</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-blue-300 hover:bg-white/10 transition-colors"
                aria-label="Close details"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 text-red-200">
                  {error}
                </div>
              ) : client ? (
                <>
                  {/* Client Name and Basic Info */}
                  <div className="mb-8 text-center">
                    <div className="h-20 w-20 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                      <FiUser size={40} className="text-violet-300" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {client.prefix && <span className="mr-1">{client.prefix}</span>}
                      {client.firstname} {client.lastname}
                    </h3>
                    {client.client_responsive !== undefined && (
                      <div className="flex items-center justify-center mt-2">
                        {client.client_responsive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-200 border border-green-500/30">
                            <FiCheckCircle className="mr-1" /> Responsive
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-200 border border-red-500/30">
                            <FiUserX className="mr-1" /> Non-responsive
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Contact Information */}
                  <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
                    <h4 className="text-md font-medium text-violet-300 mb-4">Contact Information</h4>
                    
                    <div className="space-y-3">
                      {client.email_address && (
                        <div className="flex items-start">
                          <FiMail className="text-blue-400 mt-1 mr-3" />
                          <div>
                            <p className="text-blue-100">{client.email_address}</p>
                            <p className="text-xs text-blue-300/70">Email</p>
                          </div>
                        </div>
                      )}
                      
                      {client.phone_number && (
                        <div className="flex items-start">
                          <FiPhone className="text-blue-400 mt-1 mr-3" />
                          <div>
                            <p className="text-blue-100">{client.phone_number}</p>
                            <p className="text-xs text-blue-300/70">Phone</p>
                          </div>
                        </div>
                      )}
                      
                      {client.contact_number_whatsapp && (
                        <div className="flex items-start">
                          <BsWhatsapp className="text-green-400 mt-1 mr-3" />
                          <div>
                            <p className="text-blue-100">{client.contact_number_whatsapp}</p>
                            <p className="text-xs text-blue-300/70">WhatsApp</p>
                          </div>
                        </div>
                      )}
                      
                      {client.email_internal_address && (
                        <div className="flex items-start">
                          <FiMail className="text-indigo-400 mt-1 mr-3" />
                          <div>
                            <p className="text-blue-100">{client.email_internal_address}</p>
                            <p className="text-xs text-blue-300/70">Internal Email</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Address Information */}
                  {(client.street || client.city || client.country || client.zipcode) && (
                    <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
                      <h4 className="text-md font-medium text-violet-300 mb-4">Address</h4>
                      <div className="flex items-start">
                        <FiMapPin className="text-blue-400 mt-1 mr-3" />
                        <div>
                          {client.street && <p className="text-blue-100">{client.street}</p>}
                          {client.city && client.zipcode ? (
                            <p className="text-blue-100">{client.city}, {client.zipcode}</p>
                          ) : (
                            <>
                              {client.city && <p className="text-blue-100">{client.city}</p>}
                              {client.zipcode && <p className="text-blue-100">{client.zipcode}</p>}
                            </>
                          )}
                          {client.country && <p className="text-blue-100">{client.country}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Employment Information */}
                  {(client.employed !== undefined || client.job_title || client.average_salary || client.start_date || client.end_date) && (
                    <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
                      <h4 className="text-md font-medium text-violet-300 mb-4">Employment</h4>
                      
                      <div className="space-y-3">
                        {client.employed !== undefined && (
                          <div className="flex items-center">
                            <FaRegBuilding className="text-blue-400 mr-3" />
                            <p className="text-blue-100">
                              {client.employed ? 'Currently Employed' : 'Not Employed'}
                            </p>
                          </div>
                        )}
                        
                        {client.job_title && (
                          <div className="flex items-center">
                            <div className="w-5 mr-3" />
                            <div>
                              <p className="text-blue-100">{client.job_title}</p>
                              <p className="text-xs text-blue-300/70">Job Title</p>
                            </div>
                          </div>
                        )}
                        
                        {client.average_salary && (
                          <div className="flex items-start">
                            <FiDollarSign className="text-green-400 mt-1 mr-3" />
                            <div>
                              <p className="text-blue-100">{typeof client.average_salary === 'number' ? client.average_salary.toLocaleString() : client.average_salary}</p>
                              <p className="text-xs text-blue-300/70">Average Salary</p>
                            </div>
                          </div>
                        )}
                        
                        {(client.start_date || client.end_date) && (
                          <div className="flex items-start">
                            <FiCalendar className="text-blue-400 mt-1 mr-3" />
                            <div>
                              {client.start_date && (
                                <div>
                                  <p className="text-blue-100">{formatDate(client.start_date)}</p>
                                  <p className="text-xs text-blue-300/70">Start Date</p>
                                </div>
                              )}
                              
                              {client.end_date && (
                                <div className="mt-2">
                                  <p className="text-blue-100">{formatDate(client.end_date)}</p>
                                  <p className="text-xs text-blue-300/70">End Date</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Assigned Agent */}
                  {(client.agent_id || agent) && (
                    <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
                      <h4 className="text-md font-medium text-violet-300 mb-4">Assigned Agent</h4>
                      
                      {agent ? (
                        <div className="flex items-start">
                          <FiUser className="text-blue-400 mt-1 mr-3" />
                          <div>
                            <p className="text-blue-100">{agent.firstname} {agent.lastname}</p>
                            <p className="text-xs text-blue-300/70">Agent</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-blue-200/70">No agent assigned</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-blue-300/50 py-10">
                  <p>Select a client to view details</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
