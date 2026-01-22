/**
 * Integration tests for Units (部屋) CRUD operations
 *
 * Run: npm run test:integration
 * Requires: supabase start
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase, supabaseAdmin, signInAsTestUser, signOutTestUser } from "../../setup-integration";

describe("Units Integration Tests", () => {
  let testUserId: string;
  let testBuildingId: string;
  let createdUnitIds: string[] = [];

  beforeAll(async () => {
    const user = await signInAsTestUser();
    testUserId = user.id;

    // Create a building for unit tests
    const { data: building } = await supabase
      .from("buildings")
      .insert({
        user_id: testUserId,
        name: "ユニットテスト用マンション",
        prefecture: "東京都",
        total_units: 10,
      })
      .select()
      .single();

    if (building) {
      testBuildingId = building.id;
    }
  });

  afterAll(async () => {
    // Cleanup units
    if (createdUnitIds.length > 0) {
      await supabaseAdmin.from("units").delete().in("id", createdUnitIds);
    }
    // Cleanup building
    if (testBuildingId) {
      await supabaseAdmin.from("buildings").delete().eq("id", testBuildingId);
    }
    await signOutTestUser();
  });

  describe("Create Unit", () => {
    it("should create a new unit", async () => {
      const newUnit = {
        user_id: testUserId,
        building_id: testBuildingId,
        unit_number: "101",
        floor: 1,
        layout: "1LDK",
        area_sqm: 45.5,
        base_rent: 120000,
        management_fee: 8000,
        status: "vacant" as const,
      };

      const { data, error } = await supabase
        .from("units")
        .insert(newUnit)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.unit_number).toBe("101");
      expect(data!.layout).toBe("1LDK");
      expect(Number(data!.base_rent)).toBe(120000);

      if (data) createdUnitIds.push(data.id);
    });

    it("should enforce unique unit_number per building", async () => {
      // Create first unit
      const { data: first } = await supabase
        .from("units")
        .insert({
          user_id: testUserId,
          building_id: testBuildingId,
          unit_number: "201",
        })
        .select()
        .single();

      if (first) createdUnitIds.push(first.id);

      // Try to create duplicate
      const { data: duplicate, error } = await supabase
        .from("units")
        .insert({
          user_id: testUserId,
          building_id: testBuildingId,
          unit_number: "201",
        })
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(duplicate).toBeNull();
    });
  });

  describe("Read Units", () => {
    beforeAll(async () => {
      // Create multiple units for testing
      const units = [
        { user_id: testUserId, building_id: testBuildingId, unit_number: "301", status: "vacant" as const },
        { user_id: testUserId, building_id: testBuildingId, unit_number: "302", status: "occupied" as const },
        { user_id: testUserId, building_id: testBuildingId, unit_number: "303", status: "occupied" as const },
      ];

      const { data } = await supabase.from("units").insert(units).select();
      if (data) {
        data.forEach((u) => createdUnitIds.push(u.id));
      }
    });

    it("should list all units for a building", async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("building_id", testBuildingId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThanOrEqual(3);
    });

    it("should filter units by status", async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("building_id", testBuildingId)
        .eq("status", "occupied");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.every((u) => u.status === "occupied")).toBe(true);
    });

    it("should join with building data", async () => {
      const { data, error } = await supabase
        .from("units")
        .select(`
          *,
          building:buildings(name, prefecture)
        `)
        .eq("building_id", testBuildingId)
        .limit(1)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.building).toBeDefined();
      expect((data!.building as any).name).toBe("ユニットテスト用マンション");
    });
  });

  describe("Update Unit", () => {
    let updateTestUnitId: string;

    beforeAll(async () => {
      const { data } = await supabase
        .from("units")
        .insert({
          user_id: testUserId,
          building_id: testBuildingId,
          unit_number: "401",
          status: "vacant" as const,
          base_rent: 100000,
        })
        .select()
        .single();

      if (data) {
        updateTestUnitId = data.id;
        createdUnitIds.push(data.id);
      }
    });

    it("should update unit status", async () => {
      const { data, error } = await supabase
        .from("units")
        .update({ status: "occupied" as const })
        .eq("id", updateTestUnitId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.status).toBe("occupied");
    });

    it("should update rent information", async () => {
      const { data, error } = await supabase
        .from("units")
        .update({
          base_rent: 115000,
          management_fee: 10000,
        })
        .eq("id", updateTestUnitId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Number(data!.base_rent)).toBe(115000);
      expect(Number(data!.management_fee)).toBe(10000);
    });
  });

  describe("Delete Unit", () => {
    it("should delete a unit", async () => {
      const { data: created } = await supabase
        .from("units")
        .insert({
          user_id: testUserId,
          building_id: testBuildingId,
          unit_number: "501",
        })
        .select()
        .single();

      expect(created).toBeDefined();

      const { error } = await supabase
        .from("units")
        .delete()
        .eq("id", created!.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data: afterDelete } = await supabase
        .from("units")
        .select()
        .eq("id", created!.id)
        .single();

      expect(afterDelete).toBeNull();
    });
  });

  describe("Property Status Enum", () => {
    it("should accept valid status values", async () => {
      const statuses = ["vacant", "occupied", "notice_given", "under_renovation"] as const;

      for (const status of statuses) {
        const { data, error } = await supabase
          .from("units")
          .insert({
            user_id: testUserId,
            building_id: testBuildingId,
            unit_number: `status-${status}`,
            status,
          })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data!.status).toBe(status);

        if (data) createdUnitIds.push(data.id);
      }
    });
  });
});
