import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardService, type DashboardOverview, type TrendData } from '@/lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  Building2, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [overviewResponse, trendsResponse] = await Promise.all([
          DashboardService.getOverview(),
          DashboardService.getTrends({ period: 'month' })
        ]);

        if (overviewResponse.success) {
          setOverview(overviewResponse.data);
        }

        if (trendsResponse.success) {
          setTrends(trendsResponse.data.trends);
        }
      } catch (error) {
        toast({
          title: "Lỗi tải dữ liệu",
          description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan về tình hình tài chính và hoạt động
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số giao dịch
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.overview.totalTransactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Giao dịch trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng giá trị
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview?.overview.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng giá trị giao dịch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Phòng ban hoạt động
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.departmentStats.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Có giao dịch trong kỳ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Loại ngân sách
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.budgetTypeStats.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Được sử dụng trong kỳ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Stats */}
      {overview?.departmentStats && overview.departmentStats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo phòng ban</CardTitle>
              <CardDescription>
                Top phòng ban có giao dịch nhiều nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overview.departmentStats.slice(0, 5).map((dept, index) => (
                  <div key={dept['CashFlow.Department.id']} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{dept['CashFlow.Department.name']}</p>
                        <p className="text-sm text-muted-foreground">
                          {dept.transactionCount} giao dịch
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(parseFloat(dept.totalAmount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo loại ngân sách</CardTitle>
              <CardDescription>
                Phân bổ theo từng loại ngân sách
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overview.budgetTypeStats.map((budget, index) => (
                  <div key={budget['Budget.BudgetType.id']} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                        <span className="text-sm font-medium text-success">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{budget['Budget.BudgetType.name']}</p>
                        <p className="text-sm text-muted-foreground">
                          {budget.transactionCount} giao dịch
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(parseFloat(budget.totalAmount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trends */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng theo tháng</CardTitle>
            <CardDescription>
              Biến động giao dịch trong các tháng gần đây
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends.map((trend, index) => {
                const prevTrend = trends[index - 1];
                const currentAmount = parseFloat(trend.totalAmount);
                const prevAmount = prevTrend ? parseFloat(prevTrend.totalAmount) : 0;
                const change = prevAmount > 0 ? ((currentAmount - prevAmount) / prevAmount) * 100 : 0;
                const isPositive = change >= 0;

                return (
                  <div key={trend.period} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <p className="font-medium">
                          {new Date(trend.period + '-01').toLocaleDateString('vi-VN', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {trend.transactionCount} giao dịch
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(currentAmount)}
                        </p>
                        {index > 0 && (
                          <div className={`flex items-center gap-1 text-sm ${
                            isPositive ? 'text-success' : 'text-destructive'
                          }`}>
                            {isPositive ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {Math.abs(change).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;