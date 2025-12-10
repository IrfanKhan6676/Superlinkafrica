'use client';

import { useState, useEffect } from 'react';

export default function TestConnection() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/test-connection');
        const result = await response.json();
        setTestResult(result);
      } catch (error) {
        setTestResult({
          success: false,
          message: 'Failed to connect to test endpoint',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-900">Testing Supabase connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Supabase Connection Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Test Results</h2>
            <div className="space-y-2">
              <p className="flex items-center">
                <span className="font-medium mr-2">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  testResult?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {testResult?.success ? '✅ Success' : '❌ Failed'}
                </span>
              </p>
              <p><span className="font-medium">Message:</span> {testResult?.message}</p>
              
              {testResult?.error && (
                <div className="mt-2 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Error:</span> {testResult.error}
                  </p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Environment Variables</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-mono bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</span>: {testResult?.supabaseUrl || '❌ Not set'}</p>
                  <p><span className="font-mono bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>: {testResult?.supabaseAnonKey || '❌ Not set'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Troubleshooting</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
              <li>Ensure your Supabase URL and Anon Key are correctly set in your <code className="bg-blue-100 px-1 rounded">.env.local</code> file</li>
              <li>Verify that your Supabase project is running and accessible</li>
              <li>Check your browser's developer console for any network errors</li>
              <li>Make sure CORS is properly configured in your Supabase project settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
