/**
 * Tile API Route
 *
 * This route handles fetching a specific tile from the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tileId: string }> }
) {
  const tileId = (await params).tileId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');
  const userId = searchParams.get('userId');

  console.log(`🔍 Fetching tile: ${tileId}, account: ${accountId}, user: ${userId}`);

  try {
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/tiles/${tileId}?accountId=${accountId}&userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
    });

    if (!response.ok) {
      console.error(`Error fetching tile: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch tile' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Convert from camelCase API format to PascalCase frontend format (like other tile APIs)
    // The backend returns the tile data wrapped in a "tile" object
    if (data && data.tile && data.tile.id) {
      const tile = data.tile;
      const convertedTile = {
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
      };
      return NextResponse.json(convertedTile);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tileId: string }> }
) {
  const tileId = (await params).tileId;

  console.log(`🔄 Updating tile: ${tileId}`);

  try {
    const body = await request.json();
    console.log('Update tile request body:', body);

    // Convert from PascalCase frontend format to camelCase API format
    const convertedBody = {
      id: tileId,
      accountId: body.accountId || body.Account_uniqueId,
      userId: body.userId || body.User_uniqueId,
      type: body.Type,
      name: body.Name,
      active: body.Active !== undefined ? body.Active : true,
      deleted: body.Deleted !== undefined ? body.Deleted : false,
      // Required timestamp fields
      creationTimestamp: body.CreationTimestamp || body.creationTimestamp || new Date().toISOString(),
      updateTimestamp: new Date().toISOString(),
      // Optional fields
      avatarImagePath: body.AvatarImagePath || null,
      parentId: body.ParentUniqueId || null,
      brand: body.Brand || null,
      electronicDeviceBrandModel: body.ElectronicDevice_BrandModel || null,
      electronicDeviceSerialNumber: body.ElectronicDevice_SerialNumber || null,
      electronicDeviceEndOfWarranty: body.ElectronicDevice_EndOfWarranty || null,
      electronicDevicePurchaseDate: body.ElectronicDevice_PurchaseDate || null,
      transferOwnershipToEmailAddress: body.TransferOwnershipToEmailAddress || null
    };

    console.log('Converted body for backend:', JSON.stringify(convertedBody, null, 2));

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/tiles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
      body: JSON.stringify(convertedBody),
    });

    if (!response.ok) {
      console.error(`Error updating tile: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Backend error response:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return NextResponse.json(
        { error: errorData.message || 'Failed to update tile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Backend response data:', JSON.stringify(data, null, 2));

    // Convert response back to PascalCase format
    if (data && data.tile && data.tile.id) {
      const tile = data.tile;
      const convertedTile = {
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
        Brand: tile.brand,
        ElectronicDevice_BrandModel: tile.electronicDeviceBrandModel,
        ElectronicDevice_SerialNumber: tile.electronicDeviceSerialNumber,
        ElectronicDevice_EndOfWarranty: tile.electronicDeviceEndOfWarranty,
        ElectronicDevice_PurchaseDate: tile.electronicDevicePurchaseDate,
        ParentUniqueId: tile.parentId,
        TransferOwnershipToEmailAddress: tile.transferOwnershipToEmailAddress
      };
      return NextResponse.json(convertedTile);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating tile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tileId: string }> }
) {
  const tileId = (await params).tileId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');
  const userId = searchParams.get('userId');

  console.log(`🗑️ Deleting tile: ${tileId}, account: ${accountId}, user: ${userId}`);

  try {
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/tiles/${tileId}?accountId=${accountId}&userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error deleting tile: ${response.status} ${response.statusText}`, errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return NextResponse.json(
        {
          status: 'error',
          message: errorData.message || 'Failed to delete tile',
          errorCode: errorData.errorCode || 'DELETE_FAILED'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Tile deleted successfully:', data);

    return NextResponse.json({
      status: 'success',
      message: 'Tile deleted successfully',
      data: data
    });
  } catch (error) {
    console.error('Error deleting tile:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        errorCode: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
