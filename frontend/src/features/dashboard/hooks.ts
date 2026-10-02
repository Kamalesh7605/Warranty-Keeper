import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../services/productApi';

export const useDashboardSummary = () =>
  useQuery({ queryKey: ['dashboard', 'summary'], queryFn: productApi.dashboardSummary });

export const useExpiringProducts = () =>
  useQuery({ queryKey: ['dashboard', 'expiring'], queryFn: productApi.dashboardExpiring });
