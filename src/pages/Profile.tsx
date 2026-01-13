import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Building2, Mail, Save, Camera, Loader2 } from "lucide-react";

interface Profile {
  display_name: string | null;
  company_name: string | null;
  company_address: string | null;
  company_logo_url: string | null;
}

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    company_name: "",
    company_address: "",
    company_logo_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAvatar();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, company_name, company_address, company_logo_url")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          company_name: data.company_name || "",
          company_address: data.company_address || "",
          company_logo_url: data.company_logo_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvatar = async () => {
    if (!user) return;

    try {
      const { data } = await supabase.storage
        .from("avatars")
        .list(user.id, { limit: 1, sortBy: { column: "created_at", order: "desc" } });

      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(`${user.id}/${data[0].name}`);
        setAvatarUrl(urlData.publicUrl);
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Delete existing avatar if any
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from("avatars")
          .remove(existingFiles.map((f) => `${user.id}/${f.name}`));
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl + `?t=${Date.now()}`);
      toast.success("アバターをアップロードしました");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("アバターのアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name || null,
          company_name: profile.company_name || null,
          company_address: profile.company_address || null,
          company_logo_url: profile.company_logo_url || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("プロフィールを保存しました");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("プロフィールの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (profile.display_name) {
      return profile.display_name.slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">プロフィール</h1>
          <p className="text-muted-foreground">
            アカウント情報と会社情報を管理します
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* アカウント情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                アカウント情報
              </CardTitle>
              <CardDescription>
                ログインに使用するメールアドレスと表示名
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* アバター */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                    <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">プロフィール画像</p>
                  <p className="text-xs text-muted-foreground">
                    JPG、PNG形式。最大5MB
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  メールアドレスは変更できません
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">表示名</Label>
                <Input
                  id="display_name"
                  placeholder="山田 太郎"
                  value={profile.display_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, display_name: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* 会社情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                会社情報
              </CardTitle>
              <CardDescription>
                請求書や契約書に表示される会社情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">会社名</Label>
                <Input
                  id="company_name"
                  placeholder="株式会社サンプル"
                  value={profile.company_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, company_name: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">会社住所</Label>
                <Textarea
                  id="company_address"
                  placeholder="〒100-0001&#10;東京都千代田区..."
                  value={profile.company_address || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, company_address: e.target.value })
                  }
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_logo_url">会社ロゴURL</Label>
                <Input
                  id="company_logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={profile.company_logo_url || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, company_logo_url: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading || saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "保存中..." : "変更を保存"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
