/**
 * Default Appliance Tiles API Route for User
 *
 * This route handles fetching default appliance tiles for a specific user from the backend API.
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



  try {
    // Check if the request has an authorization header
    const authHeader = request.headers.get('Authorization');

    // Prepare headers for the backend request
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('x-vercel-protection-bypass', PROTECTION_BYPASS_HEADER);

    // Add the Authorization header if present
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    // Construct the target URL
    const apiUrl = `${API_BASE_URL}/tiles/defaultApplianceTiles/${userId}?accountId=${accountId}`;

    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch appliance tiles' }, { status: response.status });
    }

    const data = await response.json();

    console.log('🔍 Raw API response from defaultApplianceTiles:', JSON.stringify(data, null, 2));

    // Handle the new API response format
    if (data && data.tiles && Array.isArray(data.tiles)) {
      console.log('🔍 Found tiles array with length:', data.tiles.length);
      // Convert from camelCase API format to PascalCase frontend format
      const convertedTiles = data.tiles.map((tile: any) => ({
        UniqueId: tile.id,
        Account_uniqueId: tile.accountId,
        User_uniqueId: tile.userId,
        Type: tile.type,
        Name: tile.name,
        Active: tile.active,
        Deleted: tile.deleted,
        CreationTimestamp: tile.creationTimestamp,
        UpdateTimestamp: tile.updateTimestamp,
        AvatarImagePath: tile.avatarImagePath,
        ElectronicDevice_BrandModel: tile.electronicDeviceBrandModel,
        ElectronicDevice_SerialNumber: tile.electronicDeviceSerialNumber,
        ElectronicDevice_EndOfWarranty: tile.electronicDeviceEndOfWarranty,
        ElectronicDevice_PurchaseDate: tile.electronicDevicePurchaseDate,
        ParentUniqueId: tile.parentId,
        TransferOwnershipToEmailAddress: tile.transferOwnershipToEmailAddress
      }));

      console.log('🔍 Converted appliance tiles:', JSON.stringify(convertedTiles, null, 2));
      return NextResponse.json(convertedTiles);
    }
    // Handle old format or direct array response
    else if (Array.isArray(data)) {
      console.log('🔍 Direct array response:', JSON.stringify(data, null, 2));
      return NextResponse.json(data);
    }
    // If no valid data format, return error
    else {
      console.log('🔍 Invalid data format from API:', JSON.stringify(data, null, 2));
      return NextResponse.json({ error: 'Invalid data format from API' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching appliance tiles:', error);
    return NextResponse.json({ error: 'Failed to fetch appliance tiles' }, { status: 500 });
  }
}
