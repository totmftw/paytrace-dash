import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";

export function CustomerLedgerTable() {
  const { startDate, endDate } = useFinancialYear();
  
  // Fetch data based on the financial year
  const { data, error, isLoading } = useQuery({
    queryKey: ['customerLedger', startDate, endDate],
    queryFn: () => {
      return fetch(`/api/customerLedger?start=${startDate}&end=${endDate}`).then(res => res.json());
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div>
      <h2>Customer Ledger</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.date}</td>
              <td>{entry.customer}</td>
              <td>{entry.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}