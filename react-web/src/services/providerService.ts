/**
 * Provider Service
 * 
 * Handles all provider-related API calls
 */

import { Provider } from '../util/types';

export interface ProviderResponse {
  provider: Provider;
}

export interface ProvidersResponse {
  providers: Provider[];
}

export interface CreateProviderRequest {
  accountId: string;
  userId: string;
  name?: string;
  phoneNumber?: string;
  accountNumber?: string;
  avatarImagePath?: string;
  website?: string;
  type?: string;
  representative?: string;
  homeMemberId?: string;
  tileName?: string;
  billingDueDate?: string;
  renewalDate?: string;
  methodOfPayment?: string;
  cardLastFour?: string;
  paymentFreq?: string; // Changed from number to string per Swagger
  utilityTypes?: string;
  active?: boolean;
  deleted?: boolean;
}

export interface UpdateProviderRequest extends CreateProviderRequest {
  id: string;
}

class ProviderService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get all providers for a user
   */
  async getProvidersByUser(userId: string, accountId: string): Promise<Provider[]> {
    try {
      const response = await fetch(
        `/api/providers/user/${userId}?accountId=${accountId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.statusText}`);
      }

      const data: ProvidersResponse = await response.json();
      return data.providers || [];
    } catch (error) {
      console.error('Error fetching providers by user:', error);
      throw error;
    }
  }

  /**
   * Get a specific provider by ID
   */
  async getProviderById(providerId: string, accountId: string): Promise<Provider> {
    try {
      const response = await fetch(
        `/api/providers/${providerId}?accountId=${accountId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch provider: ${response.statusText}`);
      }

      const data: ProviderResponse = await response.json();
      return data.provider;
    } catch (error) {
      console.error('Error fetching provider by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new provider
   */
  async createProvider(providerData: CreateProviderRequest): Promise<Provider> {
    try {
      // Log request details
      console.log('=== CREATE PROVIDER REQUEST ===');
      console.log('Request URL: /api/providers');
      console.log('Request Method: POST');
      console.log('Request Headers:', this.getAuthHeaders());
      console.log('Request Body:', JSON.stringify(providerData, null, 2));
      console.log('================================');

      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(providerData),
      });

      // Log response details
      console.log('=== CREATE PROVIDER RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Status Text:', response.statusText);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response Body (raw):', responseText);

      if (!response.ok) {
        console.log('Response failed with status:', response.status);
        throw new Error(`Failed to create provider: ${response.statusText}`);
      }

      let data: ProviderResponse;
      try {
        data = JSON.parse(responseText);
        console.log('Response Body (parsed):', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      console.log('=================================');

      return data.provider;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  }

  /**
   * Update an existing provider
   */
  async updateProvider(providerData: UpdateProviderRequest): Promise<Provider> {
    try {
      // Include the ID in the request body, not the URL path
      const requestBody = {
        id: providerData.id,
        accountId: providerData.accountId,
        userId: providerData.userId,
        name: providerData.name,
        phoneNumber: providerData.phoneNumber,
        accountNumber: providerData.accountNumber,
        website: providerData.website,
        representative: providerData.representative,
        homeMemberId: providerData.homeMemberId,
        tileName: providerData.tileName,
        type: providerData.type,
        billingDueDate: providerData.billingDueDate,
        active: providerData.active,
        deleted: providerData.deleted,
      };

      // Log request details
      console.log('=== UPDATE PROVIDER REQUEST ===');
      console.log('Request URL: /api/providers');
      console.log('Request Method: PUT');
      console.log('Request Headers:', this.getAuthHeaders());
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('================================');

      const response = await fetch('/api/providers', {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      // Log response details
      console.log('=== UPDATE PROVIDER RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response Status Text:', response.statusText);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response Body (raw):', responseText);

      if (!response.ok) {
        console.log('Response failed with status:', response.status);
        throw new Error(`Failed to update provider: ${response.statusText}`);
      }

      let data: any;
      try {
        data = JSON.parse(responseText);
        console.log('Response Body (parsed):', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      console.log('=================================');

      // Handle different response formats
      // Update endpoint returns { providers: [...] } while create returns { provider: {...} }
      if (data.providers && Array.isArray(data.providers) && data.providers.length > 0) {
        return data.providers[0]; // Return the first (and should be only) provider
      } else if (data.provider) {
        return data.provider;
      } else {
        throw new Error('Invalid response format: no provider data found');
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      throw error;
    }
  }

  /**
   * Delete a provider
   */
  async deleteProvider(providerId: string, accountId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(
        `/api/providers/${providerId}?accountId=${accountId}&userId=${userId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete provider: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw error;
    }
  }

  /**
   * Find provider by home member ID (tile ID)
   */
  async getProviderByHomeMemberId(homeMemberId: string, userId: string, accountId: string): Promise<Provider | null> {
    try {
      const providers = await this.getProvidersByUser(userId, accountId);
      return providers.find(provider => 
        provider.HomeMember_uniqueId === homeMemberId || 
        provider.UniqueId === homeMemberId
      ) || null;
    } catch (error) {
      console.error('Error finding provider by home member ID:', error);
      throw error;
    }
  }
}

// Export singleton instance
const providerService = new ProviderService();
export default providerService;
