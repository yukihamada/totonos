import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ExternalLink, Grid, List, X } from "lucide-react";

interface Screenshot {
  name: string;
  path: string;
  category: string;
  title: string;
  filename: string;
  requiresAuth: boolean;
  capturedAt: string;
}

interface Manifest {
  generatedAt: string;
  baseUrl: string;
  totalPages: number;
  screenshots: Screenshot[];
}

const categoryLabels: Record<string, string> = {
  public: "パブリック",
  dashboard: "ダッシュボード",
  documents: "書類",
  accounting: "会計",
  crm: "CRM",
  hr: "人事",
  finance: "財務",
  info: "情報",
  automation: "自動化",
  products: "商品",
  settings: "設定",
  developer: "開発者",
  views: "ビュー",
};

const categoryColors: Record<string, string> = {
  public: "bg-gray-500",
  dashboard: "bg-blue-500",
  documents: "bg-green-500",
  accounting: "bg-purple-500",
  crm: "bg-orange-500",
  hr: "bg-pink-500",
  finance: "bg-yellow-500",
  info: "bg-cyan-500",
  automation: "bg-indigo-500",
  products: "bg-red-500",
  settings: "bg-slate-500",
  developer: "bg-emerald-500",
  views: "bg-violet-500",
};

export default function Showcase() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetch("/screenshots/manifest.json")
      .then((res) => res.json())
      .then((data) => {
        setManifest(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load manifest:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!manifest || manifest.screenshots.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-medium mb-2">スクリーンショットがありません</p>
            <p className="text-muted-foreground mb-4">
              以下のコマンドでスクリーンショットを生成してください：
            </p>
            <code className="bg-muted px-3 py-2 rounded text-sm">
              npm run screenshots
            </code>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = ["all", ...new Set(manifest.screenshots.map((s) => s.category))];

  const filteredScreenshots = manifest.screenshots.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedScreenshots = filteredScreenshots.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Screenshot[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Totonos 画面一覧</h1>
              <p className="text-muted-foreground">
                全{manifest.totalPages}ページのスクリーンショット
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap h-auto gap-1">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {cat === "all" ? "すべて" : categoryLabels[cat] || cat}
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {cat === "all"
                    ? manifest.screenshots.length
                    : manifest.screenshots.filter((s) => s.category === cat).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Screenshots Grid/List */}
      <div className="container mx-auto px-4 pb-12">
        {viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredScreenshots.map((screenshot) => (
              <Card
                key={screenshot.name}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                onClick={() => setSelectedScreenshot(screenshot)}
              >
                <div className="aspect-video bg-muted relative group">
                  <img
                    src={`/screenshots/${screenshot.filename}`}
                    alt={screenshot.title}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      拡大表示
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{screenshot.title}</h3>
                      <p className="text-xs text-muted-foreground">{screenshot.path}</p>
                    </div>
                    <Badge
                      className={`${categoryColors[screenshot.category]} text-white text-[10px]`}
                    >
                      {categoryLabels[screenshot.category]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedScreenshots).map(([category, screenshots]) => (
              <div key={category} className="space-y-2">
                <h2 className="text-lg font-semibold flex items-center gap-2 pt-4">
                  <span className={`w-3 h-3 rounded-full ${categoryColors[category]}`} />
                  {categoryLabels[category]}
                  <Badge variant="secondary">{screenshots.length}</Badge>
                </h2>
                {screenshots.map((screenshot) => (
                  <Card
                    key={screenshot.name}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedScreenshot(screenshot)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <img
                        src={`/screenshots/${screenshot.filename}`}
                        alt={screenshot.title}
                        className="w-24 h-16 object-cover object-top rounded"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{screenshot.title}</h3>
                        <p className="text-sm text-muted-foreground">{screenshot.path}</p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={screenshot.path} target="_blank" rel="noopener">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}

        {filteredScreenshots.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            該当するページが見つかりませんでした
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          {selectedScreenshot && (
            <>
              <DialogHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>{selectedScreenshot.title}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{selectedScreenshot.path}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedScreenshot.path} target="_blank" rel="noopener">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        ページを開く
                      </a>
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-auto">
                <img
                  src={`/screenshots/${selectedScreenshot.filename}`}
                  alt={selectedScreenshot.title}
                  className="w-full"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
