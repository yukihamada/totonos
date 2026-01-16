import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const externalServiceTools = [
  {
    name: "list_external_connections",
    description: "ユーザーが接続している外部サービスの一覧を取得します。freee、Salesforce、SmartHRなど連携済みのサービスを確認できます。",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "fetch_external_data",
    description: "接続済みの外部サービスからデータを取得します。例えば、freeeから取引データ、HubSpotからコンタクト情報などを取得できます。",
    input_schema: {
      type: "object",
      properties: {
        service_type: {
          type: "string",
          description: "サービスの種類（freee, hubspot, smarthr, notion, kintone など）",
        },
        endpoint: {
          type: "string",
          description: "取得するデータの種類やAPIエンドポイント",
        },
        params: {
          type: "object",
          description: "追加のパラメータ（app_id、object_type など）",
        },
      },
      required: ["service_type"],
    },
  },
  {
    name: "sync_external_service",
    description: "外部サービスのデータをTotonosに同期します。",
    input_schema: {
      type: "object",
      properties: {
        service_type: {
          type: "string",
          description: "同期するサービスの種類",
        },
      },
      required: ["service_type"],
    },
  },
];

export async function executeExternalServiceTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "list_external_connections": {
      const { data, error } = await supabase
        .from("external_connections")
        .select(`
          id,
          service_type,
          display_name,
          status,
          last_sync_at,
          settings,
          service:external_service_types(name, category)
        `)
        .eq("user_id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          message: "外部サービスはまだ接続されていません。設定メニューから外部サービス連携を設定できます。",
          connections: [],
        };
      }

      const connections = data.map((conn) => {
        const service = Array.isArray(conn.service) ? conn.service[0] : conn.service;
        return {
          id: conn.id,
          service_type: conn.service_type,
          name: conn.display_name || service?.name || conn.service_type,
          category: service?.category,
          status: conn.status,
          last_sync: conn.last_sync_at,
          sync_enabled: (conn.settings as Record<string, unknown>)?.sync_enabled ?? false,
        };
      });

      return {
        success: true,
        message: `${connections.length}件の外部サービスが接続されています。`,
        connections,
      };
    }

    case "fetch_external_data": {
      const serviceType = input.service_type as string;
      const endpoint = input.endpoint as string;
      const params = input.params as Record<string, unknown> || {};

      // Find the connection for this service
      const { data: connection, error: connError } = await supabase
        .from("external_connections")
        .select("id, status")
        .eq("user_id", userId)
        .eq("service_type", serviceType)
        .eq("status", "active")
        .single();

      if (connError || !connection) {
        return {
          success: false,
          error: `${serviceType}への接続が見つかりません。まず外部サービス連携から接続を設定してください。`,
        };
      }

      // Call the external-api edge function
      const { data, error } = await supabase.functions.invoke("external-api", {
        body: {
          action: "fetch_data",
          connection_id: connection.id,
          params: { endpoint, ...params },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        service: serviceType,
        data,
      };
    }

    case "sync_external_service": {
      const serviceType = input.service_type as string;

      // Find the connection for this service
      const { data: connection, error: connError } = await supabase
        .from("external_connections")
        .select("id, status, display_name, service:external_service_types(name)")
        .eq("user_id", userId)
        .eq("service_type", serviceType)
        .single();

      if (connError || !connection) {
        return {
          success: false,
          error: `${serviceType}への接続が見つかりません。`,
        };
      }

      if (connection.status !== "active") {
        return {
          success: false,
          error: `${serviceType}の接続が有効ではありません（ステータス: ${connection.status}）。接続テストを実行してください。`,
        };
      }

      // Call the external-api edge function for sync
      const { data, error } = await supabase.functions.invoke("external-api", {
        body: {
          action: "sync_data",
          connection_id: connection.id,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const service = Array.isArray(connection.service) ? connection.service[0] : connection.service;
      const serviceName = connection.display_name || service?.name || serviceType;
      return {
        success: true,
        message: `${serviceName}からデータを同期しました。同期件数: ${(data as Record<string, number>)?.synced_count || 0}件`,
        synced_count: (data as Record<string, number>)?.synced_count || 0,
      };
    }

    default:
      throw new Error(`Unknown external service tool: ${toolName}`);
  }
}
