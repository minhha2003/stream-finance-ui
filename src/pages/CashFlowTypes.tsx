import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ArrowLeftRight, ChevronRight, ChevronDown } from 'lucide-react';
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
import { CashFlowTypeService, type CashFlowType } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const CashFlowTypes = () => {
  const [cashFlowTypes, setCashFlowTypes] = useState<CashFlowType[]>([]);
  const [allCashFlowTypes, setAllCashFlowTypes] = useState<CashFlowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCashFlowType, setEditingCashFlowType] = useState<CashFlowType | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    parentId: '',
  });
  const { toast } = useToast();

  const fetchCashFlowTypes = async () => {
    try {
      setLoading(true);
      const response = await CashFlowTypeService.getAll({
        page,
        limit: 10,
        search: search || undefined,
      });

      if (response.success) {
        const cashFlowTypeData = response.data.cashFlowTypes || response.data.cashFlowType;
        setCashFlowTypes(Array.isArray(cashFlowTypeData) ? cashFlowTypeData : []);
        const pagination = response.data.pagination;
        if (pagination && typeof pagination === 'object' && 'totalItems' in pagination) {
          setTotal(pagination.totalItems);
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách loại dòng tiền",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCashFlowTypes = async () => {
    try {
      const response = await CashFlowTypeService.getAll({ limit: 100 });
      if (response.success) {
        const cashFlowTypeData = response.data.cashFlowTypes || response.data.cashFlowType;
        setAllCashFlowTypes(Array.isArray(cashFlowTypeData) ? cashFlowTypeData : []);
      }
    } catch (error) {
      console.error('Error fetching all cash flow types:', error);
    }
  };

  useEffect(() => {
    fetchCashFlowTypes();
  }, [page, search]);

  useEffect(() => {
    fetchAllCashFlowTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
      };

      if (editingCashFlowType) {
        const response = await CashFlowTypeService.update(editingCashFlowType.id, submitData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Cập nhật loại dòng tiền thành công",
          });
        }
      } else {
        const response = await CashFlowTypeService.create(submitData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Tạo loại dòng tiền thành công",
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingCashFlowType(null);
      setFormData({
        name: '',
        code: '',
        parentId: '',
      });
      fetchCashFlowTypes();
      fetchAllCashFlowTypes();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cashFlowType: CashFlowType) => {
    setEditingCashFlowType(cashFlowType);
    setFormData({
      name: cashFlowType.name,
      code: cashFlowType.code,
      parentId: cashFlowType.parentId?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa loại dòng tiền này?')) return;
    
    try {
      const response = await CashFlowTypeService.delete(id);
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa loại dòng tiền thành công",
        });
        fetchCashFlowTypes();
        fetchAllCashFlowTypes();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderCashFlowTypeRow = (cashFlowType: CashFlowType, level = 0) => {
    const hasChildren = cashFlowType.children && cashFlowType.children.length > 0;
    const isExpanded = expandedItems.has(cashFlowType.id);

    return (
      <>
        <TableRow key={cashFlowType.id}>
          <TableCell>
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(cashFlowType.id)}
                  className="p-0 h-auto mr-2"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <span className="font-medium">{cashFlowType.name}</span>
            </div>
          </TableCell>
          <TableCell>{cashFlowType.code}</TableCell>
          <TableCell>{cashFlowType.Parent?.name || 'Gốc'}</TableCell>
          <TableCell>
            {new Date(cashFlowType.createdAt).toLocaleDateString('vi-VN')}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(cashFlowType)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(cashFlowType.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && 
          cashFlowType.children!.map((child) => renderCashFlowTypeRow(child, level + 1))
        }
      </>
    );
  };

  const resetForm = () => {
    setEditingCashFlowType(null);
    setFormData({
      name: '',
      code: '',
      parentId: '',
    });
  };

  const parentOptions = allCashFlowTypes.filter(type => !type.parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Loại dòng tiền</h1>
          <p className="text-muted-foreground">
            Quản lý các loại dòng tiền theo cấu trúc phân cấp
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm loại dòng tiền
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCashFlowType ? 'Sửa loại dòng tiền' : 'Thêm loại dòng tiền mới'}
                </DialogTitle>
                <DialogDescription>
                  {editingCashFlowType 
                    ? 'Cập nhật thông tin loại dòng tiền' 
                    : 'Nhập thông tin để tạo loại dòng tiền mới'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên loại dòng tiền</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Dòng tiền hoạt động"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Mã loại dòng tiền</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ví dụ: CFT-OPR"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parentId">Loại cha (tùy chọn)</Label>
                  <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại cha (để trống nếu là gốc)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Không có (Loại gốc)</SelectItem>
                      {parentOptions.map((type) => (
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
                  {editingCashFlowType ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Danh sách loại dòng tiền
          </CardTitle>
          <CardDescription>
            Tổng cộng {total} loại dòng tiền (có cấu trúc phân cấp)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm loại dòng tiền..."
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
                  <TableHead>Tên loại dòng tiền</TableHead>
                  <TableHead>Mã loại</TableHead>
                  <TableHead>Loại cha</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashFlowTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Không có loại dòng tiền nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  cashFlowTypes.map((cashFlowType) => renderCashFlowTypeRow(cashFlowType))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlowTypes;