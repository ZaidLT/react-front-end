/**
 * Tiles API Route for User
 *
 * This route handles fetching tiles for a specific user from the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userId = (await params).userId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');

  // Default tiles to return if the API fails
  const defaultTiles = [
    {
      Account_uniqueId: accountId || '',
      Active: true,
      Deleted: false,
      CreationTimestamp: new Date().toISOString(),
      Name: 'My Hive',
      Type: 1, // ETileType['My Hive']
      UniqueId: '1',
      UpdateTimestamp: new Date().toISOString(),
      User_uniqueId: userId
    },
    {
      Account_uniqueId: accountId || '',
      Active: true,
      Deleted: false,
      CreationTimestamp: new Date().toISOString(),
      Name: 'Eeva Hive',
      Type: 27, // ETileType.EevaHive
      UniqueId: '2',
      UpdateTimestamp: new Date().toISOString(),
      User_uniqueId: userId
    },
    {
      Account_uniqueId: accountId || '',
      Active: true,
      Deleted: false,
      CreationTimestamp: new Date().toISOString(),
      Name: 'House',
      Type: 3, // ETileType.House
      UniqueId: '3',
      UpdateTimestamp: new Date().toISOString(),
      User_uniqueId: userId
    }
  ];

  try {
    const apiUrl = `${API_BASE_URL}/tiles/defaultSpaceTiles/${userId}?accountId=${accountId}`;
    const authHeader = request.headers.get('Authorization');

    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
    });

    if (!response.ok) {
      return NextResponse.json(defaultTiles);
    }

    const data = await response.json();

    // If the API returns an empty array, return default tiles
    if (Array.isArray(data) && data.length === 0) {
      return NextResponse.json(defaultTiles);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tiles:', error);
    return NextResponse.json(defaultTiles);
  }
}
