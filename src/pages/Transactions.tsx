import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Receipt, Filter, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  TransactionService, 
  CashFlowService, 
  BudgetService, 
  type Transaction, 
  type CashFlow, 
  type Budget 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    cash_flow_id: '',
    budget_id: '',
  });
  const [formData, setFormData] = useState({
    cash_flow_id: '',
    budget_id: '',
    description: '',
    amount: '',
    transaction_day: '',
  });
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
        search: search || undefined,
      };

      // Add filters
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.cash_flow_id) params.cash_flow_id = parseInt(filters.cash_flow_id);
      if (filters.budget_id) params.budget_id = parseInt(filters.budget_id);

      const response = await TransactionService.getAll(params);

      if (response.success) {
        const transactionData = response.data.transactions || response.data.transaction;
        setTransactions(Array.isArray(transactionData) ? transactionData : []);
        const pagination = response.data.pagination;
        if (pagination && typeof pagination === 'object' && 'totalItems' in pagination) {
          setTotal(pagination.totalItems);
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giao dịch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCashFlows = async () => {
    try {
      const response = await CashFlowService.getAll({ limit: 100 });
      if (response.success) {
        const cashFlowData = response.data.cashFlows || response.data.cashFlow;
        setCashFlows(Array.isArray(cashFlowData) ? cashFlowData : []);
      }
    } catch (error) {
      console.error('Error fetching cash flows:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await BudgetService.getAll({ limit: 100 });
      if (response.success) {
        const budgetData = response.data.budgets || response.data.budget;
        setBudgets(Array.isArray(budgetData) ? budgetData : []);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, search, filters]);

  useEffect(() => {
    fetchCashFlows();
    fetchBudgets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        cash_flow_id: parseInt(formData.cash_flow_id),
        budget_id: parseInt(formData.budget_id),
        amount: formData.amount, // Keep as string
      };

      if (editingTransaction) {
        const response = await TransactionService.update(editingTransaction.id, submitData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Cập nhật giao dịch thành công",
          });
        }
      } else {
        const response = await TransactionService.create(submitData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Tạo giao dịch thành công",
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingTransaction(null);
      setFormData({
        cash_flow_id: '',
        budget_id: '',
        description: '',
        amount: '',
        transaction_day: '',
      });
      fetchTransactions();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      cash_flow_id: transaction.cash_flow_id.toString(),
      budget_id: transaction.budget_id.toString(),
      description: transaction.description,
      amount: transaction.amount,
      transaction_day: transaction.transaction_day,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
    
    try {
      const response = await TransactionService.delete(id);
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa giao dịch thành công",
        });
        fetchTransactions();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingTransaction(null);
    setFormData({
      cash_flow_id: '',
      budget_id: '',
      description: '',
      amount: '',
      transaction_day: '',
    });
  };

  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      cash_flow_id: '',
      budget_id: '',
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numAmount);
  };

  const getAmountColor = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount >= 0 ? 'text-success' : 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Giao dịch</h1>
          <p className="text-muted-foreground">
            Quản lý các giao dịch tài chính trong hệ thống
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm giao dịch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
                </DialogTitle>
                <DialogDescription>
                  {editingTransaction 
                    ? 'Cập nhật thông tin giao dịch' 
                    : 'Nhập thông tin để tạo giao dịch mới'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="cash_flow_id">Dòng tiền</Label>
                  <Select value={formData.cash_flow_id} onValueChange={(value) => setFormData({ ...formData, cash_flow_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dòng tiền" />
                    </SelectTrigger>
                    <SelectContent>
                      {cashFlows.map((cashFlow) => (
                        <SelectItem key={cashFlow.id} value={cashFlow.id.toString()}>
                          {cashFlow.name} ({cashFlow.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget_id">Ngân sách</Label>
                  <Select value={formData.budget_id} onValueChange={(value) => setFormData({ ...formData, budget_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngân sách" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgets.map((budget) => (
                        <SelectItem key={budget.id} value={budget.id.toString()}>
                          {budget.name} ({budget.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả chi tiết về giao dịch"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Số tiền</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Nhập số tiền (số âm cho chi phí)"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transaction_day">Ngày giao dịch</Label>
                  <Input
                    id="transaction_day"
                    type="date"
                    value={formData.transaction_day}
                    onChange={(e) => setFormData({ ...formData, transaction_day: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingTransaction ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_date">Từ ngày</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">Đến ngày</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter_cash_flow">Dòng tiền</Label>
              <Select value={filters.cash_flow_id} onValueChange={(value) => setFilters({ ...filters, cash_flow_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả dòng tiền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả dòng tiền</SelectItem>
                  {cashFlows.map((cashFlow) => (
                    <SelectItem key={cashFlow.id} value={cashFlow.id.toString()}>
                      {cashFlow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter_budget">Ngân sách</Label>
              <Select value={filters.budget_id} onValueChange={(value) => setFilters({ ...filters, budget_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả ngân sách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả ngân sách</SelectItem>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id.toString()}>
                      {budget.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Danh sách giao dịch
          </CardTitle>
          <CardDescription>
            Tổng cộng {total} giao dịch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mô tả giao dịch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Đang tải...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Dòng tiền</TableHead>
                  <TableHead>Ngân sách</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Ngày giao dịch</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Không có giao dịch nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{transaction.description}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.CashFlow?.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.CashFlow?.Department?.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.Budget?.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.Budget?.BudgetType?.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${getAmountColor(transaction.amount)}`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.transaction_day).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;