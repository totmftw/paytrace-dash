export interface Customer {
  id: number;
  custBusinessname: string;
  custOwnername: string;
  custPhone: number;
  custWhatsapp: number;
  custEmail: string;
  custOwneremail?: string;
  custType: string;
  custAddress?: string;
  custProvince?: string;
  custCity?: string;
  custPincode?: number;
  custGST: string;
  custRemarks?: string;
  custStatus: string;
  custCreditperiod?: number;
}