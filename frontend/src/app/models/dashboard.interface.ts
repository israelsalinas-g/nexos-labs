export interface DashboardCard {
  name: string;
  value: number;
  icon: string;
  color: string;
  description: string;
  trend?: string;
  trendPercent?: number;
}
