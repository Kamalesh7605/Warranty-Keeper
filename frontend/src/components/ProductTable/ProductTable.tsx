import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import {
  Box, Card, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { Product } from '../../types/product';
import { formatDate } from '../../utils/format';
import { ProductAvatar } from '../Common/ProductAvatar';
import { WarrantyStatusBadge } from '../WarrantyStatus/WarrantyStatusBadge';

interface Props {
  products: Product[];
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, onDelete }: Props) {
  return (
    <Card>
      <TableContainer>
        <Table aria-label="Products">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Category</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Purchase Date</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} hover sx={{ transition: 'background .15s' }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ProductAvatar name={p.name} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography component={RouterLink} to={`/products/${p.id}`} variant="body2" sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                        {p.name}
                      </Typography>
                      {p.brand && <Typography variant="caption" color="text.secondary" display="block">{p.brand}</Typography>}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{p.categoryName}</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{formatDate(p.purchaseDate)}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{formatDate(p.warrantyExpiryDate)}</TableCell>
                <TableCell><WarrantyStatusBadge status={p.warrantyStatus} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="View">
                    <IconButton size="small" color="primary" component={RouterLink} to={`/products/${p.id}`} aria-label={`View ${p.name}`}>
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" color="primary" component={RouterLink} to={`/products/${p.id}/edit`} aria-label={`Edit ${p.name}`}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => onDelete(p)} aria-label={`Delete ${p.name}`}>
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
