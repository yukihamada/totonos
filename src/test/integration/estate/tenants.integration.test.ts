/**
 * Integration tests for Tenants (入居者) CRUD operations
 *
 * Run: npm run test:integration
 * Requires: supabase start
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase, supabaseAdmin, signInAsTestUser, signOutTestUser } from "../../setup-integration";

describe("Tenants Integration Tests", () => {
  let testUserId: string;
  let createdTenantIds: string[] = [];

  beforeAll(async () => {
    const user = await signInAsTestUser();
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup tenants
    if (createdTenantIds.length > 0) {
      await supabaseAdmin.from("tenants").delete().in("id", createdTenantIds);
    }
    await signOutTestUser();
  });

  describe("Create Tenant", () => {
    it("should create a new tenant with full information", async () => {
      const newTenant = {
        user_id: testUserId,
        name: "山田太郎",
        name_kana: "ヤマダタロウ",
        phone: "03-1234-5678",
        mobile: "090-1234-5678",
        email: "yamada@example.com",
        current_address: "東京都港区芝1-1-1",
        current_postal_code: "105-0001",
        employer_name: "株式会社テスト",
        employer_phone: "03-9999-9999",
        annual_income: 5000000,
        emergency_contact_name: "山田花子",
        emergency_contact_phone: "090-9876-5432",
        emergency_contact_relation: "配偶者",
        is_active: true,
      };

      const { data, error } = await supabase
        .from("tenants")
        .insert(newTenant)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.name).toBe("山田太郎");
      expect(data!.name_kana).toBe("ヤマダタロウ");
      expect(data!.email).toBe("yamada@example.com");
      expect(Number(data!.annual_income)).toBe(5000000);

      if (data) createdTenantIds.push(data.id);
    });

    it("should create tenant with minimal required fields", async () => {
      const minimalTenant = {
        user_id: testUserId,
        name: "鈴木一郎",
      };

      const { data, error } = await supabase
        .from("tenants")
        .insert(minimalTenant)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.name).toBe("鈴木一郎");
      expect(data!.is_active).toBe(true); // Default value

      if (data) createdTenantIds.push(data.id);
    });

    it("should fail without required name field", async () => {
      const invalidTenant = {
        user_id: testUserId,
        // name is missing
        email: "noname@example.com",
      };

      const { data, error } = await supabase
        .from("tenants")
        .insert(invalidTenant as any)
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });
  });

  describe("Read Tenants", () => {
    beforeAll(async () => {
      // Create test tenants
      const tenants = [
        { user_id: testUserId, name: "田中太郎", name_kana: "タナカタロウ", is_active: true },
        { user_id: testUserId, name: "田中花子", name_kana: "タナカハナコ", is_active: true },
        { user_id: testUserId, name: "退去済み太郎", is_active: false },
      ];

      const { data } = await supabase.from("tenants").insert(tenants).select();
      if (data) {
        data.forEach((t) => createdTenantIds.push(t.id));
      }
    });

    it("should list all tenants for user", async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("user_id", testUserId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThanOrEqual(3);
    });

    it("should filter active tenants only", async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("user_id", testUserId)
        .eq("is_active", true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.every((t) => t.is_active === true)).toBe(true);
    });

    it("should search tenants by name", async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("user_id", testUserId)
        .ilike("name", "%田中%");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThanOrEqual(2);
      expect(data!.every((t) => t.name.includes("田中"))).toBe(true);
    });

    it("should search tenants by kana", async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("user_id", testUserId)
        .ilike("name_kana", "%タナカ%");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Update Tenant", () => {
    let updateTestTenantId: string;

    beforeAll(async () => {
      const { data } = await supabase
        .from("tenants")
        .insert({
          user_id: testUserId,
          name: "更新テスト太郎",
          phone: "03-0000-0000",
        })
        .select()
        .single();

      if (data) {
        updateTestTenantId = data.id;
        createdTenantIds.push(data.id);
      }
    });

    it("should update tenant contact info", async () => {
      const { data, error } = await supabase
        .from("tenants")
        .update({
          phone: "03-1111-2222",
          mobile: "080-3333-4444",
          email: "updated@example.com",
        })
        .eq("id", updateTestTenantId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.phone).toBe("03-1111-2222");
      expect(data!.mobile).toBe("080-3333-4444");
      expect(data!.email).toBe("updated@example.com");
    });

    it("should update tenant employment info", async () => {
      const { data, error } = await supabase
        .from("tenants")
        .update({
          employer_name: "新会社株式会社",
          annual_income: 6000000,
        })
        .eq("id", updateTestTenantId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.employer_name).toBe("新会社株式会社");
      expect(Number(data!.annual_income)).toBe(6000000);
    });

    it("should deactivate tenant (退去)", async () => {
      const { data, error } = await supabase
        .from("tenants")
        .update({ is_active: false })
        .eq("id", updateTestTenantId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.is_active).toBe(false);
    });
  });

  describe("Delete Tenant", () => {
    it("should delete a tenant", async () => {
      const { data: created } = await supabase
        .from("tenants")
        .insert({
          user_id: testUserId,
          name: "削除予定太郎",
        })
        .select()
        .single();

      expect(created).toBeDefined();

      const { error } = await supabase
        .from("tenants")
        .delete()
        .eq("id", created!.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data: afterDelete } = await supabase
        .from("tenants")
        .select()
        .eq("id", created!.id)
        .single();

      expect(afterDelete).toBeNull();
    });
  });

  describe("RLS Policy Tests", () => {
    it("should not see tenants from other users", async () => {
      const otherUserId = "00000000-0000-0000-0000-000000000002";

      // Create tenant as admin for different user
      await supabaseAdmin.from("tenants").insert({
        user_id: otherUserId,
        name: "他ユーザーの入居者",
      });

      // Try to access as test user
      const { data } = await supabase
        .from("tenants")
        .select("*")
        .eq("name", "他ユーザーの入居者");

      expect(data).toEqual([]);

      // Cleanup
      await supabaseAdmin
        .from("tenants")
        .delete()
        .eq("name", "他ユーザーの入居者");
    });
  });
});
