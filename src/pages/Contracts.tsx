import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileSignature, MoreHorizontal, Eye, Pencil, Trash2, Send } from "lucide-react";
import { useContracts, useDeleteContract } from "@/hooks/useContracts";
import { getContractStatusColor, getContractStatusLabel } from "@/types/contract";
import { formatCurrency } from "@/types/database";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function Contracts() {
  const { data: contracts, isLoading } = useContracts();
  const deleteContract = useDeleteContract();
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    deleteContract.mutate(id);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">契約書</h1>
            <p className="text-muted-foreground">契約書の作成・管理・オンライン締結</p>
          </div>
          <Button asChild>
            <Link to="/contracts/new">
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>契約書一覧</CardTitle>
            <CardDescription>
              作成した契約書の一覧です
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : contracts && contracts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>契約番号</TableHead>
                    <TableHead>タイトル</TableHead>
                    <TableHead>取引先</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>発行日</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-sm">
                        {contract.contract_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {contract.title}
                      </TableCell>
                      <TableCell>
                        {contract.client?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(contract.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getContractStatusColor(contract.status)}>
                          {getContractStatusLabel(contract.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(contract.issue_date), 'yyyy/MM/dd', { locale: ja })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/contracts/${contract.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              詳細
                            </DropdownMenuItem>
                            {contract.status === 'draft' && (
                              <>
                                <DropdownMenuItem onClick={() => navigate(`/contracts/${contract.id}/edit`)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  編集
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Send className="h-4 w-4 mr-2" />
                                  署名依頼を送信
                                </DropdownMenuItem>
                              </>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  削除
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>契約書を削除しますか？</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    この操作は取り消せません。契約書「{contract.title}」を完全に削除します。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(contract.id)}>
                                    削除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileSignature className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">契約書がありません</h3>
                <p className="text-muted-foreground mt-2">
                  新しい契約書を作成して、オンラインで締結しましょう
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/contracts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    契約書を作成
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
