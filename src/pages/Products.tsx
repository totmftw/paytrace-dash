import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";
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
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Products</h2>
      {/* Add products content here */}
    </div>
  );
};

export default Products;
const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toast } = useToast();

  const { data: products, isError, error, refetch, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        console.log("Fetching products...");
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError) {
          console.error("Auth error:", authError);
          throw new Error("Authentication error. Please log in again.");
        }

        if (!session) {
          console.error("No session found");
          throw new Error("Please log in to view products.");
        }

        const { data, error } = await supabase
          .from("productManagement")
          .select("*")
          .throwOnError();
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Products fetched successfully:", data);
        return data;
      } catch (err) {
        console.error("Error fetching products:", err);
        const error = err as Error | PostgrestError;
        toast({
          variant: "destructive",
          title: "Error loading products",
          description: error.message || "Please check your connection and try again"
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });

  const updatePricing = async (productId: string, prices: any) => {
    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session) {
        throw new Error("Authentication error. Please log in again.");
      }

      console.log("Updating pricing for product:", productId, prices);
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
        .eq("prodId", productId)
        .throwOnError();

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      console.log("Product pricing updated successfully");
      toast({
        title: "Success",
        description: "Product pricing updated successfully",
      });
      refetch();
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update product pricing. Please try again."
      });
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <Button>Add New Product</Button>
        </div>
        <div className="text-center p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Failed to load products. Please check your connection.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => refetch()}
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </div>
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Loading products...
              </TableCell>
            </TableRow>
          ) : !products || products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Products;