import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, FileText, Play, Trash2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJournalTemplates, useCreateJournalTemplate, useApplyJournalTemplate, useAccounts } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { toast } from 'sonner';

interface TemplateLine {
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
}

export default function AccountingTemplates() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [applyDate, setApplyDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    template_name: '',
    description: '',
    is_recurring: false,
    recurrence_pattern: '',
    lines: [{ account_id: '', debit_amount: 0, credit_amount: 0, description: '' }] as TemplateLine[],
  });

  const { data: templates, isLoading } = useJournalTemplates();
  const { data: accounts } = useAccounts();
  const createTemplate = useCreateJournalTemplate();
  const applyTemplate = useApplyJournalTemplate();

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account_id: '', debit_amount: 0, credit_amount: 0, description: '' }],
    });
  };

  const handleRemoveLine = (index: number) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const handleLineChange = (index: number, field: keyof TemplateLine, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const handleCreate = async () => {
    if (!formData.template_name || formData.lines.some(l => !l.account_id)) {
      toast.error('テンプレート名と勘定科目を入力してください');
      return;
    }

    const totalDebit = formData.lines.reduce((sum, l) => sum + l.debit_amount, 0);
    const totalCredit = formData.lines.reduce((sum, l) => sum + l.credit_amount, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error('借方と貸方の合計が一致しません');
      return;
    }

    try {
      await createTemplate.mutateAsync(formData);
      toast.success('テンプレートを作成しました');
      setIsAddOpen(false);
      setFormData({
        template_name: '',
        description: '',
        is_recurring: false,
        recurrence_pattern: '',
        lines: [{ account_id: '', debit_amount: 0, credit_amount: 0, description: '' }],
      });
    } catch (error) {
      toast.error('テンプレートの作成に失敗しました');
    }
  };

  const handleApply = async () => {
    if (!selectedTemplate) return;

    try {
      await applyTemplate.mutateAsync({
        templateId: selectedTemplate.id,
        entryDate: applyDate,
      });
      toast.success('テンプレートから仕訳を作成しました');
      setIsApplyOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error('仕訳の作成に失敗しました');
    }
  };

  const totalDebit = formData.lines.reduce((sum, l) => sum + (l.debit_amount || 0), 0);
  const totalCredit = formData.lines.reduce((sum, l) => sum + (l.credit_amount || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/accounting">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">仕訳テンプレート</h1>
              <p className="text-muted-foreground">よく使う仕訳パターンを登録</p>
            </div>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                テンプレートを作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>仕訳テンプレートを作成</DialogTitle>
                <DialogDescription>繰り返し使用する仕訳パターンを登録します</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>テンプレート名 *</Label>
                    <Input
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                      placeholder="例: 月末家賃支払"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.is_recurring}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                      />
                      <Label>定期実行</Label>
                    </div>
                    {formData.is_recurring && (
                      <Select
                        value={formData.recurrence_pattern}
                        onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="頻度" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">毎月</SelectItem>
                          <SelectItem value="quarterly">四半期</SelectItem>
                          <SelectItem value="yearly">年次</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <div>
                  <Label>説明</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="テンプレートの説明"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>仕訳明細</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                      <Plus className="h-4 w-4 mr-1" />
                      行を追加
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>勘定科目</TableHead>
                        <TableHead>借方</TableHead>
                        <TableHead>貸方</TableHead>
                        <TableHead>摘要</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={line.account_id}
                              onValueChange={(value) => handleLineChange(index, 'account_id', value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="選択" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts?.map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.account_code} {account.account_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={line.debit_amount || ''}
                              onChange={(e) => handleLineChange(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={line.credit_amount || ''}
                              onChange={(e) => handleLineChange(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={line.description}
                              onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell>
                            {formData.lines.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLine(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">合計</TableCell>
                        <TableCell className="font-bold">{formatCurrency(totalDebit)}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(totalCredit)}</TableCell>
                        <TableCell colSpan={2}>
                          {Math.abs(totalDebit - totalCredit) > 0.01 && (
                            <span className="text-destructive text-sm">
                              差額: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>キャンセル</Button>
                <Button onClick={handleCreate} disabled={createTemplate.isPending}>作成</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle>テンプレート一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">読み込み中...</p>
            ) : templates && templates.length > 0 ? (
              <div className="space-y-4">
                {templates.map((template: any) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-lg">{template.template_name}</CardTitle>
                            {template.description && (
                              <CardDescription>{template.description}</CardDescription>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {template.is_recurring && (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.recurrence_pattern === 'monthly' ? '毎月' :
                                template.recurrence_pattern === 'quarterly' ? '四半期' : '年次'}
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsApplyOpen(true);
                            }}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            適用
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>勘定科目</TableHead>
                            <TableHead className="text-right">借方</TableHead>
                            <TableHead className="text-right">貸方</TableHead>
                            <TableHead>摘要</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {template.lines?.map((line: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>
                                {line.account?.account_code} {line.account?.account_name}
                              </TableCell>
                              <TableCell className="text-right">
                                {line.debit_amount > 0 && formatCurrency(line.debit_amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                {line.credit_amount > 0 && formatCurrency(line.credit_amount)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">{line.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">テンプレートがありません</p>
                <p className="text-sm text-muted-foreground mt-1">
                  よく使う仕訳パターンを登録して効率化しましょう
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Apply Dialog */}
        <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>テンプレートを適用</DialogTitle>
              <DialogDescription>
                {selectedTemplate?.template_name} から仕訳を作成します
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label>仕訳日付</Label>
              <Input
                type="date"
                value={applyDate}
                onChange={(e) => setApplyDate(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApplyOpen(false)}>キャンセル</Button>
              <Button onClick={handleApply} disabled={applyTemplate.isPending}>仕訳を作成</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
