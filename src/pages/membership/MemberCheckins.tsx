import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QrCode, UserCheck, Clock, LogIn, LogOut, Search } from "lucide-react";
import { useMemberCheckins, useMembers } from "@/hooks/useMembership";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";

export default function MemberCheckins() {
  const { checkins, isLoading, checkIn, checkOut } = useMemberCheckins();
  const { members } = useMembers();
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const totalCheckins = checkins.length;
  const currentlyIn = checkins.filter(c => !c.checkout_time).length;
  const checkedOut = checkins.filter(c => c.checkout_time).length;

  const handleManualCheckIn = async () => {
    if (!selectedMemberId) {
      toast.error("会員を選択してください");
      return;
    }
    await checkIn.mutateAsync({ member_id: selectedMemberId, method: "manual" });
    setIsManualDialogOpen(false);
    setSelectedMemberId("");
  };

  const handleCheckOut = async (id: string) => {
    await checkOut.mutateAsync(id);
  };

  const handleQrScan = async (memberId: string) => {
    await checkIn.mutateAsync({ member_id: memberId, method: "qr" });
    setIsQrDialogOpen(false);
  };

  // Filter checkins
  const filteredCheckins = checkins.filter((checkin) => {
    const memberName = checkin.member?.name || "";
    return memberName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Active members (those who haven't checked in yet today)
  const activeMembers = members.filter(m => 
    m.status === "active" && 
    !checkins.some(c => c.member_id === m.id && !c.checkout_time)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserCheck className="h-8 w-8" />
              チェックイン
            </h1>
            <p className="text-muted-foreground">本日のチェックイン/チェックアウト管理</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsQrDialogOpen(true)}>
              <QrCode className="h-4 w-4 mr-2" />
              QRスキャン
            </Button>
            <Button onClick={() => setIsManualDialogOpen(true)}>
              <UserCheck className="h-4 w-4 mr-2" />
              手動チェックイン
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                本日のチェックイン
              </CardDescription>
              <CardTitle className="text-2xl">{totalCheckins}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                現在利用中
              </CardDescription>
              <CardTitle className="text-2xl">{currentlyIn}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <LogOut className="h-4 w-4" />
                チェックアウト済
              </CardDescription>
              <CardTitle className="text-2xl">{checkedOut}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="会員名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Checkins Table */}
        <Card>
          <CardHeader>
            <CardTitle>本日のチェックイン履歴</CardTitle>
            <CardDescription>{format(new Date(), "yyyy年MM月dd日 (EEEE)", { locale: ja })}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">読み込み中...</p>
            ) : filteredCheckins.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery ? "該当するチェックイン履歴がありません" : "本日のチェックイン履歴がありません"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>会員</TableHead>
                      <TableHead>チェックイン</TableHead>
                      <TableHead>チェックアウト</TableHead>
                      <TableHead>方法</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCheckins.map((checkin) => (
                      <TableRow key={checkin.id}>
                        <TableCell className="font-medium">
                          <div>
                            {checkin.member?.name || "不明"}
                            <div className="text-xs text-muted-foreground">
                              {checkin.member?.member_number}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(checkin.checkin_time), "HH:mm")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {checkin.checkout_time ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(checkin.checkout_time), "HH:mm")}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {checkin.method === "qr" ? "QR" : "手動"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={checkin.checkout_time ? "secondary" : "default"}>
                            {checkin.checkout_time ? "退館済" : "利用中"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!checkin.checkout_time && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCheckOut(checkin.id)}
                            >
                              <LogOut className="h-4 w-4 mr-1" />
                              チェックアウト
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Scan Dialog */}
        <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QRコードスキャン</DialogTitle>
              <DialogDescription>
                会員証のQRコードをスキャンしてください
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                カメラが起動します...
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsQrDialogOpen(false)}>
                キャンセル
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manual Check-in Dialog */}
        <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>手動チェックイン</DialogTitle>
              <DialogDescription>
                チェックインする会員を選択してください
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>会員を選択</Label>
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="会員を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeMembers.length === 0 ? (
                      <SelectItem value="" disabled>
                        チェックイン可能な会員がいません
                      </SelectItem>
                    ) : (
                      activeMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.member_number})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsManualDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleManualCheckIn} disabled={!selectedMemberId}>
                チェックイン
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
