import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";

const departments = [
  "開発部",
  "プロダクト部",
  "マーケティング部",
  "営業部",
  "サポート部",
  "人事部",
  "経理部",
  "総務部",
];

const employmentTypes = [
  { value: "fulltime", label: "正社員" },
  { value: "contract", label: "契約社員" },
  { value: "parttime", label: "パートタイム" },
  { value: "intern", label: "インターン" },
];

const locations = [
  "東京",
  "大阪",
  "名古屋",
  "福岡",
  "リモート",
  "ハイブリッド",
];

export default function JobPostingNew() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [isRemoteOk, setIsRemoteOk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const handleRemoveRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const handleRequirementChange = (index: number, value: string) => {
    setRequirements(requirements.map((r, i) => (i === index ? value : r)));
  };

  const handleAddBenefit = () => {
    setBenefits([...benefits, ""]);
  };

  const handleRemoveBenefit = (index: number) => {
    if (benefits.length > 1) {
      setBenefits(benefits.filter((_, i) => i !== index));
    }
  };

  const handleBenefitChange = (index: number, value: string) => {
    setBenefits(benefits.map((b, i) => (i === index ? value : b)));
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && (!title || !department || !employmentType)) {
      toast.error("必須項目を入力してください");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(isDraft ? "下書きを保存しました" : "求人を公開しました");
    navigate("/job-postings");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/job-postings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">新規求人作成</h1>
            <p className="text-muted-foreground">
              新しい求人を作成します
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              求人の基本情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                求人タイトル <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：フロントエンドエンジニア"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  部署 <span className="text-red-500">*</span>
                </Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="部署を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  雇用形態 <span className="text-red-500">*</span>
                </Label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="雇用形態を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>勤務地</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="勤務地を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="remote"
                  checked={isRemoteOk}
                  onCheckedChange={setIsRemoteOk}
                />
                <Label htmlFor="remote">リモートワーク可</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>給与レンジ（年収）</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    万円
                  </span>
                </div>
                <span className="text-muted-foreground">〜</span>
                <div className="relative flex-1">
                  <Input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="800"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    万円
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardHeader>
            <CardTitle>職務内容</CardTitle>
            <CardDescription>
              仕事内容の詳細を記載してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="このポジションでの主な業務内容、期待される成果、チームの構成などを記載してください..."
              rows={8}
            />
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>応募要件</CardTitle>
            <CardDescription>
              必須スキルや経験を記載してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder="例：React/TypeScriptでの開発経験3年以上"
                />
                {requirements.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRequirement(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRequirement}
            >
              <Plus className="h-4 w-4 mr-2" />
              要件を追加
            </Button>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>待遇・福利厚生</CardTitle>
            <CardDescription>
              提供する福利厚生を記載してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  placeholder="例：各種社会保険完備"
                />
                {benefits.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBenefit(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddBenefit}>
              <Plus className="h-4 w-4 mr-2" />
              待遇を追加
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            下書き保存
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
            {isSubmitting ? "処理中..." : "求人を公開"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
