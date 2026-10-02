export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRES_TODAY' | 'EXPIRED' | 'NO_WARRANTY';
export type WarrantyPeriodUnit = 'MONTHS' | 'YEARS';

export interface Product {
  id: number;
  name: string;
  brand: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  barcode: string | null;
  categoryId: number;
  categoryName: string;
  purchaseDate: string;
  purchasePrice: number | null;
  warrantyStartDate: string | null;
  warrantyExpiryDate: string | null;
  warrantyPeriod: number | null;
  warrantyPeriodUnit: WarrantyPeriodUnit | null;
  storeSeller: string | null;
  notes: string | null;
  warrantyStatus: WarrantyStatus;
  daysUntilExpiry: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  brand?: string;
  modelNumber?: string;
  serialNumber?: string;
  barcode?: string;
  categoryId: number;
  purchaseDate: string;
  purchasePrice?: number;
  warrantyPeriod?: number;
  warrantyPeriodUnit?: WarrantyPeriodUnit;
  warrantyExpiryDate?: string;
  storeSeller?: string;
  notes?: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  status?: WarrantyStatus;
  purchaseFrom?: string;
  purchaseTo?: string;
  expiryFrom?: string;
  expiryTo?: string;
}

export interface ProductLookup {
  barcode: string;
  found: boolean;
  name: string | null;
  brand: string | null;
  modelNumber: string | null;
  categoryId: number | null;
}

export interface DashboardSummary {
  totalProducts: number;
  activeWarranty: number;
  expiringSoon: number;
  expired: number;
}

/** Values carried from the scanner step into the add-product form. */
export interface ProductPrefill {
  barcode?: string;
  name?: string;
  brand?: string;
  modelNumber?: string;
  categoryId?: number;
}
