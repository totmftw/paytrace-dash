import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}
// src/lib/utils.ts
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN");
}
useEffect(() => {
  async function fetchData() {
    const response = await supabase.from("table").select("*");
    setData(response.data);
  }
  fetchData();
}, []);