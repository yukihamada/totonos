import { DashboardStats } from "@/hooks/useDashboardStats";

export const demoDashboardStats: DashboardStats = {
  totalInvoiced: 15800000,
  monthlyInvoiced: 3200000,
  unpaidAmount: 1250000,
  unpaidCount: 5,
  overdueAmount: 320000,
  overdueCount: 2,
  sentEstimates: 4500000,
  acceptedEstimates: 2800000,
  pipelineValue: 12500000,
  dealsCount: 8,
  wonDealsValue: 8900000,
  monthlyRevenue: [
    { month: "8月", amount: 2100000, paid: 1800000 },
    { month: "9月", amount: 2500000, paid: 2200000 },
    { month: "10月", amount: 2800000, paid: 2500000 },
    { month: "11月", amount: 3100000, paid: 2700000 },
    { month: "12月", amount: 3500000, paid: 3000000 },
    { month: "1月", amount: 3200000, paid: 2800000 },
  ],
  pipelineByStage: [
    { stage: "初期接触", count: 3, value: 2500000 },
    { stage: "提案中", count: 2, value: 3800000 },
    { stage: "交渉中", count: 2, value: 4200000 },
    { stage: "契約準備", count: 1, value: 2000000 },
  ],
  recentActivities: [
    { 
      id: "1", 
      type: "invoice" as const, 
      title: "株式会社ABC 月次契約", 
      amount: 550000, 
      date: "2026-01-14", 
      status: "paid" 
    },
    { 
      id: "2", 
      type: "invoice" as const, 
      title: "XYZ商事 コンサル費用", 
      amount: 880000, 
      date: "2026-01-12", 
      status: "sent" 
    },
    { 
      id: "3", 
      type: "deal" as const, 
      title: "新規大口案件 - DEF株式会社", 
      amount: 3200000, 
      date: "2026-01-10", 
      status: "negotiation" 
    },
    { 
      id: "4", 
      type: "estimate" as const, 
      title: "GHI工業 システム導入見積", 
      amount: 1500000, 
      date: "2026-01-09", 
      status: "accepted" 
    },
    { 
      id: "5", 
      type: "invoice" as const, 
      title: "JKL株式会社 保守費用", 
      amount: 220000, 
      date: "2026-01-08", 
      status: "overdue" 
    },
    { 
      id: "6", 
      type: "deal" as const, 
      title: "MNO商事 年間契約", 
      amount: 4800000, 
      date: "2026-01-07", 
      status: "won" 
    },
    { 
      id: "7", 
      type: "estimate" as const, 
      title: "PQR株式会社 追加開発", 
      amount: 980000, 
      date: "2026-01-05", 
      status: "sent" 
    },
    { 
      id: "8", 
      type: "invoice" as const, 
      title: "STU工業 月次請求", 
      amount: 350000, 
      date: "2026-01-04", 
      status: "paid" 
    },
  ],
};
