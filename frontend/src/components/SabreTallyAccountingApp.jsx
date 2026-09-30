import React, { useState, useEffect } from 'react';
import { 
  Printer, Building, FileText, DollarSign, CreditCard, 
  Users, CheckCircle, RefreshCw, Download, Edit3, Save, 
  ShieldCheck, ArrowUpRight, TrendingUp, AlertCircle, FileCheck
} from 'lucide-react';

export default function SabreTallyAccountingApp() {
  const [activeTab, setActiveTab] = useState('trial-balance'); // 'trial-balance' | 'profit-loss' | 'payroll' | 'invoice' | 'company-header'
  const [dashboard, setDashboard] = useState(null);
  const [trialBalance, setTrialBalance] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [payroll, setPayroll] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [headerForm, setHeaderForm] = useState(null);
  const [headerSaved, setHeaderSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [dashRes, tbRes, plRes, payRes, invRes, headRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/accounting/dashboard').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/accounting/trial-balance').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/accounting/profit-loss').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/accounting/payroll').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/accounting/generate-tax-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: 'ORD-2026-0017',
            customer_name: 'Tata Steel Limited',
            origin: 'Jamshedpur Works, Jharkhand',
            destination: 'Peenya Industrial Area, Bengaluru',
            cargo: 'Heavy Hot-Rolled Steel Coils (24T)',
            base_amount: 845000.0
          })
        }).then(r => r.json()),
        fetch('http://localhost:8000/api/v1/accounting/header').then(r => r.json())
      ]);

      setDashboard(dashRes);
      setTrialBalance(tbRes);
      setProfitLoss(plRes);
      setPayroll(payRes);
      setInvoice(invRes);
      setHeaderForm(headRes);
    } catch (err) {
      console.error('Error fetching financial records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeader = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/accounting/header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(headerForm)
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setHeaderSaved(true);
        setTimeout(() => setHeaderSaved(false), 3000);
        fetchFinancialData();
      }
    } catch (err) {
      alert('Failed to update company header');
    }
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* APP TOP BAR */}
      <div style={{
        background: '#0f172a',
        color: '#ffffff',
        padding: '12px 24px',
        borderBottom: '2px solid #000000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: '#15803d',
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '18px',
            boxShadow: '0 2px 6px rgba(21, 128, 61, 0.4)'
          }}>
            T
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.04em' }}>
              S.A.B.R.E. TALLY &amp; FINANCIAL BILLING ENTERPRISE
            </div>
            <div style={{ fontSize: '11px', color: '#86efac' }}>
              Statutory Double-Entry Ledger &bull; Legal Tax Invoice Sheets &bull; Driver CTC Payroll
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={printDocument}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: '1px solid #000000',
              borderRadius: '6px',
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={15} />
            <span>Print Legal Sheet</span>
          </button>

          <button
            onClick={fetchFinancialData}
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '7px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI RIBBON */}
      {dashboard && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          background: '#ffffff',
          borderBottom: '1px solid #cbd5e1',
          padding: '10px 24px',
          gap: '12px',
          flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>GROSS FREIGHT REVENUE</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#166534' }}>
              ₹{(dashboard.financial_kpis.gross_freight_revenue_inr / 100000).toFixed(2)} Lakhs
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>DIESEL HSD SPEND</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#dc2626' }}>
              ₹{(dashboard.financial_kpis.total_diesel_spend_inr / 100000).toFixed(2)} Lakhs
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>FASTAG TOLL EXPENSES</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#d97706' }}>
              ₹{(dashboard.financial_kpis.total_fastag_toll_inr / 100000).toFixed(2)} Lakhs
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>CREW CTC PAYROLL</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#2563eb' }}>
              ₹{(dashboard.financial_kpis.driver_crew_payroll_inr / 100000).toFixed(2)} Lakhs
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>OPERATING PROFIT MARGIN</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#059669' }}>
              {dashboard.financial_kpis.gross_profit_margin_pct}%
            </div>
          </div>
        </div>
      )}

      {/* SUB-NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        background: '#f1f5f9',
        borderBottom: '1px solid #000000',
        padding: '6px 24px',
        gap: '8px',
        flexShrink: 0
      }}>
        {[
          { id: 'trial-balance', label: 'Tally Trial Balance Sheet' },
          { id: 'profit-loss', label: 'Profit & Loss Statement' },
          { id: 'payroll', label: 'Employee CTC & Driver Register' },
          { id: 'invoice', label: 'Legal Commercial Tax Invoice' },
          { id: 'company-header', label: 'Company Header & Letterhead' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#1e3a5f' : '#ffffff',
              color: activeTab === tab.id ? '#ffffff' : '#334155',
              border: '1px solid #000000',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN DOCUMENT VIEWER (PRINTABLE BANK-STYLE LAYOUT) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '30px',
        display: 'flex',
        justifyContent: 'center',
        background: '#e2e8f0'
      }}>
        {/* PHYSICAL PAPER SHEET CONTAINER */}
        <div id="printable-financial-sheet" style={{
          width: '920px',
          maxWidth: '100%',
          background: '#ffffff',
          border: '1.5px solid #000000',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 1. OFFICIAL COMPANY LETTERHEAD */}
          {dashboard?.company_header && (
            <div style={{
              borderBottom: '2.5px solid #000000',
              paddingBottom: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>
                    {dashboard.company_header.company_legal_name}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                    Trade Brand: {dashboard.company_header.trade_name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', maxWidth: '580px', lineHeight: 1.4 }}>
                    {dashboard.company_header.registered_address}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '11px', color: '#1e293b' }}>
                  <div><strong>CIN:</strong> {dashboard.company_header.cin_number}</div>
                  <div><strong>GSTIN:</strong> {dashboard.company_header.gstin}</div>
                  <div><strong>PAN:</strong> {dashboard.company_header.pan_number}</div>
                  <div><strong>Bank:</strong> {dashboard.company_header.bank_name}</div>
                  <div><strong>A/C:</strong> {dashboard.company_header.account_number} ({dashboard.company_header.ifsc_code})</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: TRIAL BALANCE SHEET */}
          {activeTab === 'trial-balance' && trialBalance && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>
                  {trialBalance.statement_name}
                </h2>
                <div style={{ fontSize: '11px', color: '#64748b' }}>As of Date: {trialBalance.as_of_date}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1.5px solid #000000' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ padding: '8px', textAlign: 'left', borderRight: '1px solid #000000' }}>Code</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderRight: '1px solid #000000' }}>Particulars (Head of Account)</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderRight: '1px solid #000000' }}>Account Category</th>
                    <th style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #000000' }}>Debit (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Credit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {trialBalance.debit_schedule.map((item, idx) => (
                    <tr key={`deb-${idx}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #000000', fontFamily: 'monospace' }}>{item.code}</td>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #000000', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #000000', color: '#64748b' }}>{item.category}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', borderRight: '1px solid #000000', fontWeight: 700 }}>
                        ₹{item.amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94a3b8' }}>-</td>
                    </tr>
                  ))}
                  {trialBalance.credit_schedule.map((item, idx) => (
                    <tr key={`cred-${idx}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #000000', fontFamily: 'monospace' }}>{item.code}</td>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #000000', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #000000', color: '#64748b' }}>{item.category}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', borderRight: '1px solid #000000', color: '#94a3b8' }}>-</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>
                        ₹{item.amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #000000', fontSize: '13px' }}>
                    <td colSpan={3} style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #000000' }}>
                      TOTAL TALLY VERIFICATION:
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #000000', color: '#15803d' }}>
                      ₹{trialBalance.total_debit_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#15803d' }}>
                      ₹{trialBalance.total_credit_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#475569' }}>
                <div>Status: <strong>{trialBalance.is_balanced ? 'BALANCED (DEBIT = CREDIT)' : 'VARIANCE DETECTED'}</strong></div>
                <div>Authorized Signatory: <strong>{dashboard?.company_header?.authorized_signatory}</strong></div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIT & LOSS */}
          {activeTab === 'profit-loss' && profitLoss && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>
                  {profitLoss.statement_name}
                </h2>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Period: {profitLoss.period}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', border: '1.5px solid #000000' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ padding: '8px', textAlign: 'left', borderRight: '1px solid #000000' }}>Particulars</th>
                    <th style={{ padding: '8px', textAlign: 'right', width: '220px' }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#e0f2fe', fontWeight: 800 }}>
                    <td style={{ padding: '6px 8px', borderRight: '1px solid #000000' }}>I. REVENUE FROM FREIGHT OPERATIONS</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}></td>
                  </tr>
                  {profitLoss.revenue_from_operations.map((r, i) => (
                    <tr key={`r-${i}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 20px', borderRight: '1px solid #000000' }}>{r.head}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{r.amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 800, borderBottom: '1.5px solid #000000' }}>
                    <td style={{ padding: '6px 8px', borderRight: '1px solid #000000' }}>TOTAL REVENUE (A)</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#15803d' }}>₹{profitLoss.total_revenue_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>

                  <tr style={{ background: '#fee2e2', fontWeight: 800 }}>
                    <td style={{ padding: '6px 8px', borderRight: '1px solid #000000' }}>II. DIRECT FLEET &amp; OPERATING EXPENSES</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}></td>
                  </tr>
                  {profitLoss.operating_expenses.map((e, i) => (
                    <tr key={`e-${i}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 20px', borderRight: '1px solid #000000' }}>{e.head}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{e.amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 800, borderBottom: '1.5px solid #000000' }}>
                    <td style={{ padding: '6px 8px', borderRight: '1px solid #000000' }}>TOTAL EXPENSES (B)</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#b91c1c' }}>₹{profitLoss.total_expenses_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>

                  <tr style={{ fontWeight: 800 }}>
                    <td style={{ padding: '6px 8px', borderRight: '1px solid #000000' }}>EBITDA (A - B)</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{profitLoss.ebitda_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 20px', borderRight: '1px solid #000000' }}>Less: Depreciation on Heavy Fleet Assets</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{profitLoss.depreciation_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style={{ fontWeight: 800, background: '#f1f5f9' }}>
                    <td style={{ padding: '6px 8px', borderRight: '1px solid #000000' }}>PROFIT BEFORE TAX (PBT)</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{profitLoss.profit_before_tax_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 20px', borderRight: '1px solid #000000' }}>Less: Corporate Income Tax Provision (25%)</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{profitLoss.tax_provision_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr style={{ fontWeight: 900, background: '#edf7ee', borderTop: '2px solid #000000', fontSize: '13.5px' }}>
                    <td style={{ padding: '10px 8px', borderRight: '1px solid #000000', color: '#166534' }}>NET PROFIT AFTER TAX (PAT)</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#166534' }}>₹{profitLoss.profit_after_tax_net_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: PAYROLL & CTC REGISTER */}
          {activeTab === 'payroll' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>
                  MONTHLY SALARY CTC &amp; DRIVER PAYROLL DISBURSEMENT REGISTER
                </h2>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Compliant with Payment of Wages &amp; EPF Act</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', border: '1.5px solid #000000' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ padding: '6px', textAlign: 'left', borderRight: '1px solid #000000' }}>Emp ID</th>
                    <th style={{ padding: '6px', textAlign: 'left', borderRight: '1px solid #000000' }}>Name &amp; Role</th>
                    <th style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>Annual CTC</th>
                    <th style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>Basic</th>
                    <th style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>HRA</th>
                    <th style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>Trip Bata</th>
                    <th style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>PF/TDS</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Net Pay (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((emp, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px', borderRight: '1px solid #000000', fontWeight: 700 }}>{emp.emp_id}</td>
                      <td style={{ padding: '6px', borderRight: '1px solid #000000' }}>
                        <div style={{ fontWeight: 700 }}>{emp.name}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{emp.role}</div>
                      </td>
                      <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>₹{emp.ctc_annual_inr.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>₹{emp.monthly_basic.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>₹{emp.monthly_hra.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>₹{emp.trip_mileage_allowance.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000', color: '#b91c1c' }}>
                        -₹{(emp.provident_fund_deduction + emp.tds_deduction + emp.esi_deduction).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '6px', textAlign: 'right', fontWeight: 800, color: '#15803d' }}>
                        ₹{emp.net_monthly_salary.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: LEGAL TAX INVOICE */}
          {activeTab === 'invoice' && invoice && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #000000', paddingBottom: '10px', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900 }}>{invoice.document_type}</div>
                  <div style={{ fontSize: '12px' }}>Invoice No: <strong>{invoice.invoice_number}</strong></div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Dated: {invoice.invoice_date}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11.5px' }}>
                  <div><strong>Bill To:</strong> {invoice.bill_to.customer_name}</div>
                  <div>GSTIN: {invoice.bill_to.gstin}</div>
                  <div>Route: {invoice.bill_to.origin_hub} &rarr; {invoice.bill_to.destination_hub}</div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1.5px solid #000000', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ padding: '6px', textAlign: 'left', borderRight: '1px solid #000000' }}>Description</th>
                    <th style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #000000' }}>SAC</th>
                    <th style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>Taxable Val</th>
                    <th style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>CGST (9%)</th>
                    <th style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #000000' }}>SGST (9%)</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', borderRight: '1px solid #000000' }}>{invoice.consignment_details.description_of_goods}</td>
                    <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #000000' }}>{invoice.consignment_details.sac_code}</td>
                    <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #000000' }}>₹{invoice.consignment_details.taxable_value_inr.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #000000' }}>₹{invoice.consignment_details.cgst_amount_inr.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #000000' }}>₹{invoice.consignment_details.sgst_amount_inr.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800 }}>₹{invoice.consignment_details.grand_total_inr.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '1.5px solid #000000' }}>
                    <td colSpan={5} style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #000000' }}>GRAND TOTAL PAYABLE:</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#166534', fontSize: '13px' }}>
                      ₹{invoice.consignment_details.grand_total_inr.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontSize: '11px', color: '#475569', marginBottom: '20px' }}>
                <div><strong>Amount in Words:</strong> {invoice.amount_in_words}</div>
                <div style={{ marginTop: '6px' }}>
                  {invoice.terms_and_conditions.map((t, idx) => <div key={idx}>{t}</div>)}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMPANY HEADER / LETTERHEAD CONFIG */}
          {activeTab === 'company-header' && headerForm && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 900, margin: 0 }}>OFFICIAL ENTERPRISE LETTERHEAD CONFIGURATION</h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Changes saved here will automatically print on all legal invoices, P&amp;L sheets, and bank filings.</div>
              </div>

              {headerSaved && (
                <div style={{ background: '#dcfce7', border: '1px solid #16a34a', color: '#166534', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '12px', fontWeight: 700 }}>
                  Company Letterhead &amp; Legal Details Saved Successfully!
                </div>
              )}

              <form onSubmit={handleSaveHeader} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>Company Legal Registered Name</label>
                  <input 
                    type="text" 
                    value={headerForm.company_legal_name}
                    onChange={(e) => setHeaderForm({ ...headerForm, company_legal_name: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #000000', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>Brand / Trade Name</label>
                  <input 
                    type="text" 
                    value={headerForm.trade_name}
                    onChange={(e) => setHeaderForm({ ...headerForm, trade_name: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #000000', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>GSTIN Number</label>
                  <input 
                    type="text" 
                    value={headerForm.gstin}
                    onChange={(e) => setHeaderForm({ ...headerForm, gstin: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #000000', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>CIN Number</label>
                  <input 
                    type="text" 
                    value={headerForm.cin_number}
                    onChange={(e) => setHeaderForm({ ...headerForm, cin_number: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #000000', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>Registered Office Address</label>
                  <input 
                    type="text" 
                    value={headerForm.registered_address}
                    onChange={(e) => setHeaderForm({ ...headerForm, registered_address: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #000000', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>Bank Name &amp; IFSC</label>
                  <input 
                    type="text" 
                    value={`${headerForm.bank_name} - ${headerForm.ifsc_code}`}
                    onChange={(e) => setHeaderForm({ ...headerForm, bank_name: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #000000', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>Bank Account Number</label>
                  <input 
                    type="text" 
                    value={headerForm.account_number}
                    onChange={(e) => setHeaderForm({ ...headerForm, account_number: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #000000', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <button
                    type="submit"
                    style={{
                      background: '#15803d',
                      color: '#ffffff',
                      border: '1.5px solid #000000',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Save &amp; Update Enterprise Letterhead
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* OFFICIAL FOOTER SIGNATURE */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: '11px',
            color: '#334155'
          }}>
            <div>
              <div>This document is electronically generated and digitally signed.</div>
              <div style={{ color: '#64748b' }}>Powered by S.A.B.R.E. Enterprise Tally Accounting Engine</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ width: '180px', borderBottom: '1px solid #000000', marginBottom: '4px' }}></div>
              <div style={{ fontWeight: 800 }}>For {dashboard?.company_header?.trade_name}</div>
              <div style={{ color: '#64748b' }}>Authorized Corporate Signatory</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
