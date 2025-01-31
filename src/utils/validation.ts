// src/utils/validation.ts
import { z } from 'zod';

export const invoiceSchema = z.object({
  invCustid: z.number().positive('Customer ID is required'),
  invDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  invDuedate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  invAmount: z.number().positive('Amount must be greater than 0'),
  invGst: z.number().min(0, 'GST cannot be negative'),
  invAddamount: z.number().min(0, 'Additional amount cannot be negative'),
  invMessage1: z.string().optional(),
  invMessage2: z.string().optional(),
  invAlert: z.string().optional(),
  invMarkcleared: z.boolean(),
  fy: z.string()
});

export const paymentSchema = z.object({
  invId: z.number().positive('Invoice ID is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  fy: z.string()
});

export const validateInvoice = (data: any) => {
  try {
    return invoiceSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(e => e.message).join('\n'));
    }
    throw error;
  }
};

export const validatePayment = (data: any) => {
  try {
    return paymentSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(e => e.message).join('\n'));
    }
    throw error;
  }
};
