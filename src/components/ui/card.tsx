import { cn } from "@/lib/utils";
import React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  horizontalScroll?: boolean;
  verticalScroll?: boolean;
  onClick?: () => void;
  onResize?: (event: React.SyntheticEvent) => void;
}

const Card = ({
  className,
  children,
  horizontalScroll = false,
  verticalScroll = false,
  onClick,
  onResize,
}: CardProps) => {
  return (
    <div
      className={cn(
        "relative rounded-lg border bg-card text-card-foreground shadow-sm",
        horizontalScroll && "overflow-x-auto",
        verticalScroll && "overflow-y-auto",
        className
      )}
      onClick={onClick}
      onResize={onResize}
    >
      <div className="p-6">{children}</div>
    </div>
  );
};

const CardHeader = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>
);

const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
    {children}
  </h3>
);

const CardContent = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cn("p-6 pt-0", className)}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardContent };