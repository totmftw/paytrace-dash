import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

export function CustomerList() {
  const { data: customers } = useQuery({
    queryKey: ["dashboard-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("*")
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {customers?.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="font-medium">{customer.custBusinessname}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.custCity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}