export type DocumentType = 'PURCHASE_BILL' | 'WARRANTY_CARD' | 'OTHER';

export interface ProductDocument {
  id: number;
  productId: number;
  fileName: string;
  fileType: string;
  documentType: DocumentType;
  fileSize: number;
  createdAt: string;
}

/** A file chosen in the form that has not been uploaded yet. */
export interface PendingDocument {
  key: string;
  file: File;
  documentType: DocumentType;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  PURCHASE_BILL: 'Purchase Bill',
  WARRANTY_CARD: 'Warranty Card',
  OTHER: 'Other',
};
