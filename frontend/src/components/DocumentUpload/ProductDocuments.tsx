import DeleteOutline from '@mui/icons-material/DeleteOutline';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PictureAsPdfOutlined from '@mui/icons-material/PictureAsPdfOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Box, Chip, IconButton, Link, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useDeleteDocument, useDocuments, useUploadDocument } from '../../features/products/hooks';
import { getErrorMessage } from '../../services/api';
import { documentApi } from '../../services/documentApi';
import { DOCUMENT_TYPE_LABELS, type DocumentType, type ProductDocument } from '../../types/document';
import { formatDate, formatFileSize } from '../../utils/format';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
import { useToast } from '../Common/ToastProvider';
import { Loading } from '../Loading/Loading';
import { DocumentPicker } from './DocumentPicker';

interface Props {
  productId: number;
  /** "cards" matches the Edit form; "button" is the compact version used on the details page. */
  pickerVariant?: 'cards' | 'button';
}

/** Lists a saved product's documents with view / download / delete, and uploads new ones immediately. */
export function ProductDocuments({ productId, pickerVariant = 'button' }: Props) {
  const toast = useToast();
  const { data: documents = [], isLoading, isError } = useDocuments(productId);
  const upload = useUploadDocument(productId);
  const remove = useDeleteDocument(productId);
  const [toDelete, setToDelete] = useState<ProductDocument | null>(null);

  const handleUpload = async (files: File[], documentType: DocumentType) => {
    for (const file of files) {
      try {
        await upload.mutateAsync({ file, documentType });
        toast.success('Document uploaded successfully.');
      } catch (e) {
        toast.error(`${getErrorMessage(e, 'Unable to upload document.')} (${file.name})`);
      }
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success('Document deleted.');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Unable to delete document.'));
    } finally {
      setToDelete(null);
    }
  };

  if (isLoading) return <Loading label="Loading documents..." />;

  return (
    <Box>
      {isError && <Typography color="error" variant="body2" sx={{ mb: 1 }}>Unable to load documents.</Typography>}
      {documents.length === 0 && !isError && (
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>No documents uploaded yet.</Typography>
      )}
      <Box component="ul" sx={{ p: 0, m: 0, display: 'grid', gap: 1, mb: 2 }}>
        {documents.map((doc) => (
          <Box
            component="li"
            key={doc.id}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, listStyle: 'none', border: 1, borderColor: 'divider', borderRadius: 2 }}
          >
            {doc.fileType === 'application/pdf' ? <PictureAsPdfOutlined color="error" /> : <ImageOutlined color="primary" />}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Link href={documentApi.viewUrl(doc.id)} target="_blank" rel="noopener" underline="hover" color="text.primary" variant="body2" sx={{ fontWeight: 600, display: 'block' }} noWrap>
                {doc.fileName}
              </Link>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(doc.fileSize)} · Uploaded on {formatDate(doc.createdAt.slice(0, 10))}
              </Typography>
            </Box>
            <Chip size="small" label={DOCUMENT_TYPE_LABELS[doc.documentType]} sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
            <Tooltip title="View">
              <IconButton size="small" component="a" href={documentApi.viewUrl(doc.id)} target="_blank" rel="noopener" aria-label={`View ${doc.fileName}`}>
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small" component="a" href={documentApi.downloadUrl(doc.id)} aria-label={`Download ${doc.fileName}`}>
                <FileDownloadOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setToDelete(doc)} aria-label={`Delete ${doc.fileName}`}>
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Box>

      <DocumentPicker variant={pickerVariant} showAddAnother={documents.length > 0} onSelect={handleUpload} disabled={upload.isPending} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete Document?"
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      >
        Are you sure you want to delete {toDelete?.fileName}? This action cannot be undone.
      </ConfirmDialog>
    </Box>
  );
}
