/**
 * Production Configuration Test Route
 * 
 * This route temporarily forces production mode to test prod API configuration
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🚀 Starting production configuration test...');
  
  // Temporarily override environment to test production configuration
  const originalEnv = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'production';
  
  try {
    // Re-import the API config to get the production URL
    delete require.cache[require.resolve('config/api')];
    const { API_BASE_URL, getApiBaseUrl, PROTECTION_BYPASS_HEADER } = require('config/api');
    
    console.log('🧪 Testing with forced production environment...');
    console.log(`Production API URL: ${API_BASE_URL}`);
    
    // Test production API endpoint
    const testResults = [];
    
    // Test 1: Configuration Check
    const configTest = {
      testName: 'Production Configuration',
      success: API_BASE_URL === 'https://api.eeva.app/api',
      expectedUrl: 'https://api.eeva.app/api',
      actualUrl: API_BASE_URL,
      environment: 'production (forced)'
    };
    testResults.push(configTest);
    
    // Test 2: API Connectivity (try a simple health check first)
    let connectivityTest;
    try {
      console.log('🌐 Testing connectivity to production API...');

      // Try a simple GET to the base API URL first
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER
        }
      });

      const statusCategory = Math.floor(response.status / 100);
      const isServerReachable = statusCategory !== 5; // Not a 5xx error

      connectivityTest = {
        testName: 'Production API Connectivity',
        success: isServerReachable,
        status: response.status,
        statusMeaning: statusCategory === 2 ? 'Success' :
                      statusCategory === 4 ? 'Client error (server reachable)' :
                      statusCategory === 5 ? 'Server error' : 'Other',
        url: API_BASE_URL,
        note: isServerReachable ? 'Server is online and responding' : 'Server has issues'
      };
    } catch (error: any) {
      connectivityTest = {
        testName: 'Production API Connectivity',
        success: false,
        error: error.message,
        url: API_BASE_URL,
        note: 'Cannot reach server - network/DNS issue'
      };
    }
    testResults.push(connectivityTest);
    
    // Test 3: Auth Endpoint
    let authTest;
    try {
      console.log('🔐 Testing production auth endpoint...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        })
      });
      
      authTest = {
        testName: 'Production Auth Endpoint',
        success: response.status < 500, // Any response < 500 means endpoint is reachable
        status: response.status,
        url: `${API_BASE_URL}/auth/login`,
        note: 'Expected to fail auth but should reach server'
      };
    } catch (error: any) {
      authTest = {
        testName: 'Production Auth Endpoint',
        success: false,
        error: error.message,
        url: `${API_BASE_URL}/auth/login`
      };
    }
    testResults.push(authTest);
    
    // Analyze results
    const successfulTests = testResults.filter(t => t.success).length;
    const totalTests = testResults.length;
    const allPassed = successfulTests === totalTests;
    
    const recommendations = [];
    if (allPassed) {
      recommendations.push('🎉 Production API configuration is working correctly!');
      recommendations.push('✅ Production API URL is correct');
      recommendations.push('✅ Production API endpoints are reachable');
      recommendations.push('✅ Ready for production deployment');
    } else {
      recommendations.push(`⚠️ ${totalTests - successfulTests}/${totalTests} production tests failed`);
      
      if (!configTest.success) {
        recommendations.push('❌ Production API URL configuration is incorrect');
      }
      
      if (!connectivityTest.success) {
        recommendations.push('❌ Cannot reach production API - check api.eeva.app status');
      }
      
      if (!authTest.success) {
        recommendations.push('❌ Production auth endpoint unreachable');
      }
      
      if (successfulTests > 0) {
        recommendations.push(`✅ ${successfulTests} test(s) passed - partial functionality working`);
      }
    }
    
    console.log('\n📊 Production Test Summary:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Successful: ${successfulTests}`);
    console.log(`   Failed: ${totalTests - successfulTests}`);
    console.log(`   Overall Status: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
    
    return NextResponse.json({
      success: allPassed,
      message: 'Production Configuration Test Complete',
      environment: 'production (forced for testing)',
      apiBaseUrl: API_BASE_URL,
      summary: {
        totalTests,
        successfulTests,
        failedTests: totalTests - successfulTests,
        allPassed
      },
      testResults,
      recommendations,
      timestamp: new Date().toISOString()
    });
    
  } finally {
    // Restore original environment
    if (originalEnv) {
      process.env.VERCEL_ENV = originalEnv;
    } else {
      delete process.env.VERCEL_ENV;
    }
    
    // Clear require cache to reset API config
    delete require.cache[require.resolve('config/api')];
  }
}
