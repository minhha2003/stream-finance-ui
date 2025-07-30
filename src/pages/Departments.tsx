import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
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
import { DepartmentService, type Department } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code_department: '',
    composite_code: '',
    address: '',
    address_code: '',
  });
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await DepartmentService.getAll({
        page,
        limit: 10,
        search: search || undefined,
      });

      if (response.success) {
        const departmentData = response.data.departments || response.data.department;
        setDepartments(Array.isArray(departmentData) ? departmentData : []);
        const pagination = response.data.pagination;
        if (pagination && typeof pagination === 'object' && 'totalItems' in pagination) {
          setTotal(pagination.totalItems);
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách phòng ban",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDepartment) {
        const response = await DepartmentService.update(editingDepartment.id, formData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Cập nhật phòng ban thành công",
          });
        }
      } else {
        const response = await DepartmentService.create(formData);
        if (response.success) {
          toast({
            title: "Thành công",
            description: "Tạo phòng ban thành công",
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingDepartment(null);
      setFormData({
        name: '',
        code_department: '',
        composite_code: '',
        address: '',
        address_code: '',
      });
      fetchDepartments();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code_department: department.code_department,
      composite_code: department.composite_code,
      address: department.address,
      address_code: department.address_code,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) return;
    
    try {
      const response = await DepartmentService.delete(id);
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Xóa phòng ban thành công",
        });
        fetchDepartments();
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
    setEditingDepartment(null);
    setFormData({
      name: '',
      code_department: '',
      composite_code: '',
      address: '',
      address_code: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Phòng ban</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin các phòng ban trong công ty
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm phòng ban
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingDepartment ? 'Sửa phòng ban' : 'Thêm phòng ban mới'}
                </DialogTitle>
                <DialogDescription>
                  {editingDepartment 
                    ? 'Cập nhật thông tin phòng ban' 
                    : 'Nhập thông tin để tạo phòng ban mới'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên phòng ban</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Phòng Kế toán"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code_department">Mã phòng ban</Label>
                  <Input
                    id="code_department"
                    value={formData.code_department}
                    onChange={(e) => setFormData({ ...formData, code_department: e.target.value })}
                    placeholder="Ví dụ: ACC001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="composite_code">Mã tổng hợp</Label>
                  <Input
                    id="composite_code"
                    value={formData.composite_code}
                    onChange={(e) => setFormData({ ...formData, composite_code: e.target.value })}
                    placeholder="Ví dụ: ACC-HQ-001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ví dụ: 123 Nguyễn Văn Linh, Q7, TP.HCM"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address_code">Mã địa chỉ</Label>
                  <Input
                    id="address_code"
                    value={formData.address_code}
                    onChange={(e) => setFormData({ ...formData, address_code: e.target.value })}
                    placeholder="Ví dụ: HCM-Q7-001"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingDepartment ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Danh sách phòng ban
          </CardTitle>
          <CardDescription>
            Tổng cộng {total} phòng ban
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phòng ban..."
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
                  <TableHead>Tên phòng ban</TableHead>
                  <TableHead>Mã phòng ban</TableHead>
                  <TableHead>Mã tổng hợp</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Mã địa chỉ</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Không có phòng ban nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.code_department}</TableCell>
                      <TableCell>{dept.composite_code}</TableCell>
                      <TableCell>{dept.address}</TableCell>
                      <TableCell>{dept.address_code}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(dept)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(dept.id)}
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

export default Departments;