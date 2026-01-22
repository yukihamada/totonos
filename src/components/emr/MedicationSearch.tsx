import { useState, useEffect, useRef } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Pill, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BaseMedication {
  id: string;
  name: string;
  generic_name: string | null;
  dosage_form: string | null;
  unit: string | null;
  yj_code: string | null;
  is_generic: boolean;
}

interface MedicationSearchProps<T extends BaseMedication> {
  medications: T[];
  onSelect: (medication: T) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MedicationSearch<T extends BaseMedication>({
  medications,
  onSelect,
  placeholder = "薬剤を検索...",
  disabled = false,
}: MedicationSearchProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredMedications = medications.filter((med) => {
    const searchLower = search.toLowerCase();
    return (
      med.name.toLowerCase().includes(searchLower) ||
      med.generic_name?.toLowerCase().includes(searchLower) ||
      med.yj_code?.includes(search)
    );
  });

  const handleSelect = (medication: T) => {
    onSelect(medication);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            {placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="薬剤名、一般名、YJコードで検索..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {search.length > 0 ? "薬剤が見つかりません" : "検索キーワードを入力してください"}
            </CommandEmpty>
            <CommandGroup heading={`検索結果 (${filteredMedications.length}件)`}>
              {filteredMedications.slice(0, 50).map((med) => (
                <CommandItem
                  key={med.id}
                  value={med.id}
                  onSelect={() => handleSelect(med)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{med.name}</span>
                      {med.generic_name && (
                        <span className="text-muted-foreground text-sm ml-2">
                          ({med.generic_name})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {med.is_generic && (
                      <Badge variant="outline" className="text-xs">GE</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {med.dosage_form}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Inline search variant for quick medication lookup
interface InlineMedicationSearchProps<T extends BaseMedication> {
  medications: T[];
  onSelect: (medication: T) => void;
  selectedIds?: string[];
}

export function InlineMedicationSearch<T extends BaseMedication>({
  medications,
  onSelect,
  selectedIds = [],
}: InlineMedicationSearchProps<T>) {
  const [search, setSearch] = useState("");
  
  const filteredMedications = medications.filter((med) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      med.name.toLowerCase().includes(searchLower) ||
      med.generic_name?.toLowerCase().includes(searchLower) ||
      med.yj_code?.includes(search)
    );
  });

  const isSelected = (id: string) => selectedIds.includes(id);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="薬剤名、一般名、YJコードで検索..."
          className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="border rounded-md max-h-[250px] overflow-y-auto">
        {filteredMedications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {search ? "薬剤が見つかりません" : "薬剤が登録されていません"}
          </div>
        ) : (
          filteredMedications.map((med) => (
            <div
              key={med.id}
              onClick={() => !isSelected(med.id) && onSelect(med)}
              className={cn(
                "p-3 flex justify-between items-center border-b last:border-0 cursor-pointer transition-colors",
                isSelected(med.id)
                  ? "bg-muted/50 cursor-not-allowed"
                  : "hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">{med.name}</span>
                  {med.generic_name && (
                    <span className="text-muted-foreground text-sm ml-2">
                      ({med.generic_name})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSelected(med.id) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
                {med.is_generic && (
                  <Badge variant="outline" className="text-xs">GE</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {med.dosage_form}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {filteredMedications.length}件の薬剤
        {selectedIds.length > 0 && ` (${selectedIds.length}件選択中)`}
      </p>
    </div>
  );
}
