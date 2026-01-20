import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { planFeatures, Plan } from "@/hooks/useSubscription";

// Mock dependencies
vi.mock("@/contexts/OrganizationContext", () => ({
  useOrganization: () => ({
    currentCompanyId: "test-company-id",
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { plan: "pro" }, error: null }),
        }),
      }),
    }),
  },
}));

describe("useSubscription", () => {
  describe("planFeatures", () => {
    it("should have all 5 plan tiers defined", () => {
      const expectedPlans: Plan[] = ["free", "starter", "standard", "pro", "enterprise"];
      expectedPlans.forEach((plan) => {
        expect(planFeatures[plan]).toBeDefined();
      });
    });

    it("should have correct structure for each plan", () => {
      Object.values(planFeatures).forEach((plan) => {
        expect(plan).toHaveProperty("maxUsers");
        expect(plan).toHaveProperty("maxStorage");
        expect(plan).toHaveProperty("features");
        expect(plan).toHaveProperty("price");
        expect(plan).toHaveProperty("priceLabel");
        expect(plan).toHaveProperty("monthlyCredits");
        expect(plan).toHaveProperty("slaUptime");
        expect(Array.isArray(plan.features)).toBe(true);
      });
    });

    it("should have increasing credits for higher plans", () => {
      expect(planFeatures.free.monthlyCredits).toBe(100);
      expect(planFeatures.starter.monthlyCredits).toBe(500);
      expect(planFeatures.standard.monthlyCredits).toBe(2000);
      expect(planFeatures.pro.monthlyCredits).toBe(5000);
      expect(planFeatures.enterprise.monthlyCredits).toBe(-1); // unlimited
    });

    it("should have correct pricing", () => {
      expect(planFeatures.free.price).toBe(0);
      expect(planFeatures.starter.price).toBe(980);
      expect(planFeatures.standard.price).toBe(2980);
      expect(planFeatures.pro.price).toBe(4980);
      expect(planFeatures.enterprise.price).toBe(-1); // custom pricing
    });

    it("should have SLA uptime only for paid plans", () => {
      expect(planFeatures.free.slaUptime).toBeNull();
      expect(planFeatures.starter.slaUptime).toBeNull();
      expect(planFeatures.standard.slaUptime).toBe("99.5%");
      expect(planFeatures.pro.slaUptime).toBe("99.9%");
      expect(planFeatures.enterprise.slaUptime).toBe("99.99%");
    });

    it("should have correct max users", () => {
      expect(planFeatures.free.maxUsers).toBe(1);
      expect(planFeatures.starter.maxUsers).toBe(5);
      expect(planFeatures.standard.maxUsers).toBe(20);
      expect(planFeatures.pro.maxUsers).toBe(-1); // unlimited
      expect(planFeatures.enterprise.maxUsers).toBe(-1); // unlimited
    });

    it("should have correct storage limits", () => {
      expect(planFeatures.free.maxStorage).toBe("1GB");
      expect(planFeatures.starter.maxStorage).toBe("10GB");
      expect(planFeatures.standard.maxStorage).toBe("50GB");
      expect(planFeatures.pro.maxStorage).toBe("無制限");
      expect(planFeatures.enterprise.maxStorage).toBe("無制限");
    });
  });
});
