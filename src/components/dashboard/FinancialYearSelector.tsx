// src/components/dashboard/FinancialYearSelector.tsx
import { useState, useEffect } from 'react';
import { Select } from '@/components/ui/select';
// src/components/dashboard/FinancialYearSelector.tsx
import { Select } from '@mui/material';  // Change from @/components/ui/select

// Update the component to use MUI Select
export function FinancialYearSelector({ value, onChange }: FinancialYearSelectorProps) {
  // ... rest of the implementation
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ width: 200 }}
    >
      {years.map((year) => (
        <MenuItem key={year} value={year}>
          FY {year}
        </MenuItem>
      ))}
    </Select>
  );
}

interface FinancialYearSelectorProps {
  value: string;
  onChange: (year: string) => void;
}

export function FinancialYearSelector({ value, onChange }: FinancialYearSelectorProps) {
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const startYear = currentYear - 5;
    const endYear = currentMonth >= 4 ? currentYear : currentYear - 1;
    
    const financialYears = [];
    for (let year = startYear; year <= endYear; year++) {
      financialYears.push(`${year}-${year + 1}`);
    }
    
    setYears(financialYears);
    if (!value) {
      onChange(financialYears[financialYears.length - 1]);
    }
  }, []);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      className="w-48"
    >
      {years.map((year) => (
        <Select.Option key={year} value={year}>
          FY {year}
        </Select.Option>
      ))}
    </Select>
  );
}
