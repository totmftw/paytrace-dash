import React from "react";
import { Table, TableContainer, Paper } from "@mui/material";
import TableHeader from "./components/TableHeader";
import TableBodyContent from "./components/TableBodyContent";
import SearchBar from "./components/SearchBar";
import useCustomerTable from "./hooks/useCustomerTable";

const CustomerTable: React.FC = () => {
  const {
    customers,
    filteredCustomers,
    handleSearch,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleEdit,
    handleDelete,
  } = useCustomerTable();

  return (
    <Paper>
      {/* Search Bar at the top */}
      <SearchBar onSearch={handleSearch} />

      {/* Table Content */}
      <TableContainer>
        <Table>
          <TableHeader />
          <TableBodyContent
            customers={filteredCustomers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Table>
      </TableContainer>

      {/* Pagination */}
      <div style={{ padding: "16px" }}>
        <Button onClick={() => handleChangePage(page - 1)} disabled={page === 0}>
          Previous
        </Button>
        <Button
          onClick={() => handleChangePage(page + 1)}
          disabled={page >= Math.ceil(customers.length / rowsPerPage) - 1}
        >
          Next
        </Button>
      </div>
    </Paper>
  );
};

export default CustomerTable;