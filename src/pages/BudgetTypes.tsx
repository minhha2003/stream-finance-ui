import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, CreditCard } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { BudgetTypeService, type BudgetType } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const BudgetTypes = () => {
  const [budgetTypes, setBudgetTypes] = useState<BudgetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudgetType, setEditingBudgetType] = useState<BudgetType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });
  const { toast } = useToast();

  const fetchBudgetTypes = async () => {
    try {
      setLoading(true);
      const response = await BudgetTypeService.getAll({
        page,
        limit: 10,
        search: search || undefined,
      });

      if (response.success) {
        const budgetTypeData = response.data.budgetTypes || response.data.budgetType;
        setBudgetTypes(Array.isArray(budgetTypeData) ? budgetTypeData : []);
        const pagination = response.data.pagination;
        if (pagination && typeof pagination === 'object' && 'totalItems' in pagination) {
          setTotal(pagination.totalItems);
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách loại ngân sách",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetTypes();
  }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBudgetType) {
        const response = await BudgetTypeService.update(editingBudgetType.id, formData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Cập nhật loại ngân sách thành công",
          });
        }
      } else {
        const response = await BudgetTypeService.create(formData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Tạo loại ngân sách thành công",
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingBudgetType(null);
      setFormData({ name: '' });
      fetchBudgetTypes();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (budgetType: BudgetType) => {
    setEditingBudgetType(budgetType);
    setFormData({ name: budgetType.name });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa loại ngân sách này?')) return;
    
    try {
      const response = await BudgetTypeService.delete(id);
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa loại ngân sách thành công",
        });
        fetchBudgetTypes();
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
    setEditingBudgetType(null);
    setFormData({ name: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Loại ngân sách</h1>
          <p className="text-muted-foreground">
            Quản lý các loại ngân sách trong hệ thống
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm loại ngân sách
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingBudgetType ? 'Sửa loại ngân sách' : 'Thêm loại ngân sách mới'}
                </DialogTitle>
                <DialogDescription>
                  {editingBudgetType 
                    ? 'Cập nhật thông tin loại ngân sách' 
                    : 'Nhập thông tin để tạo loại ngân sách mới'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên loại ngân sách</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Ngân sách hoạt động"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingBudgetType ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Danh sách loại ngân sách
          </CardTitle>
          <CardDescription>
            Tổng cộng {total} loại ngân sách
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm loại ngân sách..."
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
                  <TableHead>Tên loại ngân sách</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Không có loại ngân sách nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  budgetTypes.map((budgetType) => (
                    <TableRow key={budgetType.id}>
                      <TableCell className="font-medium">{budgetType.name}</TableCell>
                      <TableCell>
                        {new Date(budgetType.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        {new Date(budgetType.updatedAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(budgetType)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(budgetType.id)}
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

export default BudgetTypes;