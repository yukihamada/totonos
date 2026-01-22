import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ArrowLeft, CalendarIcon, X, Check, Palette } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreateProject } from "@/hooks/useProjects";
import { useCurrentCompany } from "@/hooks/useCompany";

const projectColors = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B",
  "#10B981", "#06B6D4", "#6366F1", "#84CC16", "#F97316",
];

// Mock users for member selection (in real app, fetch from profiles table)
const mockUsers = [
  { id: "1", name: "山田太郎", avatar: "YT", department: "営業部" },
  { id: "2", name: "鈴木花子", avatar: "SH", department: "デザイン部" },
  { id: "3", name: "田中次郎", avatar: "TJ", department: "開発部" },
  { id: "4", name: "佐藤美咲", avatar: "SM", department: "マーケティング部" },
  { id: "5", name: "高橋健太", avatar: "TK", department: "開発部" },
];

export default function ProjectNew() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const { data: company } = useCurrentCompany();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [color, setColor] = useState(projectColors[0]);
  const [selectedMembers, setSelectedMembers] = useState<typeof mockUsers>([]);
  const [memberSearchOpen, setMemberSearchOpen] = useState(false);

  const handleAddMember = (user: typeof mockUsers[0]) => {
    if (!selectedMembers.find((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setMemberSearchOpen(false);
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("プロジェクト名を入力してください");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("開始日と終了日を選択してください");
      return;
    }
    if (startDate > endDate) {
      toast.error("終了日は開始日より後に設定してください");
      return;
    }

    try {
      await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        color,
        status: 'planning',
        company_id: company?.id || null,
        organization_id: null,
        budget: null,
        client_id: null,
      });
      navigate("/projects");
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">新規プロジェクト</h1>
            <p className="text-muted-foreground">
              新しいプロジェクトを作成します
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>プロジェクト情報</CardTitle>
            <CardDescription>
              プロジェクトの基本情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name and Color */}
            <div className="space-y-2">
              <Label htmlFor="name">
                プロジェクト名 <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例：新製品ローンチキャンペーン"
                  className="flex-1"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      style={{ backgroundColor: color }}
                    >
                      <Palette className="h-4 w-4 text-white" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3">
                    <div className="grid grid-cols-5 gap-2">
                      {projectColors.map((c) => (
                        <button
                          key={c}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            color === c && "ring-2 ring-offset-2 ring-primary"
                          )}
                          style={{ backgroundColor: c }}
                          onClick={() => setColor(c)}
                        >
                          {color === c && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="プロジェクトの目的や概要を入力..."
                rows={4}
              />
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  開始日 <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "PPP", { locale: ja })
                        : "開始日を選択"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>
                  終了日 <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate
                        ? format(endDate, "PPP", { locale: ja })
                        : "終了日を選択"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Members */}
            <div className="space-y-2">
              <Label>メンバー</Label>
              <Popover open={memberSearchOpen} onOpenChange={setMemberSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    メンバーを追加...
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="メンバーを検索..." />
                    <CommandList>
                      <CommandEmpty>該当するメンバーがいません</CommandEmpty>
                      <CommandGroup>
                        {mockUsers
                          .filter(
                            (u) => !selectedMembers.find((m) => m.id === u.id)
                          )
                          .map((user) => (
                            <CommandItem
                              key={user.id}
                              onSelect={() => handleAddMember(user)}
                            >
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback className="text-xs">
                                  {user.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {user.department}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMembers.map((member) => (
                    <Badge
                      key={member.id}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-[10px]">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {member.name}
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to="/projects">キャンセル</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={createProject.isPending}>
            {createProject.isPending ? "作成中..." : "プロジェクトを作成"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
