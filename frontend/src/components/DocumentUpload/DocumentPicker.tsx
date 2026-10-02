import AddIcon from '@mui/icons-material/Add';
import InsertDriveFileOutlined from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import { Box, Button, ButtonBase, Menu, MenuItem, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { DOCUMENT_TYPE_LABELS, type DocumentType } from '../../types/document';
import { ACCEPT_ATTR, validateDocumentFile } from '../../utils/documents';
import { useToast } from '../Common/ToastProvider';

interface Props {
  onSelect: (files: File[], type: DocumentType) => void;
  /** "cards" = the two dashed upload tiles from the form; "button" = a single menu button. */
  variant?: 'cards' | 'button';
  showAddAnother?: boolean;
  disabled?: boolean;
}

/** Picks files, validates type/size on the client and hands valid files to the parent. */
export function DocumentPicker({ onSelect, variant = 'cards', showAddAnother = false, disabled }: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<DocumentType>('OTHER');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const open = (type: DocumentType) => {
    typeRef.current = type;
    inputRef.current?.click();
  };

  const handleFiles = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    const valid: File[] = [];
    for (const file of files) {
      const error = validateDocumentFile(file);
      if (error) toast.error(error);
      else valid.push(file);
    }
    if (valid.length > 0) onSelect(valid, typeRef.current);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept={ACCEPT_ATTR}
        data-testid="document-file-input"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {variant === 'button' ? (
        <>
          <Button
            variant="outlined"
            startIcon={<UploadFileOutlined />}
            disabled={disabled}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            fullWidth
          >
            Upload Document
          </Button>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
              <MenuItem key={type} onClick={() => { setMenuAnchor(null); open(type); }}>
                {DOCUMENT_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <UploadTile label="Upload Bill" disabled={disabled} onClick={() => open('PURCHASE_BILL')} />
            <UploadTile label="Upload Warranty Card" disabled={disabled} onClick={() => open('WARRANTY_CARD')} />
          </Box>
          {showAddAnother && (
            <Box sx={{ textAlign: 'center', mt: 1.5 }}>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} disabled={disabled} onClick={() => open('OTHER')}>
                Add Another Document
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

function UploadTile({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, p: 1.5, textAlign: 'left',
        border: '1px dashed', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'primary.light',
      }}
    >
      <InsertDriveFileOutlined color="primary" />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
        <Typography variant="caption" color="text.secondary">PDF, JPG, PNG (Max 10MB)</Typography>
      </Box>
    </ButtonBase>
  );
}
