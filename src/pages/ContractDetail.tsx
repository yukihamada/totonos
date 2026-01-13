import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useContract, useContractItems, useUpdateContract } from "@/hooks/useContracts";
import { getContractStatusColor, getContractStatusLabel } from "@/types/contract";
import { formatCurrency } from "@/types/database";
import { Link, useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, Pencil, Send, FileCheck, Shield, Clock, User, Building, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contract, isLoading } = useContract(id!);
  const { data: items } = useContractItems(id!);
  const updateContract = useUpdateContract();

  const handleSendForSignature = async () => {
    if (!contract?.client?.email) {
      toast.error("取引先のメールアドレスが設定されていません");
      return;
    }
    
    updateContract.mutate(
      { id: contract.id, status: 'sent' },
      {
        onSuccess: () => {
          toast.success("署名依頼を送信しました（デモ）");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!contract) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">契約書が見つかりません</p>
          <Button className="mt-4" asChild>
            <Link to="/contracts">契約書一覧へ</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const issuerSignature = contract.signatures?.find((s) => s.signatory_type === "issuer");
  const recipientSignature = contract.signatures?.find((s) => s.signatory_type === "recipient");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/contracts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{contract.title}</h1>
                <Badge className={getContractStatusColor(contract.status)}>
                  {getContractStatusLabel(contract.status)}
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono">{contract.contract_number}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {contract.status === "draft" && (
              <>
                <Button variant="outline" asChild>
                  <Link to={`/contracts/${contract.id}/edit`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    編集
                  </Link>
                </Button>
                <Button onClick={handleSendForSignature}>
                  <Send className="h-4 w-4 mr-2" />
                  署名依頼を送信
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>契約内容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contract.content && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">概要</h4>
                    <p className="whitespace-pre-wrap">{contract.content}</p>
                  </div>
                )}

                {items && items.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">契約条項</h4>
                    {items.map((item, index) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <h5 className="font-medium">
                          第{index + 1}条 {item.title}
                        </h5>
                        <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  契約情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">取引先:</span>
                  <span className="font-medium">{contract.client?.name || "-"}</span>
                </div>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">契約金額</span>
                  <p className="text-2xl font-bold">{formatCurrency(contract.total_amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    (税抜 {formatCurrency(contract.amount)})
                  </p>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">発行日:</span>
                  <span>{format(new Date(contract.issue_date), "yyyy年MM月dd日", { locale: ja })}</span>
                </div>
                {contract.valid_until && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">有効期限:</span>
                    <span>{format(new Date(contract.valid_until), "yyyy年MM月dd日", { locale: ja })}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  署名状況
                </CardTitle>
                <CardDescription>契約書の署名状況を確認できます</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>発行者（あなた）</span>
                  </div>
                  {issuerSignature?.signed_at ? (
                    <Badge className="bg-chart-2/20 text-chart-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      署名済み
                    </Badge>
                  ) : (
                    <Badge variant="outline">未署名</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>取引先</span>
                  </div>
                  {recipientSignature?.signed_at ? (
                    <Badge className="bg-chart-2/20 text-chart-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      署名済み
                    </Badge>
                  ) : (
                    <Badge variant="outline">未署名</Badge>
                  )}
                </div>

                {contract.status === "signed" && (
                  <div className="p-3 border border-chart-2 rounded-lg bg-chart-2/10">
                    <div className="flex items-center gap-2 text-chart-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">契約締結完了</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      この契約書は両者によって署名され、法的に有効です。
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
