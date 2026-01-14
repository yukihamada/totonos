import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";

interface GalleryViewProps<T> {
  data: T[];
  titleField: string;
  imageField?: string;
  onItemClick?: (item: T) => void;
}

export function GalleryView<T extends { id: string }>({
  data,
  titleField,
  imageField,
  onItemClick,
}: GalleryViewProps<T>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {data.map((item) => (
        <Card
          key={item.id}
          className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
          onClick={() => onItemClick?.(item)}
        >
          {/* Image */}
          <div className="aspect-video bg-muted flex items-center justify-center">
            {imageField && (item as any)[imageField] ? (
              <img
                src={(item as any)[imageField]}
                alt={(item as any)[titleField]}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4">
            <h3 className="font-medium truncate">{(item as any)[titleField]}</h3>
            {/* Show first text field as description */}
            {Object.entries(item as any)
              .filter(
                ([key, value]) =>
                  key !== "id" &&
                  key !== titleField &&
                  key !== imageField &&
                  typeof value === "string"
              )
              .slice(0, 1)
              .map(([key, value]) => (
                <p
                  key={key}
                  className="text-sm text-muted-foreground mt-1 truncate"
                >
                  {value as string}
                </p>
              ))}
          </CardContent>
        </Card>
      ))}

      {data.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          アイテムがありません
        </div>
      )}
    </div>
  );
}
