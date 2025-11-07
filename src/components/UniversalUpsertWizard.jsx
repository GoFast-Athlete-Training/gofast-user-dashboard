// Universal Upsert Wizard
// Modal component for adding athletes to models
// Flow: Select athlete (if not in context) → Select model → Fill additional fields → Upsert
// Uses UPSERT_CONFIG from backend (fetched or hardcoded)

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

const API_BASE = 'https://gofastbackendv2-fall2025.onrender.com/api';

// UPSERT_CONFIG - matches backend config
// TODO: Could fetch from backend endpoint if we create one
const UPSERT_CONFIG = {
  models: {
    runCrewManager: {
      name: 'RunCrew Manager',
      description: 'Assign RunCrew admin or manager role to athlete',
      endpoint: '/api/admin/upsert/runCrewManager',
      prismaModel: 'runCrewManager',
      linkField: 'athleteId',
      uniqueField: 'runCrewId_athleteId',
      requiresAdditionalFields: true,
      additionalFields: [
        {
          name: 'runCrewId',
          label: 'RunCrew',
          type: 'select',
          required: true,
          fetchOptions: '/api/admin/runcrews/hydrate',
          optionValue: 'id',
          optionLabel: 'name'
        },
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          required: true,
          options: [
            { value: 'admin', label: 'Admin (Owner)' },
            { value: 'manager', label: 'Manager' }
          ]
        }
      ],
      icon: '👥'
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

const UniversalUpsertWizard = ({ isOpen, onClose, athlete }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({});
  const [optionsData, setOptionsData] = useState({}); // For select fields that need fetching

  const availableModels = UPSERT_CONFIG.getAvailableModels();

  // Fetch options for select fields when model is selected
  // Try localStorage first (hydrated data), then API fallback
  useEffect(() => {
    if (!selectedModel) return;

    const modelConfig = UPSERT_CONFIG.getModelConfig(selectedModel);
    if (!modelConfig || !modelConfig.additionalFields) return;

    modelConfig.additionalFields
      .filter(field => field.type === 'select' && field.fetchOptions)
      .forEach(async (field) => {
        // Try localStorage first (hydrated data)
        try {
          // For RunCrews, check localStorage
          if (field.name === 'runCrewId') {
            // Try multiple localStorage keys
            const runCrewsFromStorage = 
              JSON.parse(localStorage.getItem('runCrewsData') || 'null') ||
              JSON.parse(localStorage.getItem('runCrews') || 'null') ||
              (() => {
                // Try to get from admin hydrate data
                const adminData = localStorage.getItem('adminData');
                if (adminData) {
                  const parsed = JSON.parse(adminData);
                  return parsed.runCrews || null;
                }
                return null;
              })();

            if (runCrewsFromStorage && Array.isArray(runCrewsFromStorage)) {
              console.log('✅ Using RunCrews from localStorage:', runCrewsFromStorage.length);
              setOptionsData(prev => ({
                ...prev,
                [field.name]: runCrewsFromStorage
              }));
              return; // Don't fetch from API if we have localStorage data
            }
          }

          // Fallback: Fetch from API
          console.log(`🔄 Fetching ${field.name} from API...`);
          const response = await fetch(`${API_BASE}${field.fetchOptions}`);
          if (response.ok) {
            const data = await response.json();
            // Handle different response formats
            const items = data.data || data.runCrews || data || [];
            console.log(`✅ Fetched ${field.name} from API:`, items.length);
            setOptionsData(prev => ({
              ...prev,
              [field.name]: items
            }));
          }
        } catch (err) {
          console.error(`Error fetching options for ${field.name}:`, err);
        }
      });
  }, [selectedModel]);

  const handleUpsert = async () => {
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }

    const modelConfig = UPSERT_CONFIG.getModelConfig(selectedModel);
    
    // Validate required fields
    if (modelConfig.requiresAdditionalFields && modelConfig.additionalFields) {
      for (const field of modelConfig.additionalFields) {
        if (field.required && !formData[field.name]) {
          setError(`Please provide ${field.label || field.name}`);
          return;
        }
      }
    }

    // Validate athleteId
    const athleteId = athlete?.athleteId || athlete?.id;
    if (!athleteId) {
      setError('Athlete ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Build request body
      const requestBody = {
        model: selectedModel,
        athleteId: athleteId,
        ...formData
      };
      
      const response = await fetch(`${API_BASE}/admin/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || `HTTP ${response.status}`);
      }

      console.log('✅ Upsert successful:', result);
      
      setSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
        // Optionally refresh
        if (window.location) {
          window.location.reload();
        }
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
    setFormData({});
    setOptionsData({});
    setError(null);
    setSuccess(false);
    onClose();
  };

  const selectedModelConfig = selectedModel 
    ? UPSERT_CONFIG.getModelConfig(selectedModel)
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-[500px] w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add to Model</h2>
              <p className="text-sm text-gray-600 mt-1">
                Assign athlete to a model (athlete-first architecture)
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
            {/* Athlete Context */}
            {athlete && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-1">Athlete:</p>
                <p className="font-semibold text-blue-900">
                  {athlete.firstName && athlete.lastName
                    ? `${athlete.firstName} ${athlete.lastName}`
                    : athlete.email || athlete.athleteId || 'No Name Set'}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  ID: {athlete.athleteId || athlete.id}
                </p>
              </div>
            )}

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Model <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setFormData({}); // Reset form when model changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={loading || success}
              >
                <option value="">-- Select model --</option>
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
                </div>
              )}
            </div>

            {/* Additional Fields */}
            {selectedModelConfig && selectedModelConfig.requiresAdditionalFields && selectedModelConfig.additionalFields && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-700 mb-3">Required Information:</p>
                
                {selectedModelConfig.additionalFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={loading || success || (field.fetchOptions && !optionsData[field.name])}
                      >
                        <option value="">-- Select {field.label} --</option>
                        {field.options ? (
                          // Static options
                          field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))
                        ) : field.fetchOptions && optionsData[field.name] ? (
                          // Fetched options
                          optionsData[field.name].map((item) => (
                            <option key={item[field.optionValue || 'id']} value={item[field.optionValue || 'id']}>
                              {item[field.optionLabel || 'name']}
                            </option>
                          ))
                        ) : null}
                      </select>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder={field.placeholder || `Enter ${field.label}`}
                        disabled={loading || success}
                      />
                    )}
                  </div>
                ))}
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
                    {selectedModelConfig?.name} assigned successfully. Go back to home to hydrate.
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
              {loading ? 'Creating...' : success ? 'Done!' : 'Upsert'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalUpsertWizard;

