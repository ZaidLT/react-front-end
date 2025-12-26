'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import tokenService from '../../services/tokenService';
import axios from 'axios';

const TestAuthPage = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [email, setEmail] = useState('scott+testing@eeva.ai');
  const [password, setPassword] = useState('password123');
  const [testApiResponse, setTestApiResponse] = useState<any>(null);
  const [loginResponse, setLoginResponse] = useState<any>(null);
  const [refreshResponse, setRefreshResponse] = useState<any>(null);
  const [directLoginResponse, setDirectLoginResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userSwitchResults, setUserSwitchResults] = useState<string[]>([]);
  const [userIdTestResults, setUserIdTestResults] = useState<string[]>([]);

  const addUserSwitchResult = (result: string) => {
    setUserSwitchResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const addUserIdTestResult = (result: string) => {
    setUserIdTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testUserSwitching = () => {
    addUserSwitchResult('Testing user switching logic...');

    // Test 1: Check current user data
    const currentUserData = localStorage.getItem('user_data');
    if (currentUserData) {
      const userData = JSON.parse(currentUserData);
      addUserSwitchResult(`Current user: ${userData.email} (${userData.firstName} ${userData.lastName})`);
    } else {
      addUserSwitchResult('No current user data found');
    }

    // Test 2: Simulate different user email
    const mockTokenPayload = {
      email: 'different.user@example.com',
      sub: 'different-user-id',
      firstName: 'Different',
      lastName: 'User'
    };

    // Simulate the user switching logic
    const currentUserEmail = currentUserData ? JSON.parse(currentUserData).email : null;
    const newUserEmail = mockTokenPayload.email;

    if (currentUserEmail && currentUserEmail !== newUserEmail) {
      addUserSwitchResult(`✅ User switch would be detected: ${currentUserEmail} -> ${newUserEmail}`);
      addUserSwitchResult('✅ clearAllStorage() would be called');
      addUserSwitchResult('✅ Auth state would be reset');
    } else if (currentUserEmail === newUserEmail) {
      addUserSwitchResult(`✅ Same user detected: ${newUserEmail} - session would be refreshed`);
    } else {
      addUserSwitchResult(`✅ No existing session - new session would be created for: ${newUserEmail}`);
    }
  };

  const simulateTokenUrl = () => {
    const testToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IklIRSs3eVNWYVR2cVNmWXEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xzdHljdnF3cnpod2JyaXBieWJvLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0NjFlOWQ3Yy1hOWUwLTRiZmItODFkZC05YWVjZTI1NDhhZWEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUxMjI4OTEyLCJpYXQiOjE3NTA2MjQxMTIsImVtYWlsIjoibHVrZStob3VzZTJAZWV2YS5haSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJsdWtlK2hvdXNlMkBlZXZhLmFpIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNDYxZTlkN2MtYTllMC00YmZiLTgxZGQtOWFlY2UyNTQ4YWVhIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTA2MjQxMTJ9XSwic2Vzc2lvbl9pZCI6ImQ3Y2FiYzQ2LTIwMWItNDlhYS1hMmMwLWE1YzBkMTRkMjZjOSIsImlzX2Fub255bW91cyI6ZmFsc2V9.lr39Fvmv-evtEAwOm5MmTRxblWa9pFRim6xTBUHsgPA';
    const url = `/home?token=${testToken}&mobile=true`;
    addUserSwitchResult(`Navigating to: ${url}`);
    window.location.href = url;
  };

  // Test userId validation API
  const testUserIdValidation = async () => {
    addUserIdTestResult('Testing userId validation API...');

    // Test with sample data (this would normally come from mobile app)
    const testUserId = 'test-user-id';
    const testToken = 'test-token';

    try {
      const response = await fetch('/api/users/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUserId,
          token: testToken
        })
      });

      const result = await response.json();
      addUserIdTestResult(`API Response: ${response.status} - ${JSON.stringify(result)}`);
    } catch (error) {
      addUserIdTestResult(`API Error: ${error}`);
    }
  };

  const simulateMobileAppUrlWithUserId = () => {
    addUserIdTestResult('Simulating mobile app URL with userId parameter...');

    // This would simulate what happens when mobile app opens the web view
    const testToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IklIRSs3eVNWYVR2cVNmWXEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xzdHljdnF3cnpod2JyaXBieWJvLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0NjFlOWQ3Yy1hOWUwLTRiZmItODFkZC05YWVjZTI1NDhhZWEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUxMjI4OTEyLCJpYXQiOjE3NTA2MjQxMTIsImVtYWlsIjoibHVrZStob3VzZTJAZWV2YS5haSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJsdWtlK2hvdXNlMkBlZXZhLmFpIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNDYxZTlkN2MtYTllMC00YmZiLTgxZGQtOWFlY2UyNTQ4YWVhIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTA2MjQxMTJ9XSwic2Vzc2lvbl9pZCI6ImQ3Y2FiYzQ2LTIwMWItNDlhYS1hMmMwLWE1YzBkMTRkMjZjOSIsImlzX2Fub255bW91cyI6ZmFsc2V9.lr39Fvmv-evtEAwOm5MmTRxblWa9pFRim6xTBUHsgPA';
    const testUserId = '461e9d7c-a9e0-4bfb-81dd-9aece2548aea'; // This should match the sub in the token
    const url = `/home?token=${testToken}&userId=${testUserId}&mobile=true`;
    addUserIdTestResult(`Would navigate to: ${url}`);
    addUserIdTestResult('Note: This would trigger the AuthContext URL parameter handling with userId validation');
  };

  const clearUserIdTestResults = () => {
    setUserIdTestResults([]);
  };

  // Test the API route
  const testApi = async () => {
    try {
      setError(null);
      const response = await axios.get('/api/test');
      setTestApiResponse(response.data);
    } catch (error) {
      console.error('Test API error:', error);
      setError('Failed to test API');
    }
  };

  // Test the login API route directly
  const testLoginApi = async () => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', {
        emailAddress: email,
        password: password,
        provider: 'email'
      });
      setLoginResponse(response.data);
    } catch (error) {
      console.error('Login API error:', error);
      setError('Failed to test login API');
    }
  };

  // Test the refresh token API route directly
  const testRefreshApi = async () => {
    try {
      setError(null);
      if (typeof window === 'undefined') {
        setError('Cannot access localStorage on server');
        return;
      }
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        setError('No refresh token available');
        return;
      }
      const response = await axios.post('/api/auth/refresh-token', {
        refreshToken
      });
      setRefreshResponse(response.data);
    } catch (error) {
      console.error('Refresh API error:', error);
      setError('Failed to test refresh API');
    }
  };

  // Test the login function from AuthContext
  const testLogin = async () => {
    try {
      setError(null);
      const success = await login(email, password);
      setDirectLoginResponse({ success });
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login');
    }
  };

  // Test the logout function from AuthContext
  const testLogout = async () => {
    try {
      setError(null);
      await logout();
      setDirectLoginResponse(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    }
  };

  // Get the current tokens
  const getTokens = () => {
    if (typeof window === 'undefined') {
      return { accessToken: null, refreshToken: null };
    }
    const accessToken = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    return { accessToken, refreshToken };
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Authentication Test Page</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Current Authentication State</h2>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? JSON.stringify(user) : 'Not logged in'}</p>
        <p>Tokens: {JSON.stringify(getTokens())}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test API</h2>
        <button onClick={testApi}>Test API</button>
        {testApiResponse && (
          <pre>{JSON.stringify(testApiResponse, null, 2)}</pre>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Login API</h2>
        <div>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginLeft: '10px', marginRight: '20px' }}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
        <button onClick={testLoginApi} style={{ marginTop: '10px' }}>Test Login API</button>
        {loginResponse && (
          <pre>{JSON.stringify(loginResponse, null, 2)}</pre>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Refresh API</h2>
        <button onClick={testRefreshApi}>Test Refresh API</button>
        {refreshResponse && (
          <pre>{JSON.stringify(refreshResponse, null, 2)}</pre>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Login Function</h2>
        <button onClick={testLogin}>Login</button>
        <button onClick={testLogout} style={{ marginLeft: '10px' }}>Logout</button>
        {directLoginResponse && (
          <pre>{JSON.stringify(directLoginResponse, null, 2)}</pre>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>User Switching Tests</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={testUserSwitching}>Test User Switching Logic</button>
          <button onClick={simulateTokenUrl}>Test Token URL</button>
          <button onClick={() => setUserSwitchResults([])}>Clear Results</button>
        </div>
        {userSwitchResults.length > 0 && (
          <div style={{
            background: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '10px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {userSwitchResults.map((result, index) => (
              <div key={index} style={{ marginBottom: '5px', fontFamily: 'monospace', fontSize: '12px' }}>
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Mobile App Authentication with UserId</h2>
        <button onClick={testUserIdValidation}>Test UserId Validation API</button>
        <button onClick={simulateMobileAppUrlWithUserId} style={{ marginLeft: '10px' }}>Simulate Mobile App URL with UserId</button>
        <button onClick={clearUserIdTestResults} style={{ marginLeft: '10px' }}>Clear Results</button>
        {userIdTestResults.length > 0 && (
          <div style={{
            background: '#e8f4fd',
            border: '1px solid #b3d9ff',
            borderRadius: '4px',
            padding: '10px',
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '10px'
          }}>
            <h3>UserId Authentication Test Results:</h3>
            {userIdTestResults.map((result, index) => (
              <div key={index} style={{ marginBottom: '5px', fontFamily: 'monospace', fontSize: '12px' }}>
                {result}
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff9c4', borderRadius: '5px' }}>
          <h4>How to Test Mobile App Authentication:</h4>
          <ol style={{ fontSize: '14px' }}>
            <li>Click "Test UserId Validation API" to test the new validation endpoint</li>
            <li>Click "Simulate Mobile App URL with UserId" to see what URL would be generated</li>
            <li>To test the full flow, manually navigate to: <code>/home?token=VALID_TOKEN&userId=VALID_USER_ID&mobile=true</code></li>
            <li>Check browser console for detailed authentication logs</li>
          </ol>
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default TestAuthPage;
