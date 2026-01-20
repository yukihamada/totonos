import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesData {
  date: string;
  insurance_revenue: number;
  self_pay_revenue: number;
}

interface SalesBarChartProps {
  data: SalesData[];
  title?: string;
}

export function SalesBarChart({ data, title = "売上推移" }: SalesBarChartProps) {
  // Format large numbers
  const formatYAxis = (value: number) => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}万`;
    }
    return value.toLocaleString();
  };

  const formatTooltip = (value: number) => {
    return `¥${value.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
                className="fill-muted-foreground"
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Bar
                dataKey="insurance_revenue"
                name="保険収入"
                fill="hsl(217, 91%, 60%)"
                stackId="stack"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="self_pay_revenue"
                name="自費収入"
                fill="hsl(142, 71%, 45%)"
                stackId="stack"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
