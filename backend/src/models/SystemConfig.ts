import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
  // Wallet Fees
  examUnlockFee: number;
  welcomeBonus: number;
  virtualAccountFee: number;
  
  // General Platform Settings
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  
  // Security settings
  requireEmailVerification: boolean;
  allowMultipleLogins: boolean;
  
  // Exam Engine
  freeTrialSessions: number;
  globalNegativeMarking: boolean;
  defaultPassMark: number;
  
  // Integrations & Credentials
  vtstackPublicKey: string;
  vtstackSecretKey: string;
  vtstackSandbox: boolean;
  geminiApiKey: string;
}

const systemConfigSchema = new Schema(
  {
    // Wallet Fees
    examUnlockFee: { type: Number, default: 200 },
    welcomeBonus: { type: Number, default: 500 },
    virtualAccountFee: { type: Number, default: 100 },
    
    // General Settings
    platformName: { type: String, default: 'PreplyX CBT' },
    supportEmail: { type: String, default: 'support@preplyx.com' },
    supportPhone: { type: String, default: '+234 800 123 4567' },
    
    // Security settings
    requireEmailVerification: { type: Boolean, default: false },
    allowMultipleLogins: { type: Boolean, default: true },
    
    // Exam settings
    freeTrialSessions: { type: Number, default: 3 },
    globalNegativeMarking: { type: Boolean, default: false },
    defaultPassMark: { type: Number, default: 50 },
    
    // API Credentials
    vtstackPublicKey: { type: String, default: '' },
    vtstackSecretKey: { type: String, default: '' },
    vtstackSandbox: { type: Boolean, default: true },
    geminiApiKey: { type: String, default: '' },
  },
  { timestamps: true }
);

const SystemConfig = mongoose.model<ISystemConfig>('SystemConfig', systemConfigSchema);
export default SystemConfig;
