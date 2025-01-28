import { useState } from "react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  outstandingBalance: number;
}

const useCustomerTable = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: "1", name: "Alice", email: "alice@example.com", phone: "123-456-7890", outstandingBalance: 100 },
    { id: "2", name: "Bob", email: "bob@example.com", phone: "987-654-3210", outstandingBalance: 200 },
    // Add more customers here
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  // Filtered and paginated customers
  const filteredCustomers = customers
    .filter((customer) => {
      return (
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleSearch = (searchTerm: string) => setSearchTerm(searchTerm);

  const handleChangePage = (newPage: number) => {
    if (newPage >= 0 && newPage <= Math.ceil(customers.length / rowsPerPage)) {
      setPage(newPage);
    }
  };

  const handleEdit = (customerId: string) => {
    console.log("Edit customer with id:", customerId);
    // Add actual edit logic here
  };

  const handleDelete = (customerId: string) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
  };

  return {
    customers,
    filteredCustomers,
    handleSearch,
    page,
    rowsPerPage,
    handleChangePage,
    handleEdit,
    handleDelete,
  };
};

export default useCustomerTable;