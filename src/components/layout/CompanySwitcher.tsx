import { Building2, Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentCompany, useUserCompanies, useSwitchCompany } from "@/hooks/useCompany";
import { cn } from "@/lib/utils";

interface CompanySwitcherProps {
  collapsed?: boolean;
}

export function CompanySwitcher({ collapsed }: CompanySwitcherProps) {
  const navigate = useNavigate();
  const { data: currentCompany } = useCurrentCompany();
  const { data: userCompanies = [] } = useUserCompanies();
  const switchCompany = useSwitchCompany();

  const displayName = currentCompany?.display_name || currentCompany?.name || "会社を選択";

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Building2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold">会社を切り替え</div>
          <DropdownMenuSeparator />
          {userCompanies.map((membership: any) => (
            <DropdownMenuItem
              key={membership.company_id}
              onClick={() => switchCompany.mutate(membership.company_id)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  currentCompany?.id === membership.company_id ? "opacity-100" : "opacity-0"
                )}
              />
              {membership.companies?.display_name || membership.companies?.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/settings/company")} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            新しい会社を登録
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal h-10"
          disabled={switchCompany.isPending}
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{displayName}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <div className="px-2 py-1.5 text-sm font-semibold">会社を切り替え</div>
        <DropdownMenuSeparator />
        {userCompanies.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            会社が登録されていません
          </DropdownMenuItem>
        ) : (
          userCompanies.map((membership: any) => (
            <DropdownMenuItem
              key={membership.company_id}
              onClick={() => switchCompany.mutate(membership.company_id)}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  currentCompany?.id === membership.company_id ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="truncate">
                {membership.companies?.display_name || membership.companies?.name}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/settings/company")} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          新しい会社を登録
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings/company")} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          会社・チーム管理
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
