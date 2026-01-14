import { Card, CardContent } from "@/components/ui/card";
import { SERVICE_CONFIGS, type SourceService } from "@/types/import";
import { cn } from "@/lib/utils";

interface ServiceSelectorProps {
  selected: SourceService | null;
  onSelect: (service: SourceService) => void;
}

export function ServiceSelector({ selected, onSelect }: ServiceSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">インポート元サービスを選択</h3>
        <p className="text-sm text-muted-foreground">
          データを移行したいサービスを選択してください
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICE_CONFIGS.map((service) => (
          <Card
            key={service.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary",
              selected === service.id && "border-primary bg-primary/5"
            )}
            onClick={() => onSelect(service.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{service.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{service.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {service.importMethods.map((method) => (
                      <span
                        key={method}
                        className="text-xs bg-muted px-2 py-0.5 rounded"
                      >
                        {method.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
