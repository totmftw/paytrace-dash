import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  horizontalScroll?: boolean;
  verticalScroll?: boolean;
}

const Card = ({
  className,
  children,
  horizontalScroll = false,
  verticalScroll = false,
}: CardProps) => {
  return (
    <div
      className={cn(
        "relative rounded-lg border bg-card text-card-foreground shadow-sm",
        horizontalScroll && "overflow-x-auto",
        verticalScroll && "overflow-y-auto",
        className
      )}
    >
      <div className="p-6">{children}</div>
    </div>
  );
};

export { Card };