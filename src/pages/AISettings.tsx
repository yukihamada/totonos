import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, Check, Eye, EyeOff, Sparkles, Zap, Cloud } from 'lucide-react';
import { useAISettings } from '@/hooks/useAISettings';
import {
  AIProvider,
  LOVABLE_MODELS,
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
} from '@/types/ai-settings';

export default function AISettings() {
  const { settings, loading, saving, setProvider, setModel, setApiKey, testConnection } = useAISettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [testing, setTesting] = useState(false);

  const handleProviderChange = (provider: AIProvider) => {
    setProvider(provider);
  };

  const handleModelChange = (model: string) => {
    setModel(model);
  };

  const handleApiKeySave = () => {
    if (apiKeyInput) {
      setApiKey(apiKeyInput);
      setApiKeyInput('');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await testConnection();
    setTesting(false);
  };

  const getModelsForProvider = (provider: AIProvider) => {
    switch (provider) {
      case 'lovable':
        return LOVABLE_MODELS;
      case 'openai':
        return OPENAI_MODELS;
      case 'anthropic':
        return ANTHROPIC_MODELS;
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const currentProvider = settings?.provider || 'lovable';
  const currentModel = settings?.model || 'google/gemini-3-flash-preview';
  const models = getModelsForProvider(currentProvider);

  return (
    <AppLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8" />
            AI設定
          </h1>
          <p className="text-muted-foreground mt-2">
            チャットアシスタントで使用するAIプロバイダーとモデルを選択できます
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AIプロバイダー</CardTitle>
            <CardDescription>
              使用するAIサービスを選択してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={currentProvider} onValueChange={(v) => handleProviderChange(v as AIProvider)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="lovable" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Lovable AI
                </TabsTrigger>
                <TabsTrigger value="openai" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  OpenAI
                </TabsTrigger>
                <TabsTrigger value="anthropic" className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Anthropic
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lovable" className="mt-6">
                <div className="space-y-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="font-medium">APIキー不要</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lovable AIは追加の設定なしですぐに使用できます。
                      Google GeminiやOpenAI GPT-5など、最新のモデルにアクセスできます。
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lovable-model">モデル選択</Label>
                    <Select value={currentModel} onValueChange={handleModelChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="モデルを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOVABLE_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              {model.recommended && (
                                <Badge variant="secondary" className="text-xs">推奨</Badge>
                              )}
                              <span className="text-muted-foreground text-xs">- {model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="openai" className="mt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI APIキー</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="openai-key"
                          type={showApiKey ? 'text' : 'password'}
                          placeholder="sk-..."
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button onClick={handleApiKeySave} disabled={!apiKeyInput || saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
                      </Button>
                    </div>
                    {settings?.custom_api_key && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Check className="h-4 w-4 text-green-500" />
                        APIキーが設定されています
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openai-model">モデル選択</Label>
                    <Select value={currentModel} onValueChange={handleModelChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="モデルを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPENAI_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              {model.recommended && (
                                <Badge variant="secondary" className="text-xs">推奨</Badge>
                              )}
                              <span className="text-muted-foreground text-xs">- {model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="anthropic" className="mt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="anthropic-key">Anthropic APIキー</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="anthropic-key"
                          type={showApiKey ? 'text' : 'password'}
                          placeholder="sk-ant-..."
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button onClick={handleApiKeySave} disabled={!apiKeyInput || saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
                      </Button>
                    </div>
                    {settings?.custom_api_key && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Check className="h-4 w-4 text-green-500" />
                        APIキーが設定されています
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anthropic-model">モデル選択</Label>
                    <Select value={currentModel} onValueChange={handleModelChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="モデルを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {ANTHROPIC_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              {model.recommended && (
                                <Badge variant="secondary" className="text-xs">推奨</Badge>
                              )}
                              <span className="text-muted-foreground text-xs">- {model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>接続テスト</CardTitle>
            <CardDescription>
              現在の設定でAIに接続できるかテストします
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTestConnection} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  テスト中...
                </>
              ) : (
                'テスト接続'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>現在の設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">プロバイダー</span>
                <span className="font-medium">
                  {currentProvider === 'lovable' && 'Lovable AI'}
                  {currentProvider === 'openai' && 'OpenAI'}
                  {currentProvider === 'anthropic' && 'Anthropic'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">モデル</span>
                <span className="font-medium">{currentModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">カスタムAPIキー</span>
                <span className="font-medium">
                  {currentProvider === 'lovable' ? '不要' : settings?.custom_api_key ? '設定済み' : '未設定'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
