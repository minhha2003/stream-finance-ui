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
import { 
  CashFlowService, 
  DepartmentService, 
  CashFlowTypeService, 
  type CashFlow, 
  type Department, 
  type CashFlowType 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const CashFlows = () => {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cashFlowTypes, setCashFlowTypes] = useState<CashFlowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCashFlow, setEditingCashFlow] = useState<CashFlow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    deparment_id: '',
    cash_flow_type_id: '',
  });
  const { toast } = useToast();

  const fetchCashFlows = async () => {
    try {
      setLoading(true);
      const response = await CashFlowService.getAll({
        page,
        limit: 10,
        search: search || undefined,
      });

      if (response.success) {
        const cashFlowData = response.data.cashFlows || response.data.cashFlow;
        setCashFlows(Array.isArray(cashFlowData) ? cashFlowData : []);
        const pagination = response.data.pagination;
        if (pagination && typeof pagination === 'object' && 'totalItems' in pagination) {
          setTotal(pagination.totalItems);
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách dòng tiền",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await DepartmentService.getAll({ limit: 100 });
      if (response.success) {
        const departmentData = response.data.departments || response.data.department;
        setDepartments(Array.isArray(departmentData) ? departmentData : []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCashFlowTypes = async () => {
    try {
      const response = await CashFlowTypeService.getAll({ limit: 100 });
      if (response.success) {
        const cashFlowTypeData = response.data.cashFlowTypes || response.data.cashFlowType;
        setCashFlowTypes(Array.isArray(cashFlowTypeData) ? cashFlowTypeData : []);
      }
    } catch (error) {
      console.error('Error fetching cash flow types:', error);
    }
  };

  useEffect(() => {
    fetchCashFlows();
  }, [page, search]);

  useEffect(() => {
    fetchDepartments();
    fetchCashFlowTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        deparment_id: parseInt(formData.deparment_id),
        cash_flow_type_id: parseInt(formData.cash_flow_type_id),
      };

      if (editingCashFlow) {
        const response = await CashFlowService.update(editingCashFlow.id, submitData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Cập nhật dòng tiền thành công",
          });
        }
      } else {
        const response = await CashFlowService.create(submitData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Tạo dòng tiền thành công",
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingCashFlow(null);
      setFormData({
        name: '',
        code: '',
        deparment_id: '',
        cash_flow_type_id: '',
      });
      fetchCashFlows();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cashFlow: CashFlow) => {
    setEditingCashFlow(cashFlow);
    setFormData({
      name: cashFlow.name,
      code: cashFlow.code,
      deparment_id: cashFlow.deparment_id.toString(),
      cash_flow_type_id: cashFlow.cash_flow_type_id.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dòng tiền này?')) return;
    
    try {
      const response = await CashFlowService.delete(id);
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa dòng tiền thành công",
        });
        fetchCashFlows();
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
    setEditingCashFlow(null);
    setFormData({
      name: '',
      code: '',
      deparment_id: '',
      cash_flow_type_id: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Dòng tiền</h1>
          <p className="text-muted-foreground">
            Quản lý các dòng tiền theo phòng ban và loại dòng tiền
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm dòng tiền
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCashFlow ? 'Sửa dòng tiền' : 'Thêm dòng tiền mới'}
                </DialogTitle>
                <DialogDescription>
                  {editingCashFlow 
                    ? 'Cập nhật thông tin dòng tiền' 
                    : 'Nhập thông tin để tạo dòng tiền mới'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên dòng tiền</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Thu nhập từ bán hàng trực tiếp"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Mã dòng tiền</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ví dụ: CF-DIRECT-SALES"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deparment_id">Phòng ban</Label>
                  <Select value={formData.deparment_id} onValueChange={(value) => setFormData({ ...formData, deparment_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cash_flow_type_id">Loại dòng tiền</Label>
                  <Select value={formData.cash_flow_type_id} onValueChange={(value) => setFormData({ ...formData, cash_flow_type_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại dòng tiền" />
                    </SelectTrigger>
                    <SelectContent>
                      {cashFlowTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name} ({type.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingCashFlow ? 'Cập nhật' : 'Tạo mới'}
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
            Danh sách dòng tiền
          </CardTitle>
          <CardDescription>
            Tổng cộng {total} dòng tiền
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm dòng tiền..."
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
                  <TableHead>Tên dòng tiền</TableHead>
                  <TableHead>Mã dòng tiền</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Loại dòng tiền</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashFlows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Không có dòng tiền nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  cashFlows.map((cashFlow) => (
                    <TableRow key={cashFlow.id}>
                      <TableCell className="font-medium">{cashFlow.name}</TableCell>
                      <TableCell>{cashFlow.code}</TableCell>
                      <TableCell>{cashFlow.Department?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cashFlow.CashFlowType?.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{cashFlow.CashFlowType?.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(cashFlow.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(cashFlow)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(cashFlow.id)}
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

export default CashFlows;