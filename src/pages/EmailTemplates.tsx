import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Send,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'invoice' | 'reminder' | 'notification' | 'marketing' | 'hr';
  variables: string[];
  lastUsed?: Date;
  useCount: number;
  createdAt: Date;
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: '請求書送付',
    subject: '【{{company_name}}】ご請求書のご案内 {{invoice_number}}',
    body: `{{client_name}} 様

いつもお世話になっております。
{{company_name}}です。

下記の通りご請求書を送付いたします。

請求書番号: {{invoice_number}}
請求金額: ¥{{amount}}
お支払期限: {{due_date}}

ご確認のほど、よろしくお願いいたします。

-----
{{company_name}}
{{company_email}}`,
    category: 'invoice',
    variables: ['client_name', 'company_name', 'invoice_number', 'amount', 'due_date', 'company_email'],
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    useCount: 156,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: '支払期限リマインダー',
    subject: '【重要】お支払い期限のお知らせ {{invoice_number}}',
    body: `{{client_name}} 様

いつもお世話になっております。
{{company_name}}です。

下記ご請求書のお支払い期限が近づいております。

請求書番号: {{invoice_number}}
請求金額: ¥{{amount}}
お支払期限: {{due_date}}

お支払いがお済みの場合は、本メールをご容赦ください。

ご不明な点がございましたら、お気軽にお問い合わせください。

-----
{{company_name}}`,
    category: 'reminder',
    variables: ['client_name', 'company_name', 'invoice_number', 'amount', 'due_date'],
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24),
    useCount: 45,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    name: '入金確認',
    subject: '【{{company_name}}】ご入金確認のお知らせ',
    body: `{{client_name}} 様

いつもお世話になっております。
{{company_name}}です。

下記のご入金を確認いたしました。

請求書番号: {{invoice_number}}
入金日: {{payment_date}}
入金金額: ¥{{amount}}

ありがとうございました。
今後ともよろしくお願いいたします。

-----
{{company_name}}`,
    category: 'notification',
    variables: ['client_name', 'company_name', 'invoice_number', 'payment_date', 'amount'],
    lastUsed: new Date(Date.now() - 1000 * 60 * 30),
    useCount: 89,
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '4',
    name: '見積書送付',
    subject: '【{{company_name}}】お見積書のご案内 {{estimate_number}}',
    body: `{{client_name}} 様

いつもお世話になっております。
{{company_name}}です。

ご依頼いただきましたお見積書を送付いたします。

見積番号: {{estimate_number}}
見積金額: ¥{{amount}}
有効期限: {{valid_until}}

ご検討のほど、よろしくお願いいたします。

-----
{{company_name}}`,
    category: 'invoice',
    variables: ['client_name', 'company_name', 'estimate_number', 'amount', 'valid_until'],
    useCount: 67,
    createdAt: new Date('2024-04-01'),
  },
  {
    id: '5',
    name: '休暇承認通知',
    subject: '【人事】休暇申請が承認されました',
    body: `{{employee_name}} 様

休暇申請が承認されましたのでお知らせします。

休暇種別: {{leave_type}}
期間: {{start_date}} 〜 {{end_date}}
日数: {{days}}日

ご不明な点がございましたら、人事部までお問い合わせください。

-----
人事部`,
    category: 'hr',
    variables: ['employee_name', 'leave_type', 'start_date', 'end_date', 'days'],
    useCount: 23,
    createdAt: new Date('2024-06-01'),
  },
];

const categoryLabels: Record<EmailTemplate['category'], { label: string; icon: typeof Mail }> = {
  invoice: { label: '請求・見積', icon: FileText },
  reminder: { label: 'リマインダー', icon: Clock },
  notification: { label: '通知', icon: CheckCircle },
  marketing: { label: 'マーケティング', icon: Mail },
  hr: { label: '人事', icon: AlertCircle },
};

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'invoice' as EmailTemplate['category'],
  });

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error('必須項目を入力してください');
      return;
    }

    // Extract variables from template
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    const fullText = formData.subject + formData.body;
    while ((match = variableRegex.exec(fullText)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? { ...t, ...formData, variables }
            : t
        )
      );
      toast.success('テンプレートを更新しました');
    } else {
      const newTemplate: EmailTemplate = {
        id: crypto.randomUUID(),
        ...formData,
        variables,
        useCount: 0,
        createdAt: new Date(),
      };
      setTemplates((prev) => [newTemplate, ...prev]);
      toast.success('テンプレートを作成しました');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      category: 'invoice',
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
    });
    setDialogOpen(true);
  };

  const handleDelete = (template: EmailTemplate) => {
    setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    toast.success(`${template.name}を削除しました`);
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (コピー)`,
      useCount: 0,
      createdAt: new Date(),
      lastUsed: undefined,
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    toast.success('テンプレートを複製しました');
  };

  const totalUse = templates.reduce((sum, t) => sum + t.useCount, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="h-8 w-8" />
              メールテンプレート
            </h1>
            <p className="text-muted-foreground">
              {templates.length}件のテンプレート
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                テンプレート作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'テンプレートを編集' : 'テンプレートを作成'}
                </DialogTitle>
                <DialogDescription>
                  変数は {'{{variable_name}}'} 形式で挿入できます
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>テンプレート名 *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例: 請求書送付"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>カテゴリ</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as EmailTemplate['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>件名 *</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="例: 【{{company_name}}】ご請求書のご案内"
                  />
                </div>
                <div className="space-y-2">
                  <Label>本文 *</Label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-2">利用可能な変数:</p>
                  <p className="text-muted-foreground">
                    {'{{client_name}}'}, {'{{company_name}}'}, {'{{invoice_number}}'}, {'{{amount}}'}, {'{{due_date}}'}, など
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSave}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総テンプレート数</CardDescription>
              <CardTitle className="text-2xl">{templates.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総使用回数</CardDescription>
              <CardTitle className="text-2xl">{totalUse}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>請求・見積</CardDescription>
              <CardTitle className="text-2xl">
                {templates.filter((t) => t.category === 'invoice').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>リマインダー</CardDescription>
              <CardTitle className="text-2xl">
                {templates.filter((t) => t.category === 'reminder').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Templates by Category */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">すべて ({templates.length})</TabsTrigger>
            {Object.entries(categoryLabels).map(([key, { label }]) => {
              const count = templates.filter((t) => t.category === key).length;
              if (count === 0) return null;
              return (
                <TabsTrigger key={key} value={key}>
                  {label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <Card key={template.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {categoryLabels[template.category].label}
                        </Badge>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {template.subject}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDuplicate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(template)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>使用回数: {template.useCount}</span>
                      <span>
                        {template.lastUsed
                          ? `最終使用: ${template.lastUsed.toLocaleDateString('ja-JP')}`
                          : '未使用'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.variables.slice(0, 4).map((v) => (
                        <Badge key={v} variant="secondary" className="text-xs">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                      {template.variables.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.variables.length - 4}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {Object.keys(categoryLabels).map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {templates
                  .filter((t) => t.category === category)
                  .map((template) => (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {template.subject}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handlePreview(template)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          使用回数: {template.useCount}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>プレビュー: {selectedTemplate?.name}</DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">件名:</p>
                  <p className="font-medium">{selectedTemplate.subject}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">本文:</p>
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {selectedTemplate.body}
                  </pre>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">変数:</span>
                  {selectedTemplate.variables.map((v) => (
                    <Badge key={v} variant="outline">
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                閉じる
              </Button>
              <Button onClick={() => selectedTemplate && handleEdit(selectedTemplate)}>
                <Edit className="mr-2 h-4 w-4" />
                編集
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
