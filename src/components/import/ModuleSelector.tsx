import { Card, CardContent } from "@/components/ui/card";
import { 
  SERVICE_CONFIGS, 
  TARGET_MODULE_LABELS,
  type SourceService, 
  type TargetModule 
} from "@/types/import";
import { cn } from "@/lib/utils";
import { 
  Users, 
  FileText, 
  UserPlus, 
  Briefcase, 
  User, 
  Calculator, 
  BookOpen,
  FileSpreadsheet
} from "lucide-react";

const MODULE_ICONS: Record<TargetModule, React.ReactNode> = {
  clients: <Users className="h-5 w-5" />,
  invoices: <FileText className="h-5 w-5" />,
  estimates: <FileSpreadsheet className="h-5 w-5" />,
  leads: <UserPlus className="h-5 w-5" />,
  deals: <Briefcase className="h-5 w-5" />,
  employees: <User className="h-5 w-5" />,
  accounts: <Calculator className="h-5 w-5" />,
  journal_entries: <BookOpen className="h-5 w-5" />,
  wiki_pages: <FileText className="h-5 w-5" />,
};

interface ModuleSelectorProps {
  sourceService: SourceService;
  selected: TargetModule | null;
  onSelect: (module: TargetModule) => void;
}

export function ModuleSelector({ sourceService, selected, onSelect }: ModuleSelectorProps) {
  const serviceConfig = SERVICE_CONFIGS.find(s => s.id === sourceService);
  const availableModules = serviceConfig?.supportedModules || [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">インポート先を選択</h3>
        <p className="text-sm text-muted-foreground">
          データをどのモジュールにインポートするか選択してください
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableModules.map((module) => (
          <Card
            key={module}
            className={cn(
              "cursor-pointer transition-all hover:border-primary",
              selected === module && "border-primary bg-primary/5"
            )}
            onClick={() => onSelect(module)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {MODULE_ICONS[module]}
                </div>
                <span className="font-medium">{TARGET_MODULE_LABELS[module]}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
