import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, Link, MenuItem, TextField, Typography } from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { Category } from '../../types/category';
import { calculateExpiry } from '../../utils/warranty';
import { isExpiryOverridden, productFormSchema, type ProductFormValues } from './productSchema';

interface Props {
  defaultValues: ProductFormValues;
  categories: Category[];
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  onCancel: () => void;
  /** Rendered under "Upload Documents" (queue for Add, saved documents for Edit). */
  documents?: ReactNode;
}

const dateField = { inputLabel: { shrink: true } } as const;

export function ProductForm({ defaultValues, categories, submitLabel, submitting, onSubmit, onCancel, documents }: Props) {
  const {
    register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitted },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productFormSchema), defaultValues });

  const [expiryOverridden, setExpiryOverridden] = useState(() => isExpiryOverridden(defaultValues));
  const [purchaseDate, period, unit] = watch(['purchaseDate', 'warrantyPeriod', 'warrantyUnit']);

  // Keep expiry = purchase date + period until the user overrides it.
  useEffect(() => {
    if (!expiryOverridden) {
      setValue('warrantyExpiry', calculateExpiry(purchaseDate, period, unit), { shouldValidate: isSubmitted });
    }
  }, [purchaseDate, period, unit, expiryOverridden, setValue, isSubmitted]);

  const expiryField = register('warrantyExpiry', {
    onChange: (e) => setExpiryOverridden(e.target.value !== ''),
  });

  return (
    <Card component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
        <TextField label="Product Name" required placeholder="e.g. Samsung 55&quot; Smart TV"
          error={!!errors.name} helperText={errors.name?.message} {...register('name')} />
        <TextField label="Brand" placeholder="e.g. Samsung" error={!!errors.brand} helperText={errors.brand?.message} {...register('brand')} />
        <TextField label="Model Number" placeholder="e.g. UA55CU8000" error={!!errors.modelNumber} helperText={errors.modelNumber?.message} {...register('modelNumber')} />
        <TextField label="Serial Number" placeholder="e.g. SN123456" error={!!errors.serialNumber} helperText={errors.serialNumber?.message} {...register('serialNumber')} />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <TextField select label="Category" required {...field} error={!!errors.categoryId} helperText={errors.categoryId?.message}>
              <MenuItem value="" disabled>Select Category</MenuItem>
              {categories.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
            </TextField>
          )}
        />
        <TextField label="Purchase Date" type="date" required slotProps={dateField}
          error={!!errors.purchaseDate} helperText={errors.purchaseDate?.message} {...register('purchaseDate')} />

        <TextField label="Purchase Price" type="number" placeholder="e.g. 45000" slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          error={!!errors.purchasePrice} helperText={errors.purchasePrice?.message} {...register('purchasePrice')} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField label="Warranty Period" type="number" slotProps={{ htmlInput: { min: 1, step: 1 } }}
            error={!!errors.warrantyPeriod} helperText={errors.warrantyPeriod?.message} {...register('warrantyPeriod')} />
          <Controller
            name="warrantyUnit"
            control={control}
            render={({ field }) => (
              <TextField select label="Unit" {...field} sx={{ maxWidth: 130 }}>
                <MenuItem value="MONTHS">Month(s)</MenuItem>
                <MenuItem value="YEARS">Year(s)</MenuItem>
              </TextField>
            )}
          />
        </Box>

        <TextField
          label="Warranty Expiry"
          type="date"
          slotProps={dateField}
          error={!!errors.warrantyExpiry}
          helperText={
            errors.warrantyExpiry?.message ?? (expiryOverridden ? (
              <span>
                Set manually.{' '}
                <Link component="button" type="button" underline="hover" onClick={() => setExpiryOverridden(false)}>
                  Reset to auto-calculated
                </Link>
              </span>
            ) : 'Auto calculated from purchase date and period')
          }
          sx={expiryOverridden ? undefined : { '& .MuiInputBase-root': { bgcolor: 'action.hover' } }}
          {...expiryField}
        />
        <TextField label="Store / Seller" placeholder="e.g. Reliance Digital" error={!!errors.storeSeller} helperText={errors.storeSeller?.message} {...register('storeSeller')} />

        <TextField label="Barcode / QR value" placeholder="Filled in by the scanner" error={!!errors.barcode} helperText={errors.barcode?.message} {...register('barcode')} />
        <TextField label="Notes" multiline minRows={1} maxRows={4} error={!!errors.notes} helperText={errors.notes?.message} {...register('notes')} />
      </Box>

      {documents && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, mb: 1.5 }}>Upload Documents</Typography>
          {documents}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </Box>
    </Card>
  );
}
