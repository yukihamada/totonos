import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InsuranceType, InsuranceTypeSummary } from "@/types/emr";

interface InsuranceTypePieChartProps {
  data: InsuranceTypeSummary[];
  title?: string;
  showAmount?: boolean;
}

// Insurance type colors and labels
const insuranceTypeConfig: Record<
  InsuranceType,
  { label: string; color: string }
> = {
  employee_health: { label: "社保", color: "hsl(217, 91%, 60%)" },
  national_health: { label: "国保", color: "hsl(239, 84%, 67%)" },
  late_elderly: { label: "後期", color: "hsl(25, 95%, 53%)" },
  welfare: { label: "生保", color: "hsl(271, 91%, 65%)" },
  self_pay: { label: "自費", color: "hsl(220, 9%, 46%)" },
};

export function InsuranceTypePieChart({
  data,
  title = "保険種別分布",
  showAmount = true,
}: InsuranceTypePieChartProps) {
  const chartData = data.map((item) => ({
    name: insuranceTypeConfig[item.type].label,
    value: showAmount ? item.amount : item.count,
    color: insuranceTypeConfig[item.type].color,
  }));

  const formatTooltip = (value: number) => {
    return showAmount ? `¥${value.toLocaleString()}` : `${value}件`;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function getInsuranceTypeLabel(type: InsuranceType): string {
  return insuranceTypeConfig[type].label;
}

export function getInsuranceTypeColor(type: InsuranceType): string {
  return insuranceTypeConfig[type].color;
}
