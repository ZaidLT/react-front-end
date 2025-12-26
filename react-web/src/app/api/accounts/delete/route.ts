/**
 * Account Deletion API Route
 *
 * This route handles account deletion requests by forwarding them to the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

/**
 * Send account deletion email
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { accountId, emailAddress } = body;

    if (!accountId || !emailAddress) {
      return NextResponse.json(
        { success: false, error: 'Account ID and email address are required' },
        { status: 400 }
      );
    }

    console.log(`Sending account deletion email for account: ${accountId}, email: ${emailAddress}`);

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/accounts/send-deletion-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Authorization': authHeader
      },
      body: JSON.stringify({
        id: accountId,
        emailAddress: emailAddress
      })
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      
      // Return appropriate error based on status code
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - You do not have permission to delete this account' },
          { status: 403 }
        );
      } else if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Account not found' },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to send deletion email' },
          { status: 500 }
        );
      }
    }

    // Parse the response
    const data = await response.json();

    // Log the response for debugging (omit sensitive data)
    console.log('Account deletion email sent successfully');

    // Return the response
    return NextResponse.json({
      success: true,
      message: 'Account deletion email sent successfully',
      data
    });
  } catch (fetchError) {
    console.error('Fetch error during account deletion email:', fetchError);

    // Return a specific error for fetch failures
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to the server. Please try again later.'
      },
      { status: 503 }
    );
  }
}

/**
 * Validate account deletion code
 */
export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { accountId, emailAddress, deletionCode } = body;

    if (!accountId || !emailAddress || !deletionCode) {
      return NextResponse.json(
        { success: false, error: 'Account ID, email address, and deletion code are required' },
        { status: 400 }
      );
    }

    console.log(`Validating account deletion for account: ${accountId}, email: ${emailAddress}`);

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/accounts/validate-deletion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Authorization': authHeader
      },
      body: JSON.stringify({
        id: accountId,
        emailAddress: emailAddress,
        deletionCode: deletionCode
      })
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      
      // Return appropriate error based on status code
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - Invalid deletion code or account access denied' },
          { status: 403 }
        );
      } else if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Account not found' },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to validate deletion code' },
          { status: 500 }
        );
      }
    }

    // Parse the response
    const data = await response.json();

    // Log the response for debugging (omit sensitive data)
    console.log('Account deletion validation successful');

    // Return the response
    return NextResponse.json({
      success: true,
      message: 'Account deletion validation successful',
      data
    });
  } catch (fetchError) {
    console.error('Fetch error during account deletion validation:', fetchError);

    // Return a specific error for fetch failures
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to the server. Please try again later.'
      },
      { status: 503 }
    );
  }
}

/**
 * Permanently delete account
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { accountId, deletionCode } = body;

    if (!accountId || !deletionCode) {
      return NextResponse.json(
        { success: false, error: 'Account ID and deletion code are required' },
        { status: 400 }
      );
    }

    console.log(`Permanently deleting account: ${accountId}`);

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/accounts/purge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Authorization': authHeader
      },
      body: JSON.stringify({
        id: accountId,
        deletionCode: deletionCode
      })
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      
      // Return appropriate error based on status code
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - Invalid deletion code or account access denied' },
          { status: 403 }
        );
      } else if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Account not found' },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to delete account' },
          { status: 500 }
        );
      }
    }

    // Parse the response
    const data = await response.json();

    // Log the response for debugging (omit sensitive data)
    console.log('Account permanently deleted successfully');

    // Return the response
    return NextResponse.json({
      success: true,
      message: 'Account permanently deleted successfully',
      data
    });
  } catch (fetchError) {
    console.error('Fetch error during account deletion:', fetchError);

    // Return a specific error for fetch failures
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to the server. Please try again later.'
      },
      { status: 503 }
    );
  }
}
