import React, { useState, useEffect } from 'react'
import { databaseAdapter } from '../services/databaseAdapter.js'
import { FEATURES } from '../config/features.js'

/**
 * Database Migration UI Component
 * Development tool for managing database migration and monitoring health
 */
export default function DatabaseMigrationUI({ onClose }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [migrationResult, setMigrationResult] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      setLoading(true)
      const healthStatus = await databaseAdapter.getHealthStatus()
      setStatus(healthStatus)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const runMigration = async () => {
    try {
      setLoading(true)
      setError(null)
      setMigrationResult(null)
      
      const result = await databaseAdapter.runMigration()
      setMigrationResult(result)
      
      // Refresh status after migration
      await loadStatus()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const validateMigration = async () => {
    try {
      setLoading(true)
      setError(null)
      setValidationResult(null)
      
      const result = await databaseAdapter.validateMigration()
      setValidationResult(result)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshStatus = async () => {
    await loadStatus()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'unhealthy': return 'text-red-600'
      case 'error': return 'text-red-600'
      case 'ready': return 'text-blue-600'
      case 'database_unavailable': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅'
      case 'unhealthy': return '❌'
      case 'error': return '❌'
      case 'ready': return '🟢'
      case 'database_unavailable': return '⚠️'
      default: return '⚪'
    }
  }

  if (!FEATURES.SHOW_MIGRATION_UI) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Database Migration Console</h2>
              <p className="text-gray-600">Development tool for managing database migration</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="text-red-400 mr-3">❌</div>
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            {loading && !status ? (
              <div className="text-gray-500">Loading status...</div>
            ) : status ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* localStorage Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">localStorage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className={status.localStorage.available ? 'text-green-600' : 'text-red-600'}>
                        {status.localStorage.available ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Campaigns:</span>
                      <span className="font-mono">{status.localStorage.campaigns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products:</span>
                      <span className="font-mono">{status.localStorage.products}</span>
                    </div>
                  </div>
                </div>

                {/* Database Status */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Database</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Enabled:</span>
                      <span className={status.database.enabled ? 'text-green-600' : 'text-gray-600'}>
                        {status.database.enabled ? '✅ Yes' : '⚪ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className={status.database.available ? 'text-green-600' : 'text-red-600'}>
                        {status.database.available ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    {status.database.health && (
                      <div className="flex justify-between">
                        <span>Health:</span>
                        <span className={getStatusColor(status.database.health.status)}>
                          {getStatusIcon(status.database.health.status)} {status.database.health.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Current Mode */}
            {status && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-indigo-400 mr-3 text-lg">🔄</div>
                  <div>
                    <h4 className="font-medium text-indigo-900">Current Mode</h4>
                    <p className="text-indigo-700 text-sm">
                      Operating in <strong>{status.currentMode}</strong> mode
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Migration Section */}
          {status?.database.enabled && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Migration Tools</h3>
              
              {/* Migration Status */}
              {status.database.migration && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Migration Status</h4>
                  <div className="text-sm text-yellow-800">
                    <div className="flex justify-between mb-1">
                      <span>Status:</span>
                      <span className={getStatusColor(status.database.migration.status)}>
                        {getStatusIcon(status.database.migration.status)} {status.database.migration.status}
                      </span>
                    </div>
                    {status.database.migration.localData && (
                      <>
                        <div className="flex justify-between mb-1">
                          <span>Local Products:</span>
                          <span>{status.database.migration.localData.products}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Local Campaigns:</span>
                          <span>{status.database.migration.localData.campaigns}</span>
                        </div>
                      </>
                    )}
                    {status.database.migration.databaseData && (
                      <>
                        <div className="flex justify-between mb-1">
                          <span>DB Products:</span>
                          <span>{status.database.migration.databaseData.products}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>DB Campaigns:</span>
                          <span>{status.database.migration.databaseData.campaigns}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Migration Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={runMigration}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Migrating...' : 'Run Migration'}
                </button>
                <button
                  onClick={validateMigration}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Validating...' : 'Validate Migration'}
                </button>
                <button
                  onClick={refreshStatus}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Refreshing...' : 'Refresh Status'}
                </button>
              </div>
            </div>
          )}

          {/* Migration Results */}
          {migrationResult && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Migration Results</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Products</h4>
                      <div>Success: {migrationResult.products?.success || 0}</div>
                      <div>Failed: {migrationResult.products?.failed || 0}</div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Campaigns</h4>
                      <div>Success: {migrationResult.campaigns?.success || 0}</div>
                      <div>Failed: {migrationResult.campaigns?.failed || 0}</div>
                    </div>
                  </div>
                  {(migrationResult.products?.errors?.length > 0 || migrationResult.campaigns?.errors?.length > 0) && (
                    <div className="mt-3">
                      <h4 className="font-medium mb-2">Errors</h4>
                      <div className="max-h-32 overflow-y-auto">
                        {migrationResult.products?.errors?.map((error, i) => (
                          <div key={i} className="text-xs text-red-600">Product: {error}</div>
                        ))}
                        {migrationResult.campaigns?.errors?.map((error, i) => (
                          <div key={i} className="text-xs text-red-600">Campaign: {error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Validation Results */}
          {validationResult && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
              <div className={`border rounded-lg p-4 ${validationResult.overall?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Products</h4>
                      <div>localStorage: {validationResult.products?.localStorage || 0}</div>
                      <div>Database: {validationResult.products?.database || 0}</div>
                      <div className={validationResult.products?.match ? 'text-green-600' : 'text-red-600'}>
                        Match: {validationResult.products?.match ? '✅' : '❌'}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Campaigns</h4>
                      <div>localStorage: {validationResult.campaigns?.localStorage || 0}</div>
                      <div>Database: {validationResult.campaigns?.database || 0}</div>
                      <div className={validationResult.campaigns?.match ? 'text-green-600' : 'text-red-600'}>
                        Match: {validationResult.campaigns?.match ? '✅' : '❌'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className={validationResult.overall?.success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      Overall: {validationResult.overall?.success ? '✅ Success' : '❌ Failed'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Environment Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Environment Configuration</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Feature Flags</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>USE_DATABASE:</span>
                      <span className={FEATURES.USE_DATABASE ? 'text-green-600' : 'text-gray-600'}>
                        {FEATURES.USE_DATABASE ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>MIGRATE_EXISTING_DATA:</span>
                      <span className={FEATURES.MIGRATE_EXISTING_DATA ? 'text-green-600' : 'text-gray-600'}>
                        {FEATURES.MIGRATE_EXISTING_DATA ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>SHOW_MIGRATION_UI:</span>
                      <span className={FEATURES.SHOW_MIGRATION_UI ? 'text-green-600' : 'text-gray-600'}>
                        {FEATURES.SHOW_MIGRATION_UI ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Database Config</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Supabase URL:</span>
                      <span className={import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-gray-600'}>
                        {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Supabase Key:</span>
                      <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-gray-600'}>
                        {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 