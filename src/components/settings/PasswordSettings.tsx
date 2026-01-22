import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Key, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface PasswordSettingsProps {
  onPasswordStatusChange?: (hasPassword: boolean) => void;
}

export function PasswordSettings({ onPasswordStatusChange }: PasswordSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has a password set
  useEffect(() => {
    const checkPasswordStatus = async () => {
      if (!user) return;
      
      try {
        // Check user's identity providers
        const { data: { user: userData } } = await supabase.auth.getUser();
        if (userData) {
          // User has password if they have email identity
          const hasEmailIdentity = userData.identities?.some(
            identity => identity.provider === 'email'
          );
          // Also check if they have app_metadata indicating password
          const hasPasswordFromMeta = userData.app_metadata?.providers?.includes('email');
          const passwordSet = hasEmailIdentity || hasPasswordFromMeta || false;
          setHasPassword(passwordSet);
          onPasswordStatusChange?.(passwordSet);
        }
      } catch (error) {
        console.error('Failed to check password status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPasswordStatus();
  }, [user, onPasswordStatusChange]);

  const handleSetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'エラー',
        description: 'パスワードが一致しません',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'エラー',
        description: 'パスワードは8文字以上にしてください',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setHasPassword(true);
      onPasswordStatusChange?.(true);
      setDialogOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      
      toast({
        title: 'パスワードを設定しました',
        description: '次回からパスワードでもログインできます',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'パスワードの設定に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'エラー',
        description: 'パスワードが一致しません',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'エラー',
        description: 'パスワードは8文字以上にしてください',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setDialogOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      
      toast({
        title: 'パスワードを変更しました',
        description: '新しいパスワードでログインしてください',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'パスワードの変更に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>パスワード設定</CardTitle>
            </div>
            {hasPassword ? (
              <Badge className="bg-green-500">設定済み</Badge>
            ) : (
              <Badge variant="secondary">未設定</Badge>
            )}
          </div>
          <CardDescription>
            パスワードを設定するとメール+パスワードでもログインできます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPassword ? (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>パスワードが設定されています</AlertTitle>
                <AlertDescription>
                  メールリンク、Google、またはパスワードでログインできます
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                パスワードを変更
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                パスワードを設定すると、メールリンクやGoogleログインに加えて、
                メールアドレスとパスワードでもログインできるようになります。
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Key className="mr-2 h-4 w-4" />
                パスワードを設定
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasPassword ? 'パスワードを変更' : 'パスワードを設定'}
            </DialogTitle>
            <DialogDescription>
              {hasPassword
                ? '新しいパスワードを入力してください'
                : '新しいパスワードを設定してください（8文字以上）'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {hasPassword && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  現在ログイン中のため、現在のパスワード確認は不要です
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-password">新しいパスワード</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8文字以上"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">パスワード確認</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="もう一度入力"
              />
            </div>

            {newPassword && newPassword.length < 8 && (
              <p className="text-sm text-destructive">
                パスワードは8文字以上にしてください
              </p>
            )}

            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-destructive">
                パスワードが一致しません
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              キャンセル
            </Button>
            <Button
              onClick={hasPassword ? handleChangePassword : handleSetPassword}
              disabled={
                isSubmitting ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword
              }
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasPassword ? (
                '変更'
              ) : (
                '設定'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
