import React from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="flex items-center py-4">
      <Input
        placeholder="Search..."
        onChange={(e) => onSearch(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}