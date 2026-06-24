import mongoose from 'mongoose';
import User from '../models/User';
import Wallet from '../models/Wallet';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed admin user 'demo' if not exists
    try {
      // Clean up old 'usman' user
      await User.deleteOne({ name: 'usman' });

      const adminExists = await User.findOne({ name: 'demo' });
      if (!adminExists) {
        const user = await User.create({
          name: 'demo',
          email: 'demo@cbt.com',
          password: '12345678', // will be automatically hashed by pre-save hook
          status: 'active',
        });

        const wallet = await Wallet.create({
          user: user._id,
          balance: 10000,
          totalFunded: 10000,
          totalSpent: 0,
          welcomeBonus: 100,
        });

        user.wallet = wallet._id;
        await user.save();
        console.log('Seeded admin user "demo" with password "12345678"');
      } else {
        // Force update the password to '12345678' to make sure it matches user requirements
        adminExists.password = '12345678'; // will be automatically hashed by pre-save hook
        adminExists.status = 'active';
        await adminExists.save();
        console.log('Force updated existing admin user "demo" password to "12345678"');
      }
    } catch (seedError) {
      console.error('Error seeding/updating admin user:', seedError);
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
