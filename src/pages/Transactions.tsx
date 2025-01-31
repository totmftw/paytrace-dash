import { useNavigate } from "react-router-dom";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import InvoiceTab from "@/components/transactions/InvoicesTab";
import PaymentTab from "@/components/transactions/PaymentTab";
import LedgerTab from "@/components/transactions/LedgerTab";
// src/pages/Transactions.tsx
import { useState } from 'react';
import { useFinancialYear } from '@/hooks/useFinancialYear';
import { useInvoiceData } from '@/hooks/useInvoiceData';
// src/pages/Transactions/LedgerTab.tsx
// Add these functions to the existing LedgerTab component

const handleExportLedger = (format: 'xlsx' | 'pdf' | 'csv') => {
  if (!selectedCustomer || ledgerEntries.length === 0) return;

  const exportData = {
    seller: {
      name: 'MKD Enterprises',
      address: 'Bengaluru',
      gst: 'XXXXXXXXXXXXX'
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

  const fileName = `ledger_${selectedCustomer.custName}_${year}`;

  if (format === 'pdf') {
    generatePDF(exportData);
  } else {
    exportData(ledgerEntries, {
      fileName,
      format,
      columns: ['date', 'type', 'reference', 'debit', 'credit', 'balance'],
      title: `Ledger - ${selectedCustomer.custName}`
    });
  }
};

// Add this to the JSX
<div className="flex space-x-2">
  <button
    onClick={() => handleExportLedger('xlsx')}
    className="btn btn-secondary"
    disabled={!selectedCustomer || ledgerEntries.length === 0}
  >
    Export to Excel
  </button>
  <button
    onClick={() => handleExportLedger('pdf')}
    className="btn btn-secondary"
    disabled={!selectedCustomer || ledgerEntries.length === 0}
  >
    Export to PDF
  </button>
  <button
    onClick={() => handleExportLedger('csv')}
    className="btn btn-secondary"
    disabled={!selectedCustomer || ledgerEntries.length === 0}
  >
    Export to CSV
  </button>
</div>

const TransactionsPage = () => {
  const { currentYear } = useFinancialYear();
  const { invoices, loading, error } = useInvoiceData(currentYear);
  const [activeTab, setActiveTab] = useState('invoices');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
// src/pages/Transactions.tsx
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useFinancialYear } from '@/hooks/useFinancialYear';
import InvoicesTab from './Transactions/InvoicesTab';
import PaymentsTab from './Transactions/PaymentsTab';
import LedgerTab from './Transactions/LedgerTab';
import YearSelector from '@/components/YearSelector';

const TransactionsPage = () => {
  const { years, currentYear, setCurrentYear } = useFinancialYear();

  const tabs = [
    { key: 'invoices', label: 'Invoices', component: InvoicesTab },
    { key: 'payments', label: 'Payments', component: PaymentsTab },
    { key: 'ledger', label: 'Ledger', component: LedgerTab }
  ];

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <YearSelector
          years={years}
          selectedYear={currentYear}
          onChange={setCurrentYear}
        />
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 border-b mb-4">
          {tabs.map(({ key, label }) => (
            <Tab
              key={key}
              className={({ selected }) =>
                `px-4 py-2 focus:outline-none ${
                  selected 
                    ? 'border-b-2 border-blue-500 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              {label}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="h-[calc(100vh-200px)]">
          {tabs.map(({ key, component: Component }) => (
            <Tab.Panel key={key} className="h-full">
              <Component year={currentYear} />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default TransactionsPage;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      {/* Transactions content will go here */}
    </div>
  );
};

export default TransactionsPage;

interface TabProps {
  year: string;
}

export default function Transactions() {
  const navigate = useNavigate();
  const { selectedYear } = useFinancialYear();

  return (
    <div className="w-full h-screen bg-[#E8F3E8] p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1B4D3E]">Transactions</h2>
          <p className="text-[#4A7862]">View and manage all transactions</p>
        </div>
        <FinancialYearSelector />
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
          <InvoiceTab year={selectedYear} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentTab year={selectedYear} />
        </TabsContent>
        <TabsContent value="ledger">
          <LedgerTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}