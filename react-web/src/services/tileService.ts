import axios from 'axios';
import { Tile, INestedTile } from '../util/types';

// Base URL for API - use Next.js API route to proxy requests
const API_BASE_URL = '/api';

// Tile type constants for parent tiles
export const PARENT_TILE_TYPES = {
  APPLIANCES: 30,
  PROPERTY_INFO: 31,
  SPACES: 32,
  UTILITIES: 37
} as const;

// Headers for API requests
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Tile service
const tileService = {
  /**
   * Get all tiles for a user
   * @param userId - The user ID to get tiles for
   * @param accountId - The account ID to get tiles for
   * @returns Promise resolving to an array of tiles
   */
  getTilesByUser: async (userId: string, accountId: string): Promise<Tile[]> => {


    try {
      // Create headers with Authorization header
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // Try to fetch tiles from the API
      const apiUrl = `${API_BASE_URL}/tiles/defaultSpaceTiles/${userId}`;
      const response = await axios.get(apiUrl, {
        params: { accountId },
        headers,
        timeout: 10000
      });



      // Handle the new API response format
      if (response.data) {
        // Check if response has tiles array (new format)
        if (response.data.tiles && Array.isArray(response.data.tiles) && response.data.tiles.length > 0) {
          // Convert from camelCase API format to PascalCase frontend format
          const convertedTiles = response.data.tiles.map((tile: any) => ({
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
          return convertedTiles;
        }
        // Check if response is direct array (old format)
        else if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      }

      // Return empty array if no data
      return [];
    } catch (error: any) {
      console.error('Error fetching tiles:', error.message);
      // Re-throw the error instead of returning fallback data
      throw error;
    }
  },

  /**
   * Get appliance tiles for a user
   * @param userId - The user ID to get appliances for
   * @param accountId - The account ID to get appliances for
   * @returns Promise resolving to an array of appliance tiles
   */
  getAppliancesByUser: async (userId: string, accountId: string): Promise<INestedTile[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tiles/defaultApplianceTiles/${userId}?accountId=${accountId}`, {
        headers: getHeaders()
      });



      // If we get a successful response with data, return it
      if (response.data) {
        // Check if response has tiles array (new format)
        if (response.data.tiles && Array.isArray(response.data.tiles) && response.data.tiles.length > 0) {
          // Convert from camelCase API format to PascalCase frontend format
          const convertedTiles = response.data.tiles.map((tile: any) => ({
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
          return convertedTiles;
        }
        // Check if response is direct array (old format)
        else if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      }

      // Return empty array if no data
      return [];
    } catch (error: any) {
      console.error('Error fetching appliance tiles:', error.message);

      // Re-throw the error instead of returning fallback data
      throw error;
    }
  },



  /**
   * Get all tiles for a user (including utilities, property info, etc.)
   * @param userId - The user ID to get tiles for
   * @param accountId - The account ID to get tiles for
   * @returns Promise resolving to an array of all tiles
   */
  getAllTilesByUser: async (userId: string, accountId: string): Promise<INestedTile[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/all-data/${accountId}/${userId}`, {
        headers: getHeaders()
      });

      // Extract tiles from the Global_HomeMembers field
      const allTiles = response.data?.Global_HomeMembers || [];

      // Convert to the expected format if needed
      return allTiles.map((tile: any) => ({
        UniqueId: tile.UniqueId || tile.id,
        Name: tile.Name || tile.name,
        Type: tile.Type || tile.type,
        Active: tile.Active !== undefined ? tile.Active : tile.active,
        Deleted: tile.Deleted !== undefined ? tile.Deleted : tile.deleted,
        Account_uniqueId: tile.Account_uniqueId || tile.accountId,
        User_uniqueId: tile.User_uniqueId || tile.userId,
        CreationTimestamp: tile.CreationTimestamp || tile.creationTimestamp,
        UpdateTimestamp: tile.UpdateTimestamp || tile.updateTimestamp,
        AvatarImagePath: tile.AvatarImagePath || tile.avatarImagePath,
        Brand: tile.Brand || tile.brand,
        ElectronicDevice_BrandModel: tile.ElectronicDevice_BrandModel || tile.electronicDeviceBrandModel,
        ElectronicDevice_SerialNumber: tile.ElectronicDevice_SerialNumber || tile.electronicDeviceSerialNumber,
        ElectronicDevice_EndOfWarranty: tile.ElectronicDevice_EndOfWarranty || tile.electronicDeviceEndOfWarranty,
        ElectronicDevice_PurchaseDate: tile.ElectronicDevice_PurchaseDate || tile.electronicDevicePurchaseDate,
        ParentUniqueId: tile.ParentUniqueId || tile.parentId,
        TransferOwnershipToEmailAddress: tile.TransferOwnershipToEmailAddress || tile.transferOwnershipToEmailAddress
      }));
    } catch (error: any) {
      console.error('Error fetching all tiles:', error.message);
      throw error;
    }
  },

  /**
   * Get tiles by parent type - reusable utility function
   * @param userId - The user ID to get tiles for
   * @param accountId - The account ID to get tiles for
   * @param parentType - The parent tile type to filter by (e.g., 30 for Appliances, 32 for Spaces, 37 for Utilities, 31 for Property Info)
   * @returns Promise resolving to an array of child tiles
   */
  getTilesByParentType: async (userId: string, accountId: string, parentType: number): Promise<INestedTile[]> => {
    try {
      // Get all tiles
      const allTiles = await tileService.getAllTilesByUser(userId, accountId);

      // Find the parent tile
      const parentTile = allTiles.find(tile => tile.Type === parentType && !tile.Deleted && tile.Active);

      if (!parentTile) {
        return [];
      }

      // Get child tiles
      const childTiles = allTiles.filter(tile =>
        tile.ParentUniqueId === parentTile.UniqueId &&
        !tile.Deleted &&
        tile.Active
      );

      return childTiles;
    } catch (error: any) {
      console.error(`Error fetching tiles by parent type ${parentType}:`, error.message);
      throw error;
    }
  },

  /**
   * Get a tile by ID
   * @param tileId - The tile ID to get
   * @param accountId - The account ID the tile belongs to
   * @param userId - The user ID the tile belongs to
   * @returns Promise resolving to a tile
   */
  getTileById: async (tileId: string, accountId: string, userId: string): Promise<Tile | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tiles/${tileId}`, {
        params: { accountId, userId },
        headers: getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching tile:', error.message);
      return null;
    }
  },

  /**
   * Create a new tile
   * @param tile - The tile to create
   * @returns Promise resolving to the created tile
   */
  createTile: async (tile: Partial<Tile>): Promise<Tile | null> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tiles`, tile, {
        headers: getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating tile:', error.message);
      return null;
    }
  },

  /**
   * Update an existing tile
   * @param tile - The tile to update
   * @returns Promise resolving to the updated tile
   */
  updateTile: async (tile: Tile): Promise<Tile | null> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tiles`, tile, {
        headers: getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error updating tile:', error.message);
      return null;
    }
  },

  /**
   * Delete a tile
   * @param tileId - The ID of the tile to delete
   * @param accountId - The account ID the tile belongs to
   * @param userId - The user ID the tile belongs to
   * @returns Promise resolving to a success message
   */
  deleteTile: async (tileId: string, accountId: string, userId: string): Promise<{ success: boolean, data?: any }> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tiles`, {
        data: { id: tileId, accountId, userId },
        headers: getHeaders()
      });



      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error deleting tile:', error.message);
      return { success: false };
    }
  }
};

export default tileService;
