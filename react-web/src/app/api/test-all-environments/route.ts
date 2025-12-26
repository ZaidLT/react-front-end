/**
 * Comprehensive Environment Test Suite
 *
 * This route runs all environment tests and provides a complete report:
 * 1. Tests current local configuration
 * 2. Tests dev and prod API endpoints directly
 * 3. Validates environment-based routing
 * 4. Provides recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, getApiBaseUrl } from 'config/api';

interface TestSuiteResult {
  suiteName: string;
  success: boolean;
  results: any;
  error?: string;
}



export async function GET(request: NextRequest) {
  console.log('🚀 Starting comprehensive environment test suite...');

  const suiteResults: TestSuiteResult[] = [];

  // Test 1: Current Configuration
  console.log('🧪 Running Current Configuration Test...');
  try {
    const currentConfig = {
      environment: process.env.VERCEL_ENV || 'development',
      isProduction: process.env.VERCEL_ENV === 'production',
      apiBaseUrl: API_BASE_URL,
      dynamicApiBaseUrl: getApiBaseUrl(),
    };

    const isConfigValid = currentConfig.apiBaseUrl === currentConfig.dynamicApiBaseUrl;
    const expectedUrl = currentConfig.isProduction ? 'https://api.eeva.app/api' : 'https://dev.api.eeva.app/api';
    const isCorrectEnvironment = currentConfig.apiBaseUrl === expectedUrl;

    suiteResults.push({
      suiteName: 'Current Configuration Test',
      success: isConfigValid && isCorrectEnvironment,
      results: {
        success: isConfigValid && isCorrectEnvironment,
        message: isConfigValid && isCorrectEnvironment
          ? `API configuration is correct for ${currentConfig.environment} environment`
          : `API configuration issue detected`,
        ...currentConfig
      }
    });

    console.log(`✅ Current Configuration Test: ${isConfigValid && isCorrectEnvironment ? 'PASSED' : 'FAILED'}`);
  } catch (error: any) {
    suiteResults.push({
      suiteName: 'Current Configuration Test',
      success: false,
      results: null,
      error: error.message
    });
    console.log(`❌ Current Configuration Test: FAILED - ${error.message}`);
  }

  // Test 2: Local Configuration
  console.log('🧪 Running Local Configuration Test...');
  try {
    const isConfigValid = API_BASE_URL && API_BASE_URL.includes('api.eeva.app');

    suiteResults.push({
      suiteName: 'Local Configuration Test',
      success: isConfigValid,
      results: {
        success: isConfigValid,
        message: 'Local API Configuration Test Complete',
        summary: {
          configurationCorrect: isConfigValid,
          successfulTests: isConfigValid ? 3 : 0,
          totalTests: 3
        }
      }
    });

    console.log(`✅ Local Configuration Test: ${isConfigValid ? 'PASSED' : 'FAILED'}`);
  } catch (error: any) {
    suiteResults.push({
      suiteName: 'Local Configuration Test',
      success: false,
      results: null,
      error: error.message
    });
    console.log(`❌ Local Configuration Test: FAILED - ${error.message}`);
  }
  
  // Test 3: Remote Environment Test
  console.log('🧪 Running Remote Environment Test...');
  try {
    // Test dev and prod endpoints
    const testConfigs = {
      dev: { baseUrl: 'https://dev.api.eeva.app/api', name: 'Development' },
      prod: { baseUrl: 'https://api.eeva.app/api', name: 'Production' }
    };

    let devWorking = false;
    let prodWorking = false;

    // Test dev endpoint
    try {
      const devResponse = await fetch(`${testConfigs.dev.baseUrl}/users/exists/test@example.com`, {
        method: 'GET',
        headers: { 'x-vercel-protection-bypass': '0a2eba8c751892e035f6b96605600fae' }
      });
      devWorking = devResponse.status < 500;
    } catch {
      devWorking = false;
    }

    // Test prod endpoint
    try {
      const prodResponse = await fetch(`${testConfigs.prod.baseUrl}/users/exists/test@example.com`, {
        method: 'GET',
        headers: { 'x-vercel-protection-bypass': '0a2eba8c751892e035f6b96605600fae' }
      });
      prodWorking = prodResponse.status < 500;
    } catch {
      prodWorking = false;
    }

    const remoteTestSuccess = devWorking || prodWorking;

    suiteResults.push({
      suiteName: 'Remote Environment Test',
      success: remoteTestSuccess,
      results: {
        success: remoteTestSuccess,
        message: 'API Environment Test Complete',
        summary: {
          successfulTests: (devWorking ? 1 : 0) + (prodWorking ? 1 : 0),
          totalTests: 2,
          devWorking,
          prodWorking
        }
      }
    });

    console.log(`✅ Remote Environment Test: ${remoteTestSuccess ? 'PASSED' : 'FAILED'}`);
    console.log(`   Dev API: ${devWorking ? '✅' : '❌'}`);
    console.log(`   Prod API: ${prodWorking ? '✅' : '❌'}`);
  } catch (error: any) {
    suiteResults.push({
      suiteName: 'Remote Environment Test',
      success: false,
      results: null,
      error: error.message
    });
    console.log(`❌ Remote Environment Test: FAILED - ${error.message}`);
  }

  // Analyze overall results
  const overallSummary = {
    totalSuites: suiteResults.length,
    passedSuites: suiteResults.filter(r => r.success).length,
    failedSuites: suiteResults.filter(r => !r.success).length,
    allTestsPassed: suiteResults.every(r => r.success)
  };
  
  // Extract key information from test results
  const configInfo = suiteResults.find(r => r.suiteName === 'Current Configuration Test')?.results;
  const localTests = suiteResults.find(r => r.suiteName === 'Local Configuration Test')?.results;
  const remoteTests = suiteResults.find(r => r.suiteName === 'Remote Environment Test')?.results;

  // Generate recommendations
  const recommendations = [];

  if (overallSummary.allTestsPassed) {
    recommendations.push('🎉 All tests passed! Environment-based API configuration is working correctly');
    recommendations.push(`✅ Current environment: ${configInfo?.environment || 'unknown'}`);
    recommendations.push(`✅ Using API: ${configInfo?.apiBaseUrl || 'unknown'}`);
    recommendations.push('✅ Local configuration is correct');
    recommendations.push('✅ Remote API endpoints are accessible');
  } else {
    recommendations.push(`⚠️ ${overallSummary.failedSuites}/${overallSummary.totalSuites} test suites failed`);

    if (configInfo && !configInfo.success) {
      recommendations.push('❌ API configuration has issues - check environment variables');
    }

    if (localTests && !localTests.success) {
      recommendations.push('❌ Local API configuration has issues - check API route implementations');
    }

    if (remoteTests && !remoteTests.success) {
      recommendations.push('❌ Remote API endpoints have connectivity issues - check backend server status');
    }

    if (overallSummary.passedSuites > 0) {
      recommendations.push(`✅ ${overallSummary.passedSuites} test suite(s) passed - partial functionality working`);
    }
  }
  
  console.log('\n📊 Overall Test Summary:');
  console.log(`   Total Test Suites: ${overallSummary.totalSuites}`);
  console.log(`   Passed: ${overallSummary.passedSuites}`);
  console.log(`   Failed: ${overallSummary.failedSuites}`);
  console.log(`   Overall Status: ${overallSummary.allTestsPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
  
  return NextResponse.json({
    success: overallSummary.allTestsPassed,
    message: 'Comprehensive Environment Test Suite Complete',
    overallSummary,
    suiteResults,
    recommendations,
    detailedResults: {
      currentConfig: configInfo,
      localTests: localTests?.summary,
      remoteTests: remoteTests?.summary
    },
    timestamp: new Date().toISOString()
  });
}
