import { Invoice } from '@/types';

export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString();

export const calculateBalance = (invoice: Invoice) => {
  const payments = invoice.paymentTransactions?.reduce(
    (sum, payment) => sum + payment.amount,
    0
  ) || 0;
  return invoice.invTotal - payments;
};

export const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString()}`;