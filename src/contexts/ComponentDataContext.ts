import { createContext } from "react";

export const ComponentDataContext = createContext<Record<string, any>>({});
export const ComponentDataProvider = createContext<{ value: Record<string, any> }>({ value: {} });
