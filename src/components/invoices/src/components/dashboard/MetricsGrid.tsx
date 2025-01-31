// src/components/dashboard/MetricsGrid.tsx
import { useState } from 'react';
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricsCard } from "@/components/MetricsCard";
// ... (rest of the implementation remains the same)

