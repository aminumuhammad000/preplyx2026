"use client";
import { CreditCard, Wallet as WalletIcon, ArrowUpRight, History, TrendingUp, TrendingDown, Gift, Copy, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const TH = { padding: '13px 20px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '1px' };
const TD = { padding: '16px 20px' };

const transactions = [
  { desc: 'Result Unlock — JAMB Mathematics', datetime: 'Today, 10:45 AM', type: 'Debit', icon: TrendingDown, iconColor: '#dc2626', amount: '− ₦20.00', amountColor: '#dc2626', typeBg: '#fee2e2', typeColor: '#dc2626', ref: 'TXN-8821' },
  { desc: 'Wallet Top-up via Bank Transfer', datetime: 'Yesterday, 02:15 PM', type: 'Credit', icon: TrendingUp, iconColor: '#16a34a', amount: '+ ₦500.00', amountColor: '#16a34a', typeBg: '#dcfce7', typeColor: '#16a34a', ref: 'TXN-8801' },
  { desc: 'Preplyx Welcome Bonus', datetime: 'Jun 1, 2026, 09:00 AM', type: 'Bonus', icon: Gift, iconColor: '#D97706', amount: '+ ₦100.00', amountColor: '#D97706', typeBg: '#fef3c7', typeColor: '#D97706', ref: 'TXN-8799' },
];

export default function WalletPage() {
  const [copied, setCopied] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText('8273645190');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1, marginBottom: '8px', transition: 'filter 0.3s', filter: balanceVisible ? 'none' : 'blur(12px)', userSelect: balanceVisible ? 'auto' : 'none' }}>₦500.00</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.75, fontSize: '13px' }}>
            <Gift size={13} />
            <span>Includes ₦100.00 welcome bonus</span>
          </div>
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
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>

        {/* Virtual Account Details */}
        <div style={{
          flex: 1, borderRadius: '14px', backgroundColor: '#fff',
          boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)', padding: '24px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Virtual Account Details</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Fund your wallet by transferring to this account.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Bank Name', value: 'Moniepoint MFB', mono: false },
              { label: 'Account Name', value: 'PREPLYX — Student', mono: false },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{row.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>{row.value}</span>
              </div>
            ))}

            {/* Account number with copy */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Account Number</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '3px' }}>8273645190</span>
                <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Copy account number">
                  {copied
                    ? <CheckCircle2 size={16} color="#16a34a" />
                    : <Copy size={16} color="var(--color-text-muted)" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Summary */}
        <div style={{
          flex: 1, borderRadius: '14px', backgroundColor: '#fff',
          boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)', padding: '24px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Wallet Summary</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>A breakdown of your wallet activity.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Total Funded', value: '₦500.00', color: '#16a34a', bg: '#dcfce7' },
              { label: 'Total Spent', value: '₦20.00', color: '#dc2626', bg: '#fee2e2' },
              { label: 'Welcome Bonus', value: '₦100.00', color: '#D97706', bg: '#fef3c7' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', backgroundColor: 'var(--color-bg-main)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: row.color }} />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{row.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Recent Transactions</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Your latest wallet activity and payments.</p>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer' }}>View All →</span>
      </div>

      <div style={{ borderRadius: '14px', backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)', overflowX: 'auto', marginTop: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: 'var(--color-bg-main)' }}>
              <th style={TH}>Description</th>
              <th style={TH}>Reference</th>
              <th style={TH}>Date & Time</th>
              <th style={TH}>Type</th>
              <th style={TH}>Status</th>
              <th style={{ ...TH, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((row, i) => (
              <tr key={i} style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafbff')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={TD}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: `${row.typeBg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <row.icon size={15} color={row.iconColor} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)' }}>{row.desc}</span>
                  </div>
                </td>
                <td style={{ ...TD, fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{row.ref}</td>
                <td style={{ ...TD, fontSize: '13px', color: 'var(--color-text-muted)' }}>{row.datetime}</td>
                <td style={TD}>
                  <span style={{ display: 'inline-block', padding: '4px 11px', borderRadius: '20px', backgroundColor: row.typeBg, color: row.typeColor, fontSize: '11px', fontWeight: 700 }}>
                    {row.type}
                  </span>
                </td>
                <td style={TD}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} />
                    Successful
                  </span>
                </td>
                <td style={{ ...TD, textAlign: 'right', fontSize: '14px', fontWeight: 800, color: row.amountColor }}>{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
