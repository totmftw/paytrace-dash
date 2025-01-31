// src/pages/Transactions/LedgerTab.tsx
import { useState, useMemo } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import CustomerSelect from '@/components/CustomerSelect';
import LedgerTable from './components/LedgerTable';
// src/pages/Transactions/LedgerTab.tsx
import { useState, useMemo } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import CustomerSelect from '@/components/CustomerSelect';
import LedgerTable from './components/LedgerTable';
import { generatePDF } from '@/utils/pdfGenerator';
import { CustomerMaster } from '@/types';

interface LedgerTabProps {
  year: string;
}

const LedgerTab = ({ year }: LedgerTabProps) => {
  const { invoices, loading: invoicesLoading } = useInvoices(year);
  const { payments, loading: paymentsLoading } = usePayments(year);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerMaster | null>(null);

  const ledgerEntries = useMemo(() => {
    if (!selectedCustomer) return [];

    const entries = [
      ...invoices
        .filter(inv => inv.invCustid === selectedCustomer.custId)
        .map(inv => ({
          date: inv.invDate,
          type: 'Invoice',
          reference: `INV-${inv.invId}`,
          debit: inv.invAmount,
          credit: 0,
          balance: 0, // Will be calculated below
          details: inv
        })),
      ...payments
        .filter(pay => {
          const relatedInvoice = invoices.find(inv => 
            inv.invId === pay.invId && 
            inv.invCustid === selectedCustomer.custId
          );
          return !!relatedInvoice;
        })
        .map(pay => ({
          date: pay.paymentDate,
          type: 'Payment',
          reference: `PAY-${pay.paymentId}`,
          debit: 0,
          credit: pay.amount,
          balance: 0, // Will be calculated below
          details: pay
        }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let balance = 0;
    return entries.map(entry => ({
      ...entry,
      balance: (balance += entry.debit - entry.credit)
    }));
  }, [invoices, payments, selectedCustomer]);

  const handleDownloadPDF = () => {
    if (!selectedCustomer || ledgerEntries.length === 0) return;

    const data = {
      seller: {
        name: 'MKD Enterprises',
        address: 'Bengaluru',
        gst: 'XXXXXXXXXXXXX' // Replace with actual GST
      },
      buyer: {
        name: selectedCustomer.custName,
        address: selectedCustomer.custAddress,
        gst: selectedCustomer.custGst,
        phone: selectedCustomer.custPhone
      },
      entries: ledgerEntries,
      year,
      totalDebit: ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0),
      totalCredit: ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0),
      finalBalance: ledgerEntries[ledgerEntries.length - 1]?.balance || 0
    };

    generatePDF(data);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <CustomerSelect
          value={selectedCustomer?.custId}
          onChange={(customerId) => {
            const customer = customers.find(c => c.custId === customerId);
            setSelectedCustomer(customer || null);
          }}
        />
        <button
          onClick={handleDownloadPDF}
          disabled={!selectedCustomer || ledgerEntries.length === 0}
          className="btn btn-primary"
        >
          Download PDF
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <LedgerTable
          entries={ledgerEntries}
          loading={invoicesLoading || paymentsLoading}
          customer={selectedCustomer}
        />
      </div>
    </div>
  );
};

export default LedgerTab;


interface LedgerTabProps {
  year: string;
}

const LedgerTab = ({ year }: LedgerTabProps) => {
  const { invoices, loading: invoicesLoading } = useInvoices(year);
  const { payments, loading: paymentsLoading } = usePayments(year);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const ledgerEntries = useMemo(() => {
    if (!selectedCustomer) return [];

    const entries = [
      ...invoices
        .filter(inv => inv.invCustid === selectedCustomer)
        .map(inv => ({
          date: inv.invDate,
          type: 'Invoice',
          reference: `INV-${inv.invId}`,
          debit: inv.invAmount,
          credit: 0,
          balance: inv.invAmount
        })),
      ...payments
        .filter(pay => pay.invId && 
          invoices.find(inv => 
            inv.invId === pay.invId && 
            inv.invCustid === selectedCustomer
          )
        )
        .map(pay => ({
          date: pay.paymentDate,
          type: 'Payment',
          reference: `PAY-${pay.paymentId}`,
          debit: 0,
          credit: pay.amount,
          balance: -pay.amount
        }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let runningBalance = 0;
    return entries.map(entry => ({
      ...entry,
      balance: (runningBalance += entry.debit - entry.credit)
    }));
  }, [invoices, payments, selectedCustomer]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <CustomerSelect
          value={selectedCustomer}
          onChange={setSelectedCustomer}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <LedgerTable
          entries={ledgerEntries}
          loading={invoicesLoading || paymentsLoading}
        />
      </div>
    </div>
  );
};

export default LedgerTab;
