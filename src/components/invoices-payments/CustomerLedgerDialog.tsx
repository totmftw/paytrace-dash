import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableRow, TableCell, TableBody, TableHead, Checkbox, TextField } from "@mui/material"; // Assuming Material-UI is being used
import type { CustomerInvoice, UserRoles } from "../../types"; // Import necessary custom types

// Define Props
interface CustomerLedgerDialogProps {
  open: boolean;
  onClose: () => void;
  customerName: string;
  invoices: CustomerInvoice[];
  payments: CustomerInvoice[];
  userRole: UserRoles;
  onSendReminder: (invoiceId: string) => void;
  onEditInvoice: (invoiceId: string) => void;
}

const CustomerLedgerDialog: React.FC<CustomerLedgerDialogProps> = ({
  open,
  onClose,
  customerName,
  invoices,
  payments,
  userRole,
  onSendReminder,
  onEditInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter/search invoices by customer name or invoice details
  const filteredInvoices = invoices.filter((invoice) =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Ledger: {customerName}
      </DialogTitle>
      <DialogContent>
        {/* Search bar */}
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        {/* Ledger Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Invoice Total Value</TableCell>
              <TableCell>Outstanding Amount</TableCell>
              <TableCell>Select</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Send Reminder</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.invoiceId}>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>${invoice.invoiceTotalValue.toFixed(2)}</TableCell>
                <TableCell>${invoice.outstandingAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  {["Owner", "ITAdmin"].includes(userRole) && (
                    <Button
                      color="primary"
                      variant="contained"
                      size="small"
                      onClick={() => onEditInvoice(invoice.invoiceId)}
                    >
                      Edit
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    color="secondary"
                    variant="contained"
                    size="small"
                    onClick={() => onSendReminder(invoice.invoiceId)}
                  >
                    Send Reminder
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerLedgerDialog;