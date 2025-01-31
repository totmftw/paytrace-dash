import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface MetricsCardProps {
  title: string;
  value: number;
  iconComponent?: React.ReactNode;
  onClick?: () => void;
}

export function MetricsCard({ title, value, iconComponent, onClick }: MetricsCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {iconComponent}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">₹{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}