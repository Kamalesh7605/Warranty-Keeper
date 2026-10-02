import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfOutlined from '@mui/icons-material/PictureAsPdfOutlined';
import { Box, Chip, IconButton, Typography } from '@mui/material';
import { DOCUMENT_TYPE_LABELS, type DocumentType, type PendingDocument } from '../../types/document';
import { formatFileSize } from '../../utils/format';
import { DocumentPicker } from './DocumentPicker';

interface Props {
  pending: PendingDocument[];
  onChange: (docs: PendingDocument[]) => void;
  disabled?: boolean;
}

/** Collects files in the Add Product form; they are uploaded after the product is saved. */
export function DocumentUpload({ pending, onChange, disabled }: Props) {
  const add = (files: File[], documentType: DocumentType) => {
    const added = files.map((file) => ({ key: `${file.name}-${file.size}-${crypto.randomUUID()}`, file, documentType }));
    onChange([...pending, ...added]);
  };

  return (
    <Box>
      <DocumentPicker onSelect={add} showAddAnother={pending.length > 0} disabled={disabled} />
      {pending.length > 0 && (
        <Box sx={{ display: 'grid', gap: 1, mt: 2 }} component="ul" aria-label="Files to upload" style={{ padding: 0, margin: '16px 0 0' }}>
          {pending.map((doc) => (
            <Box
              component="li"
              key={doc.key}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, border: 1, borderColor: 'divider', borderRadius: 2, listStyle: 'none' }}
            >
              <PictureAsPdfOutlined color="error" />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{doc.file.name}</Typography>
                <Typography variant="caption" color="text.secondary">{formatFileSize(doc.file.size)}</Typography>
              </Box>
              <Chip size="small" label={DOCUMENT_TYPE_LABELS[doc.documentType]} />
              <IconButton
                size="small"
                color="error"
                aria-label={`Remove ${doc.file.name}`}
                onClick={() => onChange(pending.filter((d) => d.key !== doc.key))}
                disabled={disabled}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
