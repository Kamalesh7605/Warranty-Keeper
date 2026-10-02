import AddIcon from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import {
  Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, TextField, Tooltip, Typography,
} from '@mui/material';
import { useState } from 'react';
import { EmptyState } from '../components/Common/EmptyState';
import { ErrorState } from '../components/Common/ErrorState';
import { PageHeader } from '../components/Common/PageHeader';
import { useToast } from '../components/Common/ToastProvider';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { Loading } from '../components/Loading/Loading';
import { useCategories, useDeleteCategory, useSaveCategory } from '../features/categories/hooks';
import { getErrorMessage } from '../services/api';
import type { Category } from '../types/category';

/** `category === undefined` means "new". */
function CategoryDialog({ category, onClose }: { category?: Category; onClose: () => void }) {
  const toast = useToast();
  const save = useSaveCategory();
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    try {
      await save.mutateAsync({ id: category?.id, body: { name: name.trim(), description: description.trim() || undefined } });
      toast.success(category ? 'Category updated successfully.' : 'Category created successfully.');
      onClose();
    } catch (e) {
      setError(getErrorMessage(e, 'Unable to save category.'));
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
        <TextField label="Name" required autoFocus value={name} error={!!error} helperText={error}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose} disabled={save.isPending}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={save.isPending}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteCategoryDialog({ category, categories, onClose }: { category: Category | null; categories: Category[]; onClose: () => void }) {
  const toast = useToast();
  const remove = useDeleteCategory();
  const [reassignTo, setReassignTo] = useState('');
  const inUse = (category?.productCount ?? 0) > 0;
  const others = categories.filter((c) => c.id !== category?.id);

  const close = () => { setReassignTo(''); onClose(); };
  const confirm = async () => {
    if (!category) return;
    if (inUse && !reassignTo) {
      toast.error('Choose a category to move the products to first.');
      return;
    }
    try {
      await remove.mutateAsync({ id: category.id, reassignTo: reassignTo ? Number(reassignTo) : undefined });
      toast.success('Category deleted successfully.');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to delete category.'));
    } finally {
      close();
    }
  };

  return (
    <ConfirmDialog open={Boolean(category)} title="Delete Category?" loading={remove.isPending} onCancel={close} onConfirm={confirm}>
      <Typography variant="body2" sx={{ mb: inUse ? 2 : 0 }}>
        Are you sure you want to delete {category?.name}? This action cannot be undone.
      </Typography>
      {inUse && (
        <>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            {category?.productCount} product(s) use this category. Choose a category to move them to:
          </Typography>
          <TextField select label="Reassign products to" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
            {others.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
          </TextField>
        </>
      )}
    </ConfirmDialog>
  );
}

export function CategoriesPage() {
  const { data: categories, isLoading, isError, error, refetch } = useCategories();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organise your products into categories"
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing('new')}>Add Category</Button>}
      />

      {isLoading ? <Loading label="Loading categories..." /> : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : categories && categories.length > 0 ? (
        <Card>
          <Box component="ul" sx={{ m: 0, p: 0 }}>
            {categories.map((c, i) => (
              <Box
                component="li"
                key={c.id}
                sx={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.5, borderTop: i === 0 ? 0 : 1, borderColor: 'divider' }}
              >
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>{c.name}</Typography>
                  {c.description && <Typography variant="body2" color="text.secondary" noWrap>{c.description}</Typography>}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {c.productCount} {c.productCount === 1 ? 'product' : 'products'}
                </Typography>
                <Tooltip title="Edit">
                  <IconButton size="small" color="primary" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}><EditOutlined fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}><DeleteOutline fontSize="small" /></IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        </Card>
      ) : (
        <EmptyState title="No categories yet." description="Add a category to organise your products." />
      )}

      {editing && (
        <CategoryDialog category={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
      <DeleteCategoryDialog category={deleting} categories={categories ?? []} onClose={() => setDeleting(null)} />
    </>
  );
}
