import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { AddProductPage } from '../pages/AddProductPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EditProductPage } from '../pages/EditProductPage';
import { ExportPage } from '../pages/ExportPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { ProductsPage } from '../pages/ProductsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<AddProductPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="products/:id/edit" element={<EditProductPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
