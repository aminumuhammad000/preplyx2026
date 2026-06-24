import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

interface VirtualAccountResponse {
  bankName: string;
  accountName: string;
  accountNumber: string;
  username?: string;
  [key: string]: any;
}

interface CreateVirtualAccountParams {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  amount?: number;
}

class VtstackService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://gw.prod.girostack.com/v1';
    this.apiKey = process.env.VTSTACK_API_KEY || '';
  }

  private getHeaders() {
    const key = this.apiKey || 'sk_live_YOUR_API_KEY_HERE';
    return {
      'x-giro-key': key,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a virtual account for a user
   * @param params - User details for virtual account creation
   * @returns Virtual account details
   */
  async createVirtualAccount(params: CreateVirtualAccountParams): Promise<VirtualAccountResponse> {
    try {
      const accountName = `${params.firstName} ${params.lastName}`.trim();
      
      const response = await axios.post(
        `${this.baseUrl}/virtual-accounts`,
        {
          accountName: accountName,
          category: 'primary',
          currency: 'NGN',
          emailAddress: params.email,
          mobile: params.phone ? {
            phoneNumber: params.phone,
            isoCode: 'NG'
          } : undefined,
        },
        {
          headers: this.getHeaders(),
        }
      );

      // Map the GiroStack response format
      return {
        bankName: response.data.bankName || response.data.provider || 'Wema Bank',
        accountName: response.data.accountName || accountName,
        accountNumber: response.data.accountNumber || response.data.account_number,
        username: response.data.username || response.data.customerName,
        ...response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        console.error('GiroStack API Error:', data || error.message);
        const errorMsg = data?.meta?.error?.message || data?.error?.message || data?.message || error.message;
        throw new Error(`Failed to create virtual account: ${errorMsg}`);
      }
      throw error;
    }
  }

  /**
   * Get existing virtual account details
   * @param accountNumber - The virtual account number
   * @returns Virtual account details
   */
  async getVirtualAccount(accountNumber: string): Promise<VirtualAccountResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/virtual-accounts/${accountNumber}`,
        {
          headers: this.getHeaders(),
        }
      );

      return {
        bankName: response.data.bankName || response.data.provider || 'Wema Bank',
        accountName: response.data.accountName || 'Unknown',
        accountNumber: response.data.accountNumber || response.data.account_number || accountNumber,
        username: response.data.username || response.data.customerName,
        ...response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('GiroStack API Error:', error.response?.data || error.message);
        throw new Error(`Failed to get virtual account: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Verify a transaction
   * @param transactionReference - The transaction reference
   * @returns Transaction details
   */
  async verifyTransaction(transactionReference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transactions/${transactionReference}/verify`,
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('GiroStack API Error:', error.response?.data || error.message);
        throw new Error(`Failed to verify transaction: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}

export default new VtstackService();