import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toast } = useToast();

  const { data: products, isError, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productManagement")
        .select("*");
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      return data;
    },
    retry: 1,
  });

  const updatePricing = async (productId: string, prices: any) => {
    try {
      const { error } = await supabase
        .from("productManagement")
        .update({
          prodBasePrice: prices.base,
          prodSlaborice1: prices.slab1,
          prodSlabprice2: prices.slab2,
          prodSlabprice3: prices.slab3,
          prodSlabprice4: prices.slab4,
          prodSlabprice5: prices.slab5,
        })
        .eq("prodId", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product pricing updated successfully",
      });
      refetch();
    } catch (error) {
      console.error("Update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product pricing",
      });
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load products. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Button>Add New Product</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((product) => (
            <TableRow key={product.prodId}>
              <TableCell>{product.prodName}</TableCell>
              <TableCell>{product.prodBasePrice}</TableCell>
              <TableCell>{product.prodCategory}</TableCell>
              <TableCell>
                {product.prodStatus ? "Active" : "Inactive"}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Set Pricing
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Product Pricing</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label>Base Price</label>
                        <Input
                          type="number"
                          defaultValue={product.prodBasePrice}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              prodBasePrice: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      {[1, 2, 3, 4, 5].map((slab) => (
                        <div key={slab}>
                          <label>Slab {slab} Price</label>
                          <Input
                            type="number"
                            defaultValue={product[`prodSlabprice${slab}`]}
                            onChange={(e) =>
                              setSelectedProduct({
                                ...selectedProduct,
                                [`prodSlabprice${slab}`]: parseFloat(
                                  e.target.value
                                ),
                              })
                            }
                          />
                        </div>
                      ))}
                      <Button
                        onClick={() =>
                          updatePricing(product.prodId, {
                            base: selectedProduct.prodBasePrice,
                            slab1: selectedProduct.prodSlabprice1,
                            slab2: selectedProduct.prodSlabprice2,
                            slab3: selectedProduct.prodSlabprice3,
                            slab4: selectedProduct.prodSlabprice4,
                            slab5: selectedProduct.prodSlabprice5,
                          })
                        }
                      >
                        Save Pricing
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Products;