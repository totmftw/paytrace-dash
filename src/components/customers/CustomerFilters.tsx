import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CustomerFilters = {
  location: string;
  type: string;
  status: string;
};

export function CustomerFilters({ onFilterChange }: { onFilterChange: (filters: CustomerFilters) => void }) {
  const [filters, setFilters] = useState<CustomerFilters>({
    location: "",
    type: "",
    status: "",
  });

  const handleFilterChange = (key: keyof CustomerFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Input
        placeholder="Search by location..."
        value={filters.location}
        onChange={(e) => handleFilterChange("location", e.target.value)}
        className="max-w-xs"
      />
      <Select
        value={filters.type}
        onValueChange={(value) => handleFilterChange("type", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Customer Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="retail">Retail</SelectItem>
          <SelectItem value="wholesale">Wholesale</SelectItem>
          <SelectItem value="distributor">Distributor</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(value) => handleFilterChange("status", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        onClick={() => {
          const resetFilters = { location: "", type: "", status: "" };
          setFilters(resetFilters);
          onFilterChange(resetFilters);
        }}
      >
        Clear Filters
      </Button>
    </div>
  );
}