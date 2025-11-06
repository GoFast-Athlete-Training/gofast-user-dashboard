// Admin Upsert Wizard
// Modal component for adding athletes to new models
// Flow: Select athlete → Select model → Confirm → Upsert

import { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
// Model Configuration
// SEPARATION OF CONCERNS:
// - Athletes = Separate app/system (fitness users, different Firebase, different login)
// - Founder/Company = Separate app/system (company tooling, different Firebase, different login)
// - Shared backend for now, but completely separate identities
// - Upsert is for creating company-side identities (NOT linked to athletes)
const MODEL_CONFIG = {
  models: {
    founder: {
      name: 'Founder',
      description: 'Create a standalone Founder identity - separate from athletes',
      endpoint: '/api/admin/upsert/founder',
      linkField: null, // NO athleteId link - completely separate
      relationship: 'standalone',
      requiresAdditionalFields: true, // Need email/name since no athlete link
      icon: '💼',
      notes: 'Creates standalone Founder record. Founder app is separate from athlete app - different Firebase, different login.',
      identityType: 'company',
      requiredFields: ['email', 'name'] // Need email and name for standalone creation
    },
    company: {
      name: 'Company',
      description: 'Create a Company entity - separate from athletes',
      endpoint: '/api/admin/upsert/company',
      linkField: null, // NO athleteId link - completely separate
      relationship: 'standalone',
      requiresAdditionalFields: true, // Need name since no athlete link
      icon: '🏢',
      notes: 'Creates standalone Company record. Company app is separate from athlete app.',
      identityType: 'company',
      requiredFields: ['name'] // Need company name
    }
  },
  getAvailableModels() {
    return Object.entries(this.models).map(([key, config]) => ({
      value: key,
      label: config.name,
      description: config.description,
      icon: config.icon
    }));
  },
  getModelConfig(modelKey) {
    return this.models[modelKey] || null;
  }
};

const AdminUpsertWizard = ({ isOpen, onClose, athlete }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ email: '', name: '' });

  const availableModels = MODEL_CONFIG.getAvailableModels();

  const handleUpsert = async () => {
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }

    const modelConfig = MODEL_CONFIG.getModelConfig(selectedModel);
    
    // Validate required fields for standalone models
    if (modelConfig.requiresAdditionalFields) {
      const requiredFields = modelConfig.requiredFields || [];
      for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === '') {
          setError(`Please provide ${field}`);
          return;
        }
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Build request body based on model type
      let requestBody = {};
      
      if (modelConfig.linkField && athlete) {
        // Legacy: Link to athlete (but we're moving away from this)
        requestBody[modelConfig.linkField] = athlete.athleteId || athlete.id;
      } else {
        // Standalone: Use form data
        requestBody = { ...formData };
        
        // If athlete context exists, include it for reference (but not as link)
        if (athlete) {
          requestBody.sourceAthleteId = athlete.athleteId || athlete.id; // For tracking, not linking
        }
      }
      
      const response = await fetch(
        `https://gofastbackendv2-fall2025.onrender.com${modelConfig.endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // Admin upsert route - no Firebase token needed for admin
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Upsert successful:', result);
      
      setSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
        // Optionally refresh the athlete list
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error('❌ Upsert error:', err);
      setError(err.message || 'Failed to create record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedModel('');
    setFormData({ email: '', name: '' });
    setError(null);
    setSuccess(false);
    onClose();
  };

  const selectedModelConfig = selectedModel 
    ? MODEL_CONFIG.getModelConfig(selectedModel)
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-[500px] w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Company Identity</h2>
              <p className="text-sm text-gray-600 mt-1">
                Create a company-side identity for this user (Founder, Company). Note: You're either an Athlete OR a Company person.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        <div className="space-y-4 py-4">
          {/* Context Info - Optional if athlete provided */}
          {athlete && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-1">Creating from athlete context (reference only):</p>
              <p className="font-semibold text-blue-900">
                {athlete.firstName && athlete.lastName
                  ? `${athlete.firstName} ${athlete.lastName}`
                  : athlete.email || 'No Name Set'}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Note: Company/Founder identities are separate from athletes
              </p>
            </div>
          )}
          
          {!athlete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Creating standalone company identity (not linked to athlete)
              </p>
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which company identity do you want to create?
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setFormData({ email: '', name: '' }); // Reset form when model changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading || success}
            >
              <option value="">-- Select identity type --</option>
              {availableModels.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.icon} {model.label}
                </option>
              ))}
            </select>
            
            {selectedModelConfig && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-gray-700">
                  {selectedModelConfig.description}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Note:</strong> This creates a standalone identity - separate from athletes (different Firebase, different login).
                </p>
              </div>
            )}
          </div>

          {/* Additional Fields for Standalone Models */}
          {selectedModelConfig && selectedModelConfig.requiresAdditionalFields && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-700 mb-3">Required Information:</p>
              
              {selectedModelConfig.requiredFields?.includes('email') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="user@example.com"
                    disabled={loading || success}
                  />
                </div>
              )}
              
              {selectedModelConfig.requiredFields?.includes('name') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedModel === 'company' ? 'Company Name' : 'Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder={selectedModel === 'company' ? 'Company Name' : 'Full Name'}
                    disabled={loading || success}
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Success!</p>
                <p className="text-sm text-green-700">
                  {selectedModelConfig?.name} record created and linked to athlete.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpsert}
            disabled={!selectedModel || loading || success}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Creating...' : success ? 'Done!' : 'Create Record'}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpsertWizard;

