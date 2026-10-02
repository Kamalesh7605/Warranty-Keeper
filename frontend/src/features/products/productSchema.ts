import { z } from 'zod';
import type { Product, ProductPrefill, ProductRequest } from '../../types/product';
import { calculateExpiry } from '../../utils/warranty';

const optionalText = (max: number) => z.string().max(max, `Must be at most ${max} characters`);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

/** All values are strings because they come straight from inputs; see toProductRequest for conversion. */
export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Product name is required').max(200, 'Must be at most 200 characters'),
    brand: optionalText(100),
    modelNumber: optionalText(100),
    serialNumber: optionalText(100),
    barcode: optionalText(100),
    categoryId: z.string().min(1, 'Category is required'),
    purchaseDate: z.string().min(1, 'Purchase date is required').refine(isDate, 'Enter a valid date'),
    purchasePrice: z
      .string()
      .refine((v) => v.trim() === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Price must be 0 or more'),
    warrantyPeriod: z
      .string()
      .refine((v) => v.trim() === '' || (Number.isInteger(Number(v)) && Number(v) > 0), 'Period must be a whole number greater than 0'),
    warrantyUnit: z.enum(['MONTHS', 'YEARS']),
    warrantyExpiry: z.string().refine((v) => v === '' || isDate(v), 'Enter a valid date'),
    storeSeller: optionalText(150),
    notes: optionalText(1000),
  })
  .superRefine((v, ctx) => {
    if (isDate(v.purchaseDate) && isDate(v.warrantyExpiry) && v.warrantyExpiry < v.purchaseDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['warrantyExpiry'],
        message: 'Expiry date must be on or after the purchase date',
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const emptyProductForm: ProductFormValues = {
  name: '',
  brand: '',
  modelNumber: '',
  serialNumber: '',
  barcode: '',
  categoryId: '',
  purchaseDate: '',
  purchasePrice: '',
  warrantyPeriod: '',
  warrantyUnit: 'YEARS',
  warrantyExpiry: '',
  storeSeller: '',
  notes: '',
};

export function prefillToFormValues(prefill?: ProductPrefill): ProductFormValues {
  return {
    ...emptyProductForm,
    name: prefill?.name ?? '',
    brand: prefill?.brand ?? '',
    modelNumber: prefill?.modelNumber ?? '',
    barcode: prefill?.barcode ?? '',
    categoryId: prefill?.categoryId ? String(prefill.categoryId) : '',
  };
}

export function productToFormValues(p: Product): ProductFormValues {
  return {
    name: p.name,
    brand: p.brand ?? '',
    modelNumber: p.modelNumber ?? '',
    serialNumber: p.serialNumber ?? '',
    barcode: p.barcode ?? '',
    categoryId: String(p.categoryId),
    purchaseDate: p.purchaseDate,
    purchasePrice: p.purchasePrice === null ? '' : String(p.purchasePrice),
    warrantyPeriod: p.warrantyPeriod === null ? '' : String(p.warrantyPeriod),
    warrantyUnit: p.warrantyPeriodUnit ?? 'YEARS',
    warrantyExpiry: p.warrantyExpiryDate ?? '',
    storeSeller: p.storeSeller ?? '',
    notes: p.notes ?? '',
  };
}

/** True when the stored expiry differs from what purchase date + period would give (a manual override). */
export function isExpiryOverridden(v: ProductFormValues): boolean {
  return v.warrantyExpiry !== '' && v.warrantyExpiry !== calculateExpiry(v.purchaseDate, v.warrantyPeriod, v.warrantyUnit);
}

export function toProductRequest(v: ProductFormValues): ProductRequest {
  const text = (s: string) => (s.trim() === '' ? undefined : s.trim());
  const hasPeriod = v.warrantyPeriod.trim() !== '';
  return {
    name: v.name.trim(),
    brand: text(v.brand),
    modelNumber: text(v.modelNumber),
    serialNumber: text(v.serialNumber),
    barcode: text(v.barcode),
    categoryId: Number(v.categoryId),
    purchaseDate: v.purchaseDate,
    purchasePrice: v.purchasePrice.trim() === '' ? undefined : Number(v.purchasePrice),
    warrantyPeriod: hasPeriod ? Number(v.warrantyPeriod) : undefined,
    warrantyPeriodUnit: hasPeriod ? v.warrantyUnit : undefined,
    warrantyExpiryDate: text(v.warrantyExpiry),
    storeSeller: text(v.storeSeller),
    notes: text(v.notes),
  };
}
