/**
 * User Validation API Route
 *
 * This route validates that a userId corresponds to a valid user associated with the provided token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';
import { extractUserMetadata, hasUserMetadata, extractUserFromToken } from '../../../../util/jwtUtils';

export async function POST(request: NextRequest) {
  console.log('User validation route called');

  try {
    // Parse request body
    const body = await request.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { success: false, error: 'userId and token are required' },
        { status: 400 }
      );
    }

    console.log(`Validating user ID: ${userId} with provided token`);

    // Check if token contains the new user_metadata structure
    if (hasUserMetadata(token)) {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('Using streamlined validation with user_metadata');
      }

      const userMetadata = extractUserMetadata(token);
      if (!userMetadata) {
        return NextResponse.json(
          { success: false, error: 'Invalid token metadata' },
          { status: 401 }
        );
      }

      // Direct validation using user_metadata
      if (userMetadata.userId === userId) {
        // Direct match - the userId matches the token user
        if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
          console.log('Direct userId match with token user_metadata');
        }

        // Extract additional user info from token
        const userInfo = extractUserFromToken(token);

        return NextResponse.json({
          success: true,
          user: {
            id: userMetadata.userId,
            firstName: userInfo?.firstName || '',
            lastName: userInfo?.lastName || '',
            email: userInfo?.email || '',
            accountId: userMetadata.accountId
          }
        });
      }

      // Check if the userId belongs to the same account (for family members)
      const authHeader = `Bearer ${token}`;
      try {
        const accountUserResponse = await fetch(`${API_BASE_URL}/users/${userMetadata.accountId}/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
            'Authorization': authHeader
          }
        });

        if (accountUserResponse.ok) {
          const accountUserData = await accountUserResponse.json();
          if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
            console.log('Found user in same account via user_metadata:', {
              id: accountUserData.id,
              email: accountUserData.emailAddress
            });
          }

          return NextResponse.json({
            success: true,
            user: {
              id: accountUserData.id,
              firstName: accountUserData.firstName,
              lastName: accountUserData.lastName,
              email: accountUserData.emailAddress,
              accountId: accountUserData.accountId
            }
          });
        }
      } catch (accountError) {
        console.error('Error checking user in account via user_metadata:', accountError);
      }

      // If we get here, the userId is not valid for this token
      console.log('UserId validation failed with user_metadata - user not found or not associated with token');
      return NextResponse.json(
        { success: false, error: 'User ID not valid for the provided token' },
        { status: 403 }
      );
    }

    // Fallback to legacy validation method
    console.log('Falling back to legacy validation method');
    const authHeader = `Bearer ${token}`;

    // Try to get user data using the token
    const userResponse = await fetch(`${API_BASE_URL}/users/getUser`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Authorization': authHeader
      }
    });

    if (!userResponse.ok) {
      console.error('Failed to validate token with backend:', userResponse.status, userResponse.statusText);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const tokenUserData = await userResponse.json();
    console.log('Token validation successful, user from token:', {
      id: tokenUserData.id,
      email: tokenUserData.emailAddress
    });

    // Now validate that the provided userId matches the token user or is associated with the same account
    if (tokenUserData.id === userId) {
      // Direct match - the userId matches the token user
      console.log('Direct userId match with token user');
      return NextResponse.json({
        success: true,
        user: {
          id: tokenUserData.id,
          firstName: tokenUserData.firstName,
          lastName: tokenUserData.lastName,
          email: tokenUserData.emailAddress,
          accountId: tokenUserData.accountId
        }
      });
    }

    // If no direct match, check if the userId belongs to the same account as the token user
    if (tokenUserData.accountId) {
      try {
        const accountUserResponse = await fetch(`${API_BASE_URL}/users/${tokenUserData.accountId}/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
            'Authorization': authHeader
          }
        });

        if (accountUserResponse.ok) {
          const accountUserData = await accountUserResponse.json();
          console.log('Found user in same account:', {
            id: accountUserData.id,
            email: accountUserData.emailAddress
          });

          return NextResponse.json({
            success: true,
            user: {
              id: accountUserData.id,
              firstName: accountUserData.firstName,
              lastName: accountUserData.lastName,
              email: accountUserData.emailAddress,
              accountId: accountUserData.accountId
            }
          });
        }
      } catch (accountError) {
        console.error('Error checking user in account:', accountError);
      }
    }

    // If we get here, the userId is not valid for this token
    console.log('UserId validation failed - user not found or not associated with token');
    return NextResponse.json(
      { success: false, error: 'User ID not valid for the provided token' },
      { status: 403 }
    );

  } catch (error) {
    console.error('Error in user validation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during user validation' },
      { status: 500 }
    );
  }
}
