'use client';

import React, { useState } from 'react';

interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
  [key: string]: any;
}

export default function TestApiConfigPage() {
  const [results, setResults] = useState<{ [key: string]: TestResult }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const tests = [
    {
      id: 'current-config',
      name: 'Current Configuration',
      endpoint: '/api/test-api-config',
      description: 'Check current API configuration and environment detection'
    },
    {
      id: 'local-config',
      name: 'Local API Routes',
      endpoint: '/api/test-local-config',
      description: 'Test local API route functionality and routing'
    },
    {
      id: 'remote-environments',
      name: 'Remote Environments',
      endpoint: '/api/test-environment-config',
      description: 'Test connectivity to both dev and prod API endpoints'
    },
    {
      id: 'prod-config',
      name: 'Production Configuration',
      endpoint: '/api/test-prod-config',
      description: 'Test production API configuration (temporarily forces prod mode)'
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Test',
      endpoint: '/api/test-all-environments',
      description: 'Run all tests and get a complete report'
    }
  ];

  const runTest = async (test: typeof tests[0]) => {
    setLoading(prev => ({ ...prev, [test.id]: true }));
    
    try {
      const response = await fetch(test.endpoint);
      const result = await response.json();
      
      setResults(prev => ({
        ...prev,
        [test.id]: result
      }));
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        [test.id]: {
          success: false,
          message: `Test failed: ${error.message}`,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [test.id]: false }));
    }
  };

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (result?: TestResult) => {
    if (!result) return '⏳';
    return result.success ? '✅' : '❌';
  };

  const getStatusColor = (result?: TestResult) => {
    if (!result) return 'text-gray-500';
    return result.success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            API Configuration Test Suite
          </h1>
          <p className="text-gray-600 mb-8">
            Test the environment-based API configuration to ensure dev and prod endpoints are working correctly.
          </p>

          <div className="mb-6">
            <button
              onClick={runAllTests}
              disabled={Object.values(loading).some(Boolean)}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {Object.values(loading).some(Boolean) ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>

          <div className="space-y-6">
            {tests.map((test) => (
              <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">{getStatusIcon(results[test.id])}</span>
                      {test.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{test.description}</p>
                  </div>
                  <button
                    onClick={() => runTest(test)}
                    disabled={loading[test.id]}
                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"
                  >
                    {loading[test.id] ? 'Testing...' : 'Run Test'}
                  </button>
                </div>

                {results[test.id] && (
                  <div className="mt-4 p-4 bg-gray-50 rounded border">
                    <div className={`font-medium ${getStatusColor(results[test.id])}`}>
                      {results[test.id].message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(results[test.id].timestamp).toLocaleString()}
                    </div>
                    
                    {results[test.id].recommendations && Array.isArray(results[test.id].recommendations) && results[test.id].recommendations.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-medium text-gray-700 mb-2">Recommendations:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {results[test.id].recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                        View detailed results
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                        {JSON.stringify(results[test.id], null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What These Tests Do:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Current Configuration:</strong> Shows which API endpoint is currently being used</li>
              <li>• <strong>Local API Routes:</strong> Tests that your local API routes are working correctly</li>
              <li>• <strong>Remote Environments:</strong> Tests connectivity to both dev.api.eeva.app and api.eeva.app</li>
              <li>• <strong>Comprehensive Test:</strong> Runs all tests and provides an overall health report</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
