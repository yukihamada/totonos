/**
 * Integration tests for Buildings (物件/建物) CRUD operations
 *
 * Run: npm run test:integration
 * Requires: supabase start
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { supabase, supabaseAdmin, signInAsTestUser, signOutTestUser, getTestUser } from "../../setup-integration";

describe("Buildings Integration Tests", () => {
  let testUserId: string;
  let createdBuildingIds: string[] = [];

  beforeAll(async () => {
    const user = await signInAsTestUser();
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup all created buildings
    if (createdBuildingIds.length > 0) {
      await supabaseAdmin
        .from("buildings")
        .delete()
        .in("id", createdBuildingIds);
    }
    await signOutTestUser();
  });

  beforeEach(() => {
    // Track created buildings for cleanup
  });

  describe("Create Building", () => {
    it("should create a new building", async () => {
      const newBuilding = {
        user_id: testUserId,
        name: "テストマンション101",
        postal_code: "150-0001",
        prefecture: "東京都",
        city: "渋谷区",
        address_line1: "神宮前1-1-1",
        building_type: "マンション",
        structure: "RC造",
        floors_above: 5,
        total_units: 20,
        year_built: 2020,
        is_managed: true,
      };

      const { data, error } = await supabase
        .from("buildings")
        .insert(newBuilding)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.name).toBe("テストマンション101");
      expect(data!.prefecture).toBe("東京都");
      expect(data!.building_type).toBe("マンション");
      expect(data!.user_id).toBe(testUserId);

      // Track for cleanup
      if (data) createdBuildingIds.push(data.id);
    });

    it("should fail to create building without required fields", async () => {
      const invalidBuilding = {
        user_id: testUserId,
        // name is missing
      };

      const { data, error } = await supabase
        .from("buildings")
        .insert(invalidBuilding as any)
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });
  });

  describe("Read Building", () => {
    let readTestBuildingId: string;

    beforeAll(async () => {
      // Create a building to read
      const { data } = await supabase
        .from("buildings")
        .insert({
          user_id: testUserId,
          name: "読み取りテストマンション",
          prefecture: "大阪府",
          city: "大阪市",
        })
        .select()
        .single();

      if (data) {
        readTestBuildingId = data.id;
        createdBuildingIds.push(data.id);
      }
    });

    it("should read a building by id", async () => {
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .eq("id", readTestBuildingId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.name).toBe("読み取りテストマンション");
    });

    it("should list all buildings for user", async () => {
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .eq("user_id", testUserId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
    });

    it("should filter buildings by prefecture", async () => {
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .eq("user_id", testUserId)
        .eq("prefecture", "大阪府");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.every((b) => b.prefecture === "大阪府")).toBe(true);
    });
  });

  describe("Update Building", () => {
    let updateTestBuildingId: string;

    beforeAll(async () => {
      const { data } = await supabase
        .from("buildings")
        .insert({
          user_id: testUserId,
          name: "更新テストマンション",
          prefecture: "福岡県",
        })
        .select()
        .single();

      if (data) {
        updateTestBuildingId = data.id;
        createdBuildingIds.push(data.id);
      }
    });

    it("should update building name", async () => {
      const { data, error } = await supabase
        .from("buildings")
        .update({ name: "更新後マンション名" })
        .eq("id", updateTestBuildingId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.name).toBe("更新後マンション名");
    });

    it("should update multiple fields", async () => {
      const { data, error } = await supabase
        .from("buildings")
        .update({
          floors_above: 10,
          total_units: 50,
          notes: "更新テスト用メモ",
        })
        .eq("id", updateTestBuildingId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.floors_above).toBe(10);
      expect(data!.total_units).toBe(50);
      expect(data!.notes).toBe("更新テスト用メモ");
    });
  });

  describe("Delete Building", () => {
    it("should delete a building", async () => {
      // Create a building to delete
      const { data: created } = await supabase
        .from("buildings")
        .insert({
          user_id: testUserId,
          name: "削除テストマンション",
        })
        .select()
        .single();

      expect(created).toBeDefined();

      // Delete it
      const { error: deleteError } = await supabase
        .from("buildings")
        .delete()
        .eq("id", created!.id);

      expect(deleteError).toBeNull();

      // Verify it's deleted
      const { data: afterDelete, error: readError } = await supabase
        .from("buildings")
        .select("*")
        .eq("id", created!.id)
        .single();

      expect(afterDelete).toBeNull();
      expect(readError).not.toBeNull();
    });
  });

  describe("RLS Policy Tests", () => {
    it("should not see buildings from other users", async () => {
      // Create a building as admin (different user_id)
      const otherUserId = "00000000-0000-0000-0000-000000000001";
      await supabaseAdmin.from("buildings").insert({
        user_id: otherUserId,
        name: "他のユーザーのマンション",
      });

      // Try to read it as test user
      const { data } = await supabase
        .from("buildings")
        .select("*")
        .eq("name", "他のユーザーのマンション");

      // Should not be able to see it due to RLS
      expect(data).toEqual([]);

      // Cleanup
      await supabaseAdmin
        .from("buildings")
        .delete()
        .eq("name", "他のユーザーのマンション");
    });
  });
});
