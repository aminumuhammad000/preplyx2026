"use client";
import { CreditCard, Wallet as WalletIcon, ArrowUpRight, History, Eye, EyeOff, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function WalletPage() {
  const [copied, setCopied] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletSummary, setWalletSummary] = useState<{
    totalFunded: number;
    totalSpent: number;
    welcomeBonus: number;
  } | null>(null);
  const [virtualAccount, setVirtualAccount] = useState<{
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    hasVirtualAccount?: boolean;
  } | null>(null);
  const [transactions, setTransactions] = useState<any[] | null>(null);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [createAccountError, setCreateAccountError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchWalletData = async () => {
      try {
        const [walletData, transactionsData, virtualAccountData] = await Promise.all([
          api.getWallet(token),
          api.getTransactions(token),
          api.getVirtualAccount(token)
        ]);

        setBalance(walletData.balance || 0);
        setWalletSummary({
          totalFunded: walletData.totalFunded || 0,
          totalSpent: walletData.totalSpent || 0,
          welcomeBonus: walletData.welcomeBonus || 0
        });
        setVirtualAccount(virtualAccountData);
        setTransactions(transactionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [token]);

  const handleCopy = () => {
    if (virtualAccount?.accountNumber) {
      navigator.clipboard.writeText(virtualAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateVirtualAccount = async () => {
    if (!token) return;
    
    setCreatingAccount(true);
    setCreateAccountError(null);
    
    try {
      const newAccount = await api.createVirtualAccount(token);
      setVirtualAccount(newAccount);
    } catch (err) {
      setCreateAccountError(err instanceof Error ? err.message : 'Failed to create virtual account');
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingBottom: '40px' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.5px', marginBottom: '4px' }}>Digital Wallet</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Manage your Preplyx balance, view account details and track transactions.</p>
      </div>

      {/* Balance Card — full width */}
      <div style={{
        borderRadius: '16px', padding: '32px', marginBottom: '24px',
        background: 'var(--gradient-primary)', color: '#fff',
        boxShadow: '0 8px 32px rgba(75, 15, 163, 0.25)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.85 }}>
            <WalletIcon size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Available Balance</span>
            <button
              onClick={() => setBalanceVisible(v => !v)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
              title={balanceVisible ? 'Hide balance' : 'Show balance'}
            >
              {balanceVisible ? <EyeOff size={13} color="#fff" /> : <Eye size={13} color="#fff" />}
            </button>
          </div>
          <div style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1, marginBottom: '8px', transition: 'filter 0.3s', filter: balanceVisible ? 'none' : 'blur(12px)', userSelect: balanceVisible ? 'auto' : 'none' }}>
            {loading ? '...' : error ? '---' : `₦${balance?.toFixed(2) || '0.00'}`}
          </div>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.75, fontSize: '13px', color: '#dc2626' }}>
              <span>{error}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '13px 24px', borderRadius: '10px',
            backgroundColor: '#fff', color: 'var(--color-primary)',
            fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }}>
            <CreditCard size={16} /> Fund Wallet
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '13px 24px', borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff',
            fontWeight: 700, fontSize: '13px', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer'
          }}>
            <ArrowUpRight size={16} /> Transfer Funds
          </button>
        </div>
      </div>

      {/* Info Cards Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>

        {/* Virtual Account Details */}
        <div style={{
          flex: '1 1 300px', borderRadius: '14px', backgroundColor: '#fff',
          boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)', padding: '24px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Virtual Account Details</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Fund your wallet by transferring to this account.</p>
          </div>

          {virtualAccount?.hasVirtualAccount === false ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <button
                onClick={handleCreateVirtualAccount}
                disabled={creatingAccount}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '13px 24px', borderRadius: '10px',
                  backgroundColor: 'var(--color-primary)', color: '#fff',
                  fontWeight: 700, fontSize: '13px', border: 'none', cursor: creatingAccount ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  margin: '0 auto'
                }}
              >
                <Plus size={16} /> {creatingAccount ? 'Creating Account...' : 'Generate Virtual Account'}
              </button>
              {createAccountError && (
                <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '10px' }}>{createAccountError}</p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Bank Name</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{virtualAccount?.bankName || 'Not available'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Account Name</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{virtualAccount?.accountName || 'Not available'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Account Number</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{virtualAccount?.accountNumber || 'Not available'}</span>
                  {virtualAccount?.accountNumber && (
                    <button
                      onClick={handleCopy}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                      title={copied ? 'Copied!' : 'Copy account number'}
                    >
                      {copied ? '✓' : '📋'}
                    </button>
                  )}
                </div>
              </div>
              {virtualAccount?.username && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Username</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{virtualAccount.username}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wallet Summary */}
        <div style={{
          flex: '1 1 300px', borderRadius: '14px', backgroundColor: '#fff',
          boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)', padding: '24px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Wallet Summary</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>A breakdown of your wallet activity.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Total Funded</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                {walletSummary ? `₦${walletSummary.totalFunded.toFixed(2)}` : 'Loading...'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Total Spent</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                {walletSummary ? `₦${walletSummary.totalSpent.toFixed(2)}` : 'Loading...'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Welcome Bonus</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                {walletSummary ? `₦${walletSummary.welcomeBonus.toFixed(2)}` : 'Loading...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{
        borderRadius: '14px', backgroundColor: '#fff',
        boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)', padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Recent Transactions</p>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <History size={14} /> View All
          </button>
        </div>

        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          {loading ? 'Loading transactions...' : transactions && transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(transactions || []).map((transaction, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>{transaction.type || 'Transaction'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{transaction.date || new Date().toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: transaction.amount >= 0 ? '#10b981' : '#ef4444' }}>
                    {transaction.amount >= 0 ? '+' : ''}₦{(transaction.amount || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : 'No transactions available'}
        </div>
      </div>

    </div>
  );
}
