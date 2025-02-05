import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export function CustomerList() {
  const { data: customers } = useQuery({
    queryKey: ["dashboard-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("*")
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers?.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{customer.custBusinessname}</p>
                <p className="text-sm text-muted-foreground">{customer.custType}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}