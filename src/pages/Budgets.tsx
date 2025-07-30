import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, TrendingUp } from 'lucide-react';
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
import { BudgetService, BudgetTypeService, type Budget, type BudgetType } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetTypes, setBudgetTypes] = useState<BudgetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    budget_type_id: '',
  });
  const { toast } = useToast();

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await BudgetService.getAll({
        page,
        limit: 10,
        search: search || undefined,
      });

      if (response.success) {
        const budgetData = response.data.budgets || response.data.budget;
        setBudgets(Array.isArray(budgetData) ? budgetData : []);
        const pagination = response.data.pagination;
        if (pagination && typeof pagination === 'object' && 'totalItems' in pagination) {
          setTotal(pagination.totalItems);
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách ngân sách",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetTypes = async () => {
    try {
      const response = await BudgetTypeService.getAll({ limit: 100 });
      if (response.success) {
        const budgetTypeData = response.data.budgetTypes || response.data.budgetType;
        setBudgetTypes(Array.isArray(budgetTypeData) ? budgetTypeData : []);
      }
    } catch (error) {
      console.error('Error fetching budget types:', error);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [page, search]);

  useEffect(() => {
    fetchBudgetTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        budget_type_id: parseInt(formData.budget_type_id),
      };

      if (editingBudget) {
        const response = await BudgetService.update(editingBudget.id, submitData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Cập nhật ngân sách thành công",
          });
        }
      } else {
        const response = await BudgetService.create(submitData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Tạo ngân sách thành công",
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingBudget(null);
      setFormData({
        name: '',
        code: '',
        budget_type_id: '',
      });
      fetchBudgets();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      code: budget.code,
      budget_type_id: budget.budget_type_id.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) return;
    
    try {
      const response = await BudgetService.delete(id);
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa ngân sách thành công",
        });
        fetchBudgets();
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
    setEditingBudget(null);
    setFormData({
      name: '',
      code: '',
      budget_type_id: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Ngân sách</h1>
          <p className="text-muted-foreground">
            Quản lý các ngân sách trong hệ thống
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm ngân sách
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingBudget ? 'Sửa ngân sách' : 'Thêm ngân sách mới'}
                </DialogTitle>
                <DialogDescription>
                  {editingBudget 
                    ? 'Cập nhật thông tin ngân sách' 
                    : 'Nhập thông tin để tạo ngân sách mới'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên ngân sách</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Ngân sách Q1 2024 - Kế toán"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Mã ngân sách</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ví dụ: BUD-ACC-Q1-2024"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget_type_id">Loại ngân sách</Label>
                  <Select value={formData.budget_type_id} onValueChange={(value) => setFormData({ ...formData, budget_type_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại ngân sách" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingBudget ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Danh sách ngân sách
          </CardTitle>
          <CardDescription>
            Tổng cộng {total} ngân sách
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm ngân sách..."
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
                  <TableHead>Tên ngân sách</TableHead>
                  <TableHead>Mã ngân sách</TableHead>
                  <TableHead>Loại ngân sách</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Không có ngân sách nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  budgets.map((budget) => (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">{budget.name}</TableCell>
                      <TableCell>{budget.code}</TableCell>
                      <TableCell>{budget.BudgetType?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(budget.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(budget)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(budget.id)}
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

export default Budgets;