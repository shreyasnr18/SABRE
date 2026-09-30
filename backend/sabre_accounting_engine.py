"""
Enterprise Accounting, Commercial Ledger & Financial Billing Suite
Complete transport enterprise accounting engine for small & medium logistics operations:
1. Client Deals, MOUs & Annual Rate Contracts (Rate cards, diesel indexation, credit cycles)
2. Bilty / LR Consignment Ledger (70% advance, 30% balance, physical POD tracking, shortage/damage debits)
3. Vehicle-wise Standalone P&L & Bank EMI Tracker (Tata/HDFC loan EMI, fuel, toll, net truck margin)
4. Universal Workforce & Crew Payroll (Drivers, cleaners, mechanics, dispatchers; salaries, advances, delayed status)
5. General Ledger, Trial Balance & Profit & Loss Statement
6. A4 Printable Document Generation (Tax Invoices, Payslips, Bilties, Deal Summaries, Financial Statements)
"""

import uuid
import time
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

STATE_FILE = os.path.join(os.path.dirname(__file__), "sabre_enterprise_accounting.json")

# Default Enterprise Letterhead
DEFAULT_COMPANY_HEADER = {
    "company_legal_name": "APEX HIGHWAY FREIGHT & LOGISTICS PRIVATE LIMITED",
    "trade_name": "APEX LOGISTICS CORRIDORS",
    "cin_number": "U60200KA2024PTC189941",
    "gstin": "29AABCS9941E1ZX",
    "pan_number": "AABCS9941E",
    "registered_address": "Tower B, Level 9, Cyber Artery SEZ, Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103",
    "contact_email": "finance@apexlogistics.in",
    "contact_phone": "+91 80 4991 2026",
    "bank_name": "HDFC BANK LIMITED",
    "account_number": "50200088994122",
    "ifsc_code": "HDFC0000128",
    "branch": "Koramangala Commercial Branch, Bengaluru",
    "authorized_signatory": "Karan Iyer, Head of Finance"
}

# 1. Commercial Deals & Client MOUs Ledger
COMMERCIAL_DEALS = [
    {
        "deal_id": "DEAL-2026-001",
        "client_name": "Tata Steel Limited",
        "contract_type": "Annual Rate Contract (ARC)",
        "commencement_date": "2026-04-01",
        "expiry_date": "2027-03-31",
        "primary_corridors": "Jamshedpur -> Bengaluru / Pune / Chennai",
        "agreed_tariff_rate": "₹ 2,450 / Metric Ton (Flat)",
        "diesel_escalation_clause": "± ₹2.00/L diesel shift triggers ± 1.8% tariff revision",
        "payment_credit_terms_days": 30,
        "security_deposit_inr": 2500000.0,
        "total_billed_ytd_inr": 18450000.0,
        "total_collected_ytd_inr": 14200000.0,
        "outstanding_receivable_inr": 4250000.0,
        "contract_status": "Active & In Good Standing"
    },
    {
        "deal_id": "DEAL-2026-002",
        "client_name": "Larsen & Toubro Heavy Engineering",
        "contract_type": "Project Master Service Agreement (ODC)",
        "commencement_date": "2026-05-15",
        "expiry_date": "2027-05-14",
        "primary_corridors": "Hazira Port -> Mundra / Barmer Renewable Sites",
        "agreed_tariff_rate": "₹ 1,85,000 / Multi-Axle Hydraulic Puller Trip",
        "diesel_escalation_clause": "Actual fuel reimbursement on IOCL pump receipts",
        "payment_credit_terms_days": 45,
        "security_deposit_inr": 1800000.0,
        "total_billed_ytd_inr": 9200000.0,
        "total_collected_ytd_inr": 6800000.0,
        "outstanding_receivable_inr": 2400000.0,
        "contract_status": "Active & In Good Standing"
    },
    {
        "deal_id": "DEAL-2026-003",
        "client_name": "Reliance Retail Warehousing",
        "contract_type": "Dedicated FMCG Corridor Contract",
        "commencement_date": "2026-01-10",
        "expiry_date": "2027-01-09",
        "primary_corridors": "Bhiwandi Hub -> Ahmedabad / Surat / Indore",
        "agreed_tariff_rate": "₹ 38.50 / km (Guaranteed 6,000 km/mo/truck)",
        "diesel_escalation_clause": "Monthly FASTag & fuel adjustment based on IOCL index",
        "payment_credit_terms_days": 15,
        "security_deposit_inr": 1200000.0,
        "total_billed_ytd_inr": 12400000.0,
        "total_collected_ytd_inr": 11800000.0,
        "outstanding_receivable_inr": 600000.0,
        "contract_status": "Active & In Good Standing"
    }
]

# 2. Bilty (LR) Consignment & Settlement Ledger
BILTY_FREIGHT_LEDGER = [
    {
        "bilty_no": "LR-2026-9901",
        "order_id": "ORD-2026-0017",
        "consignor": "Tata Steel Works, Jamshedpur",
        "consignee": "BFW Precision Plant, Peenya, Bengaluru",
        "vehicle_no": "KA-01-AB-1234",
        "driver_name": "Suresh Patil",
        "loading_date": "2026-09-21",
        "delivery_date": "2026-09-25",
        "cargo_description": "Cold-Rolled Automotive Steel Coils (24.2 Tons)",
        "gross_freight_inr": 845000.0,
        "advance_paid_70pct_inr": 591500.0,
        "balance_due_30pct_inr": 253500.0,
        "physical_pod_status": "Submitted to Client Desk (Acknowledged 26 Sep)",
        "pod_acknowledgment_ref": "BFW/WH/IN/4991",
        "shortage_damage_debit_inr": 0.0,
        "tds_deducted_2pct_inr": 16900.0,
        "net_balance_receivable_inr": 236600.0,
        "bill_status": "Approved & In 30-Day Credit Cycle"
    },
    {
        "bilty_no": "LR-2026-9902",
        "order_id": "ORD-2026-0018",
        "consignor": "L&T Heavy Engineering, Hazira",
        "consignee": "Suzlon Energy Wind Park, Mundra",
        "vehicle_no": "MH-12-RN-9921",
        "driver_name": "Balwinder Singh",
        "loading_date": "2026-09-22",
        "delivery_date": "2026-09-26",
        "cargo_description": "Wind Turbine Nacelle Components (18.5 Tons)",
        "gross_freight_inr": 420000.0,
        "advance_paid_70pct_inr": 294000.0,
        "balance_due_30pct_inr": 126000.0,
        "physical_pod_status": "Signed at Factory Gate (In Transit to Branch)",
        "pod_acknowledgment_ref": "SUZ/MND/REC/102",
        "shortage_damage_debit_inr": 3500.0,
        "tds_deducted_2pct_inr": 8400.0,
        "net_balance_receivable_inr": 114100.0,
        "bill_status": "POD In Transit to Accounts"
    },
    {
        "bilty_no": "LR-2026-9903",
        "order_id": "ORD-2026-0019",
        "consignor": "Reliance Retail Mega Hub, Bhiwandi",
        "consignee": "Reliance Smart Distribution, Ahmedabad",
        "vehicle_no": "GJ-06-XX-4412",
        "driver_name": "Arjun Nair",
        "loading_date": "2026-09-24",
        "delivery_date": "2026-09-25",
        "cargo_description": "FMCG Packaged Foods & Consumer Staples (14.0 Tons)",
        "gross_freight_inr": 185000.0,
        "advance_paid_70pct_inr": 129500.0,
        "balance_due_30pct_inr": 55500.0,
        "physical_pod_status": "Submitted & Payment Cleared via RTGS",
        "pod_acknowledgment_ref": "RIL/AHM/ACK/8812",
        "shortage_damage_debit_inr": 0.0,
        "tds_deducted_2pct_inr": 3700.0,
        "net_balance_receivable_inr": 0.0,
        "bill_status": "Fully Cleared"
    }
]

# 3. Vehicle-wise Standalone P&L & Bank EMI Tracker
VEHICLE_STANDALONE_PNL = [
    {
        "truck_id": "TRK-001",
        "vehicle_no": "KA-01-AB-1234",
        "model": "Tata Prima 5530.S (16-Wheeler)",
        "chassis_status": "Active Long-Haul",
        "financier": "Tata Motors Finance Limited",
        "monthly_bank_emi_inr": 68500.0,
        "emi_due_date": "5th of every month",
        "monthly_freight_revenue_inr": 285000.0,
        "diesel_fuel_spend_inr": 112000.0,
        "fastag_toll_spend_inr": 18400.0,
        "driver_wages_and_bata_inr": 42000.0,
        "tyre_and_maintenance_inr": 14500.0,
        "total_operating_outflow_inr": 186900.0,
        "standalone_gross_margin_inr": 98100.0,
        "net_standalone_profit_after_emi_inr": 29600.0,
        "truck_health": "Profitable (Coverage Ratio: 1.43x)"
    },
    {
        "truck_id": "TRK-002",
        "vehicle_no": "MH-12-RN-9921",
        "model": "BharatBenz 4028T (14-Wheeler)",
        "chassis_status": "Active Dedicated Corridor",
        "financier": "HDFC Bank Commercial Vehicle Loan",
        "monthly_bank_emi_inr": 54200.0,
        "emi_due_date": "10th of every month",
        "monthly_freight_revenue_inr": 240000.0,
        "diesel_fuel_spend_inr": 96500.0,
        "fastag_toll_spend_inr": 16200.0,
        "driver_wages_and_bata_inr": 38000.0,
        "tyre_and_maintenance_inr": 12000.0,
        "total_operating_outflow_inr": 162700.0,
        "standalone_gross_margin_inr": 77300.0,
        "net_standalone_profit_after_emi_inr": 23100.0,
        "truck_health": "Profitable (Coverage Ratio: 1.42x)"
    },
    {
        "truck_id": "TRK-003",
        "vehicle_no": "GJ-06-XX-4412",
        "model": "Ashok Leyland 4220 HG (14-Wheeler)",
        "chassis_status": "Active Regional Feeder",
        "financier": "Sundaram Finance Limited",
        "monthly_bank_emi_inr": 51000.0,
        "emi_due_date": "7th of every month",
        "monthly_freight_revenue_inr": 210000.0,
        "diesel_fuel_spend_inr": 88000.0,
        "fastag_toll_spend_inr": 14500.0,
        "driver_wages_and_bata_inr": 36000.0,
        "tyre_and_maintenance_inr": 9500.0,
        "total_operating_outflow_inr": 148000.0,
        "standalone_gross_margin_inr": 62000.0,
        "net_standalone_profit_after_emi_inr": 11000.0,
        "truck_health": "Profitable (Coverage Ratio: 1.21x)"
    }
]

# 4. Universal Workforce & Crew Payroll (With Delayed/Pending Salaries Tracking)
PAYROLL_REGISTER = [
    {
        "emp_id": "EMP-201",
        "name": "Ramesh Yadav",
        "role": "Senior Heavy-Axle Pilot Driver",
        "department": "Drivers & Operations",
        "monthly_base_salary": 26000,
        "trip_bata_earned": 14500,
        "advances_taken_running_khata": 5000,
        "statutory_deductions_pf_esi": 3450,
        "net_payable_salary": 32050,
        "salary_status": "Paid (Disbursed via IMPS)",
        "disbursement_utr": "IMPS/6291048821",
        "delayed_days": 0,
        "delay_reason": "N/A"
    },
    {
        "emp_id": "EMP-202",
        "name": "Suresh Patil",
        "role": "Multi-Axle Semi-Trailer Driver",
        "department": "Drivers & Operations",
        "monthly_base_salary": 24000,
        "trip_bata_earned": 12800,
        "advances_taken_running_khata": 4000,
        "statutory_deductions_pf_esi": 3180,
        "net_payable_salary": 29620,
        "salary_status": "Paid (Disbursed via IMPS)",
        "disbursement_utr": "IMPS/6291049934",
        "delayed_days": 0,
        "delay_reason": "N/A"
    },
    {
        "emp_id": "EMP-203",
        "name": "Balwinder Singh",
        "role": "Heavy ODC Hydraulics Driver",
        "department": "Drivers & Operations",
        "monthly_base_salary": 28000,
        "trip_bata_earned": 16200,
        "advances_taken_running_khata": 8000,
        "statutory_deductions_pf_esi": 3800,
        "net_payable_salary": 32400,
        "salary_status": "Delayed (Overdue 4 Days)",
        "disbursement_utr": "Pending",
        "delayed_days": 4,
        "delay_reason": "Pending trip fuel slip & RTO entry slip audit"
    },
    {
        "emp_id": "EMP-105",
        "name": "Mahesh Shinde",
        "role": "Yard Master & Loading Supervisor",
        "department": "Yard & Warehousing",
        "monthly_base_salary": 32000,
        "trip_bata_earned": 0,
        "advances_taken_running_khata": 0,
        "statutory_deductions_pf_esi": 3840,
        "net_payable_salary": 28160,
        "salary_status": "Paid (Disbursed via NEFT)",
        "disbursement_utr": "NEFT/881920491",
        "delayed_days": 0,
        "delay_reason": "N/A"
    },
    {
        "emp_id": "EMP-041",
        "name": "Divya Nambiar",
        "role": "Lead Billing & Tax Auditor",
        "department": "Finance & Accounting",
        "monthly_base_salary": 72000,
        "trip_bata_earned": 0,
        "advances_taken_running_khata": 0,
        "statutory_deductions_pf_esi": 8640,
        "net_payable_salary": 63360,
        "salary_status": "Paid (Disbursed via NEFT)",
        "disbursement_utr": "NEFT/881920512",
        "delayed_days": 0,
        "delay_reason": "N/A"
    },
    {
        "emp_id": "EMP-003",
        "name": "Karan Iyer",
        "role": "Chief Financial Officer (CFO)",
        "department": "Executive Leadership",
        "monthly_base_salary": 180000,
        "trip_bata_earned": 0,
        "advances_taken_running_khata": 0,
        "statutory_deductions_pf_esi": 21600,
        "net_payable_salary": 158400,
        "salary_status": "Paid (Disbursed via NEFT)",
        "disbursement_utr": "NEFT/881920550",
        "delayed_days": 0,
        "delay_reason": "N/A"
    }
]

# 5. Chart of Accounts & General Ledger
CHART_OF_ACCOUNTS = [
    {"code": "1001", "name": "Cash and Cash Equivalents (Petty Cash)", "category": "Current Assets", "balance_inr": 4825000.0, "type": "Debit"},
    {"code": "1002", "name": "HDFC Current Operating Account", "category": "Bank Accounts", "balance_inr": 18450000.0, "type": "Debit"},
    {"code": "1003", "name": "FASTag NHAI Escrow Reserve", "category": "Prepaid Freight Wallets", "balance_inr": 650000.0, "type": "Debit"},
    {"code": "1010", "name": "Sundry Trade Debtors (Clients)", "category": "Receivables", "balance_inr": 34850000.0, "type": "Debit"},
    {"code": "1050", "name": "Commercial Heavy Vehicle Fleet (Capital Asset)", "category": "Fixed Assets", "balance_inr": 185000000.0, "type": "Debit"},
    {"code": "1051", "name": "Less: Accumulated Depreciation (Fleet)", "category": "Fixed Assets", "balance_inr": -32000000.0, "type": "Credit"},
    {"code": "2001", "name": "Sundry Trade Creditors (Fuel & Toll Concessionaires)", "category": "Current Liabilities", "balance_inr": 14200000.0, "type": "Credit"},
    {"code": "2010", "name": "GST Output Liability (CGST + SGST + IGST 18%)", "category": "Duties & Taxes", "balance_inr": 4820000.0, "type": "Credit"},
    {"code": "2020", "name": "TDS & PF Payable", "category": "Payroll Liabilities", "balance_inr": 890000.0, "type": "Credit"},
    {"code": "3001", "name": "Share Capital & Retained Earnings", "category": "Equity", "balance_inr": 172065000.0, "type": "Credit"},
    {"code": "4001", "name": "Gross Freight Revenue (Inter-State & ODC)", "category": "Operating Revenue", "balance_inr": 48500000.0, "type": "Credit"},
    {"code": "5001", "name": "High-Speed Diesel (HSD) Fuel Consumption", "category": "Direct Operating Expenses", "balance_inr": 21450000.0, "type": "Debit"},
    {"code": "5002", "name": "National Highway Toll (FASTag) Expenses", "category": "Direct Operating Expenses", "balance_inr": 3850000.0, "type": "Debit"},
    {"code": "5003", "name": "Driver Salaries, Mileage Bata & Crew Wages", "category": "Direct Operating Expenses", "balance_inr": 9200000.0, "type": "Debit"},
    {"code": "5010", "name": "Tyre Wear, Brake Replacement & Maintenance", "category": "Direct Operating Expenses", "balance_inr": 2400000.0, "type": "Debit"}
]

JOURNAL_ENTRIES = [
    {
        "voucher_id": "VCH-2026-081",
        "date": "2026-09-21",
        "voucher_type": "Sales Invoice",
        "narration": "Freight billing to Tata Steel for Jamshedpur-Peenya Heavy Coils transit (ORD-2026-0017)",
        "account_debit": "Sundry Debtors - Tata Steel Ltd",
        "account_credit": "Freight Revenue - Heavy Industrial",
        "debit_amount_inr": 997100.0,
        "credit_amount_inr": 845000.0,
        "tax_gst_inr": 152100.0,
        "status": "POSTED"
    },
    {
        "voucher_id": "VCH-2026-082",
        "date": "2026-09-22",
        "voucher_type": "Purchase / Expense",
        "narration": "Diesel bulk refueling at IOCL Depot for Corridor Fleet (12,000 Liters @ ₹92.50)",
        "account_debit": "Fleet Direct Expenses - Diesel Fuel",
        "account_credit": "IOCL Corporate Fleet Account",
        "debit_amount_inr": 1110000.0,
        "credit_amount_inr": 1110000.0,
        "tax_gst_inr": 0.0,
        "status": "POSTED"
    },
    {
        "voucher_id": "VCH-2026-083",
        "date": "2026-09-23",
        "voucher_type": "FASTag Bank Deduction",
        "narration": "Automated NHAI Toll deduction via HDFC FASTag Wallet across Western Artery NH-48",
        "account_debit": "Fleet Direct Expenses - FASTag Tolls",
        "account_credit": "Bank Account - HDFC Current A/c",
        "debit_amount_inr": 86450.0,
        "credit_amount_inr": 86450.0,
        "tax_gst_inr": 0.0,
        "status": "POSTED"
    }
]

class EnterpriseAccountingEngine:
    def __init__(self):
        self.header = dict(DEFAULT_COMPANY_HEADER)
        self.deals = list(COMMERCIAL_DEALS)
        self.bilties = list(BILTY_FREIGHT_LEDGER)
        self.vehicles_pnl = list(VEHICLE_STANDALONE_PNL)
        self.payroll = list(PAYROLL_REGISTER)
        self.chart = list(CHART_OF_ACCOUNTS)
        self.journal = list(JOURNAL_ENTRIES)
        self._load_state()

    def _save_state(self):
        try:
            data = {
                "header": self.header,
                "deals": self.deals,
                "bilties": self.bilties,
                "vehicles_pnl": self.vehicles_pnl,
                "payroll": self.payroll,
                "chart": self.chart,
                "journal": self.journal
            }
            with open(STATE_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print("Failed to save accounting state:", e)

    def _load_state(self):
        if os.path.exists(STATE_FILE):
            try:
                with open(STATE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.header = data.get("header", self.header)
                    self.deals = data.get("deals", self.deals)
                    self.bilties = data.get("bilties", self.bilties)
                    self.vehicles_pnl = data.get("vehicles_pnl", self.vehicles_pnl)
                    self.payroll = data.get("payroll", self.payroll)
                    self.chart = data.get("chart", self.chart)
                    self.journal = data.get("journal", self.journal)
            except Exception as e:
                print("Failed to load accounting state:", e)

    def get_company_header(self) -> Dict[str, Any]:
        return self.header

    def update_company_header(self, new_header: Dict[str, Any]) -> Dict[str, Any]:
        self.header.update(new_header)
        self._save_state()
        return {"status": "SUCCESS", "header": self.header}

    def get_deals_ledger(self) -> List[Dict[str, Any]]:
        return self.deals

    def get_bilties_ledger(self) -> List[Dict[str, Any]]:
        return self.bilties

    def get_vehicles_pnl(self) -> List[Dict[str, Any]]:
        return self.vehicles_pnl

    def get_payroll_register(self) -> List[Dict[str, Any]]:
        return self.payroll

    def get_financial_dashboard_summary(self) -> Dict[str, Any]:
        total_revenue = sum(b.get("gross_freight_inr", 0) for b in self.bilties)
        if total_revenue == 0:
            total_revenue = 48500000.0

        total_advances_received = sum(b.get("advance_paid_70pct_inr", 0) for b in self.bilties)
        total_pending_balance = sum(b.get("net_balance_receivable_inr", 0) for b in self.bilties)
        total_emis = sum(v.get("monthly_bank_emi_inr", 0) for v in self.vehicles_pnl)
        delayed_salaries_count = len([p for p in self.payroll if "Delayed" in p.get("salary_status", "")])

        return {
            "financial_kpis": {
                "gross_freight_revenue_inr": total_revenue,
                "advances_received_inr": total_advances_received,
                "market_receivables_balance_inr": total_pending_balance,
                "monthly_fleet_loan_emis_inr": total_emis,
                "delayed_salaries_count": delayed_salaries_count,
                "active_client_deals_count": len(self.deals),
                "total_bilties_in_circulation": len(self.bilties),
                "bank_liquid_balance_inr": 18450000.0,
                "gst_liability_current_month_inr": 4820000.0
            },
            "recent_vouchers_count": len(self.journal),
            "employees_on_payroll_count": len(self.payroll),
            "company_header": self.header
        }

    def get_trial_balance(self) -> Dict[str, Any]:
        debit_items = []
        credit_items = []
        total_debit = 0.0
        total_credit = 0.0

        for item in self.chart:
            bal = abs(item["balance_inr"])
            if item["type"] == "Debit":
                debit_items.append({"code": item["code"], "name": item["name"], "category": item["category"], "amount_inr": bal})
                total_debit += bal
            else:
                credit_items.append({"code": item["code"], "name": item["name"], "category": item["category"], "amount_inr": bal})
                total_credit += bal

        return {
            "statement_name": "TRIAL BALANCE SHEET (BANK & STATUTORY GRADE)",
            "as_of_date": datetime.now().strftime("%d %B %Y"),
            "company": self.header,
            "debit_schedule": debit_items,
            "credit_schedule": credit_items,
            "total_debit_inr": round(total_debit, 2),
            "total_credit_inr": round(total_credit, 2),
            "is_balanced": abs(total_debit - total_credit) < 1.0,
            "difference_inr": round(abs(total_debit - total_credit), 2)
        }

    def get_profit_and_loss_statement(self) -> Dict[str, Any]:
        revenue = [
            {"head": "Primary Long-Haul Highway Freight Billing", "amount_inr": 38400000.0},
            {"head": "Heavy Over-Dimensional Cargo (ODC) Wind/Power Projects", "amount_inr": 8200000.0},
            {"head": "Refrigerated Cold-Chain Dedicated Feeder Contracts", "amount_inr": 1900000.0}
        ]
        total_rev = sum(r["amount_inr"] for r in revenue)

        expenses = [
            {"head": "High-Speed Diesel (HSD) Fuel Bulk Procurement", "amount_inr": 21450000.0},
            {"head": "National Highway FASTag Electronic Toll Charges", "amount_inr": 3850000.0},
            {"head": "Driver & Cabin Crew Monthly Salaries & Mileage Bata", "amount_inr": 9200000.0},
            {"head": "Fleet Vehicle Maintenance, Radial Tyres & Spares", "amount_inr": 2400000.0},
            {"head": "Comprehensive Commercial Fleet Insurance Underwriting", "amount_inr": 1650000.0},
            {"head": "Commercial Vehicle Bank Loan EMIs (Tata / HDFC)", "amount_inr": 2085000.0}
        ]
        total_exp = sum(e["amount_inr"] for e in expenses)
        ebitda = total_rev - total_exp
        depreciation = 1850000.0
        pbit = ebitda - depreciation
        tax_provision_25pct = round(pbit * 0.25, 2)
        pat = pbit - tax_provision_25pct

        return {
            "statement_name": "STATEMENT OF PROFIT AND LOSS",
            "period": "Financial Year 2026-27 (Q2 YTD)",
            "company": self.header,
            "revenue_from_operations": revenue,
            "total_revenue_inr": total_rev,
            "operating_expenses": expenses,
            "total_expenses_inr": total_exp,
            "ebitda_inr": ebitda,
            "depreciation_inr": depreciation,
            "profit_before_tax_inr": pbit,
            "tax_provision_inr": tax_provision_25pct,
            "profit_after_tax_net_inr": pat
        }

    def get_printable_invoice(self, order_id: str, customer_name: str, origin: str, destination: str, cargo: str, base_amount: float) -> Dict[str, Any]:
        cgst_9 = round(base_amount * 0.09, 2)
        sgst_9 = round(base_amount * 0.09, 2)
        grand_total = base_amount + cgst_9 + sgst_9
        invoice_no = f"INV/2026-27/{str(uuid.uuid4())[:8].upper()}"

        return {
            "document_type": "TAX INVOICE (ORIGINAL FOR RECIPIENT)",
            "invoice_number": invoice_no,
            "invoice_date": datetime.now().strftime("%d-%m-%Y"),
            "due_date": (datetime.now()).strftime("%d-%m-%Y"),
            "company_letterhead": self.header,
            "bill_to": {
                "customer_name": customer_name,
                "gstin": "27AAACR9921D1ZO",
                "state": "Maharashtra / Transit",
                "origin_hub": origin,
                "destination_hub": destination
            },
            "consignment_details": {
                "order_id": order_id,
                "description_of_goods": f"Freight Transportation Services: {cargo}",
                "sac_code": "996511",
                "vehicle_number": "KA-01-AB-1234",
                "taxable_value_inr": base_amount,
                "cgst_rate_pct": 9.0,
                "cgst_amount_inr": cgst_9,
                "sgst_rate_pct": 9.0,
                "sgst_amount_inr": sgst_9,
                "grand_total_inr": grand_total
            },
            "amount_in_words": f"INR {grand_total:,.2f} Only (Inclusive of 18% Freight GST)",
            "terms_and_conditions": [
                "1. Goods carriage handled under Carriage by Road Act 2007.",
                "2. Detention charges of ₹3,500/day apply if vehicle unloading exceeds 12 hours from gate reporting.",
                "3. Payment due within agreed contract credit terms from physical POD submission date."
            ]
        }

    def get_printable_bilty(self, bilty_no: str) -> Dict[str, Any]:
        match = next((b for b in self.bilties if b["bilty_no"] == bilty_no), self.bilties[0])
        return {
            "document_type": "CONSIGNMENT NOTE / LORRY RECEIPT (BILTY)",
            "bilty_number": match["bilty_no"],
            "date": match["loading_date"],
            "company_letterhead": self.header,
            "consignor": match["consignor"],
            "consignee": match["consignee"],
            "vehicle_no": match["vehicle_no"],
            "driver_name": match["driver_name"],
            "cargo": match["cargo_description"],
            "financials": {
                "gross_freight": match["gross_freight_inr"],
                "advance_paid_70pct": match["advance_paid_70pct_inr"],
                "balance_payable_30pct": match["balance_due_30pct_inr"]
            },
            "pod_status": match["physical_pod_status"],
            "statutory_declaration": "Goods booked at owner's risk under standard GTA conditions. Consignee copy to be surrendered for physical gate clearance."
        }

    def get_printable_payslip(self, emp_id: str) -> Dict[str, Any]:
        match = next((p for p in self.payroll if p["emp_id"] == emp_id), self.payroll[0])
        return {
            "document_type": "MONTHLY SALARY DISBURSEMENT SLIP",
            "period": "September 2026",
            "company_letterhead": self.header,
            "employee": match,
            "salary_breakdown": {
                "basic_pay": match["monthly_base_salary"],
                "trip_bata_earned": match["trip_bata_earned"],
                "gross_earnings": match["monthly_base_salary"] + match["trip_bata_earned"],
                "trip_advances_deducted": match["advances_taken_running_khata"],
                "statutory_pf_esi": match["statutory_deductions_pf_esi"],
                "net_disbursed_inr": match["net_payable_salary"]
            },
            "status": match["salary_status"],
            "reference": match.get("disbursement_utr", "N/A")
        }

    def get_journal_vouchers(self) -> List[Dict[str, Any]]:
        return self.journal

    def record_journal_voucher(self, voucher_data: Dict[str, Any]) -> Dict[str, Any]:
        v_id = f"VCH-2026-{len(self.journal)+85:03d}"
        entry = {
            "voucher_id": v_id,
            "date": voucher_data.get("date", datetime.now().strftime("%Y-%m-%d")),
            "voucher_type": voucher_data.get("voucher_type", "Journal"),
            "narration": voucher_data.get("narration", "Manual Journal Entry"),
            "account_debit": voucher_data.get("account_debit", "Fleet Operating Expenses"),
            "account_credit": voucher_data.get("account_credit", "Bank Current Account"),
            "debit_amount_inr": float(voucher_data.get("amount_inr", 0.0)),
            "credit_amount_inr": float(voucher_data.get("amount_inr", 0.0)),
            "tax_gst_inr": float(voucher_data.get("tax_gst_inr", 0.0)),
            "status": "POSTED"
        }
        self.journal.insert(0, entry)
        self._save_state()
        return {"status": "SUCCESS", "entry": entry}

accounting_engine = EnterpriseAccountingEngine()
