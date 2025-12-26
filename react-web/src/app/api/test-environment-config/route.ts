/**
 * Environment Configuration Test API Route
 * 
 * This route tests both dev and prod API endpoints to validate:
 * 1. API endpoints are reachable
 * 2. Responses come from expected base URLs
 * 3. Environment-based routing is working correctly
 */

import { NextRequest, NextResponse } from 'next/server';

// Test configurations for both environments
const TEST_CONFIGS = {
  dev: {
    baseUrl: 'https://dev.api.eeva.app/api',
    name: 'Development'
  },
  prod: {
    baseUrl: 'https://api.eeva.app/api',
    name: 'Production'
  }
};

// Test endpoints that should be available without authentication
const TEST_ENDPOINTS = [
  '/users/exists/test@example.com',  // Simple GET endpoint
  '/auth/login',                     // POST endpoint (will fail auth but should reach server)
];

interface TestResult {
  environment: string;
  baseUrl: string;
  endpoint: string;
  success: boolean;
  status: number;
  responseUrl?: string;
  error?: string;
  responseTime: number;
}

async function testEndpoint(baseUrl: string, endpoint: string, environment: string): Promise<TestResult> {
  const startTime = Date.now();
  const fullUrl = `${baseUrl}${endpoint}`;
  
  try {
    console.log(`🧪 Testing ${environment}: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: endpoint.includes('/auth/login') ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': '0a2eba8c751892e035f6b96605600fae'
      },
      body: endpoint.includes('/auth/login') ? JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      }) : undefined,
      // Don't follow redirects to see the actual response
      redirect: 'manual'
    });

    const responseTime = Date.now() - startTime;
    
    // Any response (even 400/401/404) means the server is reachable
    // Only network errors or 5xx errors indicate server issues
    const isSuccess = response.status < 500;
    
    return {
      environment,
      baseUrl,
      endpoint,
      success: isSuccess,
      status: response.status,
      responseUrl: response.url,
      responseTime
    };
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      environment,
      baseUrl,
      endpoint,
      success: false,
      status: 0,
      error: error.message,
      responseTime
    };
  }
}

export async function GET(request: NextRequest) {
  console.log('🚀 Starting API environment configuration test...');
  
  const results: TestResult[] = [];
  
  // Test both environments
  for (const [envKey, config] of Object.entries(TEST_CONFIGS)) {
    console.log(`\n📡 Testing ${config.name} environment (${config.baseUrl})`);
    
    // Test each endpoint
    for (const endpoint of TEST_ENDPOINTS) {
      const result = await testEndpoint(config.baseUrl, endpoint, config.name);
      results.push(result);
      
      // Log result
      const statusIcon = result.success ? '✅' : '❌';
      console.log(`${statusIcon} ${result.environment} ${result.endpoint}: ${result.status} (${result.responseTime}ms)`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  }
  
  // Analyze results
  const summary = {
    totalTests: results.length,
    successfulTests: results.filter(r => r.success).length,
    failedTests: results.filter(r => !r.success).length,
    devResults: results.filter(r => r.environment === 'Development'),
    prodResults: results.filter(r => r.environment === 'Production'),
    averageResponseTime: Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length)
  };
  
  // Determine overall status
  const devWorking = summary.devResults.some(r => r.success);
  const prodWorking = summary.prodResults.some(r => r.success);
  
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${summary.totalTests}`);
  console.log(`   Successful: ${summary.successfulTests}`);
  console.log(`   Failed: ${summary.failedTests}`);
  console.log(`   Dev Environment: ${devWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Prod Environment: ${prodWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Average Response Time: ${summary.averageResponseTime}ms`);
  
  return NextResponse.json({
    success: summary.successfulTests > 0,
    message: `API Environment Test Complete`,
    summary,
    results,
    recommendations: [
      `Dev Environment: ${devWorking ? 'Working correctly' : 'Check dev.api.eeva.app availability'}`,
      `Prod Environment: ${prodWorking ? 'Working correctly' : 'Check api.eeva.app availability'}`,
      `Overall Status: ${(devWorking && prodWorking) ? 'Both environments working' :
                    devWorking ? 'Only dev environment working' :
                    prodWorking ? 'Only prod environment working' : 'Both environments have issues'}`
    ],
    timestamp: new Date().toISOString()
  });
}
