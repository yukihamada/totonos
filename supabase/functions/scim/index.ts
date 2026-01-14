// SCIM 2.0 Provisioning Endpoint
// Supports Okta, Azure AD, Google Workspace, OneLogin, and other SCIM-compatible IdPs

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, createRateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

// SCIM 2.0 Schema URNs
const SCIM_SCHEMAS = {
  USER: "urn:ietf:params:scim:schemas:core:2.0:User",
  GROUP: "urn:ietf:params:scim:schemas:core:2.0:Group",
  LIST_RESPONSE: "urn:ietf:params:scim:api:messages:2.0:ListResponse",
  ERROR: "urn:ietf:params:scim:api:messages:2.0:Error",
  PATCH_OP: "urn:ietf:params:scim:api:messages:2.0:PatchOp",
};

// Rate limit: 100 requests per minute per organization
const RATE_LIMIT_CONFIG = { maxRequests: 100, windowMs: 60000 };

interface ScimUser {
  schemas: string[];
  id: string;
  externalId?: string;
  userName: string;
  name?: {
    formatted?: string;
    familyName?: string;
    givenName?: string;
  };
  displayName?: string;
  emails?: Array<{ value: string; primary?: boolean; type?: string }>;
  active: boolean;
  meta: {
    resourceType: string;
    created: string;
    lastModified: string;
    location: string;
  };
}

interface ScimGroup {
  schemas: string[];
  id: string;
  externalId?: string;
  displayName: string;
  members?: Array<{ value: string; display?: string }>;
  meta: {
    resourceType: string;
    created: string;
    lastModified: string;
    location: string;
  };
}

// Hash token for comparison
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Parse request path
function parsePath(url: URL): { resource: string; id?: string } {
  const parts = url.pathname.split("/").filter(Boolean);
  // Expected: /scim/v2/Users or /scim/v2/Users/:id
  const resourceIndex = parts.findIndex(p => p === "v2") + 1;
  const resource = parts[resourceIndex]?.toLowerCase() || "";
  const id = parts[resourceIndex + 1];
  return { resource, id };
}

// Create SCIM error response
function createErrorResponse(status: number, detail: string, scimType?: string): Response {
  return new Response(
    JSON.stringify({
      schemas: [SCIM_SCHEMAS.ERROR],
      status: status.toString(),
      scimType: scimType || "invalidValue",
      detail,
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/scim+json" },
    }
  );
}

// Convert internal user to SCIM user format
function toScimUser(user: any, baseUrl: string): ScimUser {
  return {
    schemas: [SCIM_SCHEMAS.USER],
    id: user.scim_id || user.id,
    externalId: user.external_id,
    userName: user.email,
    name: {
      formatted: user.full_name || user.display_name,
      familyName: user.last_name,
      givenName: user.first_name,
    },
    displayName: user.display_name || user.full_name || user.email,
    emails: [
      {
        value: user.email,
        primary: true,
        type: "work",
      },
    ],
    active: user.is_active !== false,
    meta: {
      resourceType: "User",
      created: user.created_at,
      lastModified: user.updated_at || user.created_at,
      location: `${baseUrl}/scim/v2/Users/${user.scim_id || user.id}`,
    },
  };
}

// Convert internal group to SCIM group format
function toScimGroup(group: any, members: any[], baseUrl: string): ScimGroup {
  return {
    schemas: [SCIM_SCHEMAS.GROUP],
    id: group.scim_id || group.id,
    externalId: group.external_id,
    displayName: group.name,
    members: members.map(m => ({
      value: m.user_scim_id || m.user_id,
      display: m.user_email || m.user_name,
    })),
    meta: {
      resourceType: "Group",
      created: group.created_at,
      lastModified: group.updated_at || group.created_at,
      location: `${baseUrl}/scim/v2/Groups/${group.scim_id || group.id}`,
    },
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const { resource, id } = parsePath(url);
    const method = req.method;

    // Handle ServiceProviderConfig (no auth required)
    if (resource === "serviceproviderconfig") {
      return new Response(
        JSON.stringify({
          schemas: ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
          documentationUri: "https://docs.totonos.com/scim",
          patch: { supported: true },
          bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
          filter: { supported: true, maxResults: 100 },
          changePassword: { supported: false },
          sort: { supported: false },
          etag: { supported: false },
          authenticationSchemes: [
            {
              type: "oauthbearertoken",
              name: "OAuth Bearer Token",
              description: "Authentication scheme using the OAuth Bearer Token Standard",
              specUri: "https://www.rfc-editor.org/info/rfc6750",
              primary: true,
            },
          ],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/scim+json" } }
      );
    }

    // Handle ResourceTypes (no auth required)
    if (resource === "resourcetypes") {
      return new Response(
        JSON.stringify({
          schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
          totalResults: 2,
          Resources: [
            {
              schemas: ["urn:ietf:params:scim:schemas:core:2.0:ResourceType"],
              id: "User",
              name: "User",
              endpoint: "/Users",
              schema: SCIM_SCHEMAS.USER,
            },
            {
              schemas: ["urn:ietf:params:scim:schemas:core:2.0:ResourceType"],
              id: "Group",
              name: "Group",
              endpoint: "/Groups",
              schema: SCIM_SCHEMAS.GROUP,
            },
          ],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/scim+json" } }
      );
    }

    // Handle Schemas (no auth required)
    if (resource === "schemas") {
      return new Response(
        JSON.stringify({
          schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
          totalResults: 2,
          Resources: [
            {
              id: SCIM_SCHEMAS.USER,
              name: "User",
              description: "User Account",
              attributes: [
                { name: "userName", type: "string", required: true },
                { name: "name", type: "complex", required: false },
                { name: "displayName", type: "string", required: false },
                { name: "emails", type: "complex", multiValued: true, required: false },
                { name: "active", type: "boolean", required: false },
              ],
            },
            {
              id: SCIM_SCHEMAS.GROUP,
              name: "Group",
              description: "Group",
              attributes: [
                { name: "displayName", type: "string", required: true },
                { name: "members", type: "complex", multiValued: true, required: false },
              ],
            },
          ],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/scim+json" } }
      );
    }

    // Authenticate SCIM request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return createErrorResponse(401, "Missing or invalid Authorization header", "unauthorized");
    }

    const token = authHeader.replace("Bearer ", "");
    const tokenHash = await hashToken(token);

    // Validate token and get organization
    const { data: tokenData, error: tokenError } = await supabase.rpc("validate_scim_token", {
      p_token_hash: tokenHash,
    });

    if (tokenError || !tokenData || tokenData.length === 0 || !tokenData[0].is_valid) {
      return createErrorResponse(401, "Invalid or expired SCIM token", "unauthorized");
    }

    const organizationId = tokenData[0].organization_id;

    // Rate limiting
    const rateLimitResult = await checkRateLimit(`scim:${organizationId}`, RATE_LIMIT_CONFIG);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    // Get SCIM configuration
    const { data: config } = await supabase
      .from("scim_configurations")
      .select("*")
      .eq("organization_id", organizationId)
      .single();

    if (!config?.is_enabled) {
      return createErrorResponse(403, "SCIM provisioning is not enabled for this organization");
    }

    // Route to appropriate handler
    if (resource === "users") {
      return await handleUsers(supabase, organizationId, method, id, url, req, baseUrl, config);
    } else if (resource === "groups") {
      return await handleGroups(supabase, organizationId, method, id, url, req, baseUrl);
    }

    return createErrorResponse(404, `Unknown resource: ${resource}`);
  } catch (error) {
    console.error("SCIM error:", error);
    return createErrorResponse(500, error instanceof Error ? error.message : "Internal server error");
  }
});

// Handle /Users endpoints
async function handleUsers(
  supabase: any,
  organizationId: string,
  method: string,
  id: string | undefined,
  url: URL,
  req: Request,
  baseUrl: string,
  config: any
): Promise<Response> {
  // GET /Users/:id
  if (method === "GET" && id) {
    // Find user by SCIM ID or internal ID
    const { data: mapping } = await supabase.rpc("find_internal_by_scim_id", {
      p_organization_id: organizationId,
      p_external_id: id,
      p_resource_type: "User",
    });

    const userId = mapping || id;
    const { data: member, error } = await supabase
      .from("organization_members")
      .select("*, user:users(*)")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .single();

    if (error || !member) {
      return createErrorResponse(404, `User ${id} not found`);
    }

    const user = {
      ...member.user,
      scim_id: id,
      is_active: member.is_active !== false,
    };

    return new Response(JSON.stringify(toScimUser(user, baseUrl)), {
      headers: { ...corsHeaders, "Content-Type": "application/scim+json" },
    });
  }

  // GET /Users (list with filter)
  if (method === "GET") {
    const filter = url.searchParams.get("filter");
    const startIndex = parseInt(url.searchParams.get("startIndex") || "1");
    const count = Math.min(parseInt(url.searchParams.get("count") || "100"), 100);

    let query = supabase
      .from("organization_members")
      .select("*, user:users(*)", { count: "exact" })
      .eq("organization_id", organizationId)
      .range(startIndex - 1, startIndex - 1 + count - 1);

    // Parse simple SCIM filter (e.g., userName eq "john@example.com")
    if (filter) {
      const match = filter.match(/userName\s+eq\s+"([^"]+)"/i);
      if (match) {
        query = query.eq("user.email", match[1]);
      }
    }

    const { data: members, error, count: totalResults } = await query;

    if (error) {
      return createErrorResponse(500, error.message);
    }

    // Get SCIM mappings for these users
    const userIds = members.map((m: any) => m.user_id);
    const { data: mappings } = await supabase
      .from("scim_external_ids")
      .select("external_id, internal_id")
      .eq("organization_id", organizationId)
      .eq("resource_type", "User")
      .in("internal_id", userIds);

    const mappingLookup = new Map(
      (mappings || []).map((m: any) => [m.internal_id, m.external_id])
    );

    const resources = members.map((m: any) => {
      const user = {
        ...m.user,
        scim_id: mappingLookup.get(m.user_id) || m.user_id,
        is_active: m.is_active !== false,
      };
      return toScimUser(user, baseUrl);
    });

    return new Response(
      JSON.stringify({
        schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
        totalResults: totalResults || 0,
        startIndex,
        itemsPerPage: resources.length,
        Resources: resources,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/scim+json" } }
    );
  }

  // POST /Users (create)
  if (method === "POST") {
    if (!config.auto_create_users) {
      return createErrorResponse(403, "User creation via SCIM is disabled");
    }

    const body = await req.json();
    const email = body.userName || body.emails?.[0]?.value;

    if (!email) {
      return createErrorResponse(400, "userName or email is required");
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user via Supabase Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: body.displayName || body.name?.formatted,
          first_name: body.name?.givenName,
          last_name: body.name?.familyName,
          scim_provisioned: true,
        },
      });

      if (createError) {
        await supabase.rpc("log_scim_operation", {
          p_organization_id: organizationId,
          p_operation: "create",
          p_resource_type: "User",
          p_resource_id: null,
          p_scim_id: body.externalId,
          p_request_body: body,
          p_response_status: 500,
          p_error_message: createError.message,
        });
        return createErrorResponse(500, createError.message);
      }

      userId = newUser.user.id;
    }

    // Add user to organization
    const { error: memberError } = await supabase
      .from("organization_members")
      .upsert({
        organization_id: organizationId,
        user_id: userId,
        role: config.default_role || "member",
        is_active: body.active !== false,
      });

    if (memberError) {
      return createErrorResponse(500, memberError.message);
    }

    // Create SCIM ID mapping
    const scimId = body.externalId || crypto.randomUUID();
    await supabase.rpc("get_or_create_scim_mapping", {
      p_organization_id: organizationId,
      p_external_id: scimId,
      p_resource_type: "User",
      p_internal_id: userId,
    });

    // Log operation
    await supabase.rpc("log_scim_operation", {
      p_organization_id: organizationId,
      p_operation: "create",
      p_resource_type: "User",
      p_resource_id: userId,
      p_scim_id: scimId,
      p_request_body: body,
      p_response_status: 201,
    });

    // Return created user
    const { data: createdMember } = await supabase
      .from("organization_members")
      .select("*, user:users(*)")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .single();

    const user = {
      ...createdMember.user,
      scim_id: scimId,
      external_id: body.externalId,
      is_active: body.active !== false,
    };

    return new Response(JSON.stringify(toScimUser(user, baseUrl)), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/scim+json" },
    });
  }

  // PUT /Users/:id (replace)
  if (method === "PUT" && id) {
    if (!config.auto_update_users) {
      return createErrorResponse(403, "User update via SCIM is disabled");
    }

    const body = await req.json();

    // Find internal user ID
    const { data: internalId } = await supabase.rpc("find_internal_by_scim_id", {
      p_organization_id: organizationId,
      p_external_id: id,
      p_resource_type: "User",
    });

    const userId = internalId || id;

    // Update user metadata
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: body.displayName || body.name?.formatted,
        first_name: body.name?.givenName,
        last_name: body.name?.familyName,
      },
    });

    // Update organization membership
    await supabase
      .from("organization_members")
      .update({ is_active: body.active !== false })
      .eq("organization_id", organizationId)
      .eq("user_id", userId);

    // Log operation
    await supabase.rpc("log_scim_operation", {
      p_organization_id: organizationId,
      p_operation: "update",
      p_resource_type: "User",
      p_resource_id: userId,
      p_scim_id: id,
      p_request_body: body,
      p_response_status: 200,
    });

    // Return updated user
    const { data: updatedMember } = await supabase
      .from("organization_members")
      .select("*, user:users(*)")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .single();

    if (!updatedMember) {
      return createErrorResponse(404, `User ${id} not found`);
    }

    const user = {
      ...updatedMember.user,
      scim_id: id,
      is_active: updatedMember.is_active !== false,
    };

    return new Response(JSON.stringify(toScimUser(user, baseUrl)), {
      headers: { ...corsHeaders, "Content-Type": "application/scim+json" },
    });
  }

  // PATCH /Users/:id (partial update)
  if (method === "PATCH" && id) {
    if (!config.auto_update_users) {
      return createErrorResponse(403, "User update via SCIM is disabled");
    }

    const body = await req.json();

    // Find internal user ID
    const { data: internalId } = await supabase.rpc("find_internal_by_scim_id", {
      p_organization_id: organizationId,
      p_external_id: id,
      p_resource_type: "User",
    });

    const userId = internalId || id;

    // Process SCIM PATCH operations
    for (const operation of body.Operations || []) {
      const op = operation.op?.toLowerCase();
      const path = operation.path?.toLowerCase();
      const value = operation.value;

      if (path === "active" || (!path && typeof value === "object" && "active" in value)) {
        const isActive = path ? value : value.active;

        if (op === "replace" || op === "add") {
          await supabase
            .from("organization_members")
            .update({ is_active: isActive })
            .eq("organization_id", organizationId)
            .eq("user_id", userId);
        }
      }
    }

    // Log operation
    await supabase.rpc("log_scim_operation", {
      p_organization_id: organizationId,
      p_operation: "update",
      p_resource_type: "User",
      p_resource_id: userId,
      p_scim_id: id,
      p_request_body: body,
      p_response_status: 200,
    });

    // Return updated user
    const { data: updatedMember } = await supabase
      .from("organization_members")
      .select("*, user:users(*)")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .single();

    if (!updatedMember) {
      return createErrorResponse(404, `User ${id} not found`);
    }

    const user = {
      ...updatedMember.user,
      scim_id: id,
      is_active: updatedMember.is_active !== false,
    };

    return new Response(JSON.stringify(toScimUser(user, baseUrl)), {
      headers: { ...corsHeaders, "Content-Type": "application/scim+json" },
    });
  }

  // DELETE /Users/:id
  if (method === "DELETE" && id) {
    if (!config.auto_deactivate_users) {
      return createErrorResponse(403, "User deletion via SCIM is disabled");
    }

    // Find internal user ID
    const { data: internalId } = await supabase.rpc("find_internal_by_scim_id", {
      p_organization_id: organizationId,
      p_external_id: id,
      p_resource_type: "User",
    });

    const userId = internalId || id;

    // Soft delete: deactivate user in organization
    await supabase
      .from("organization_members")
      .update({ is_active: false })
      .eq("organization_id", organizationId)
      .eq("user_id", userId);

    // Log operation
    await supabase.rpc("log_scim_operation", {
      p_organization_id: organizationId,
      p_operation: "delete",
      p_resource_type: "User",
      p_resource_id: userId,
      p_scim_id: id,
      p_request_body: null,
      p_response_status: 204,
    });

    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  return createErrorResponse(405, "Method not allowed");
}

// Handle /Groups endpoints
async function handleGroups(
  supabase: any,
  organizationId: string,
  method: string,
  id: string | undefined,
  url: URL,
  req: Request,
  baseUrl: string
): Promise<Response> {
  // Note: Groups are mapped to teams/departments in the organization

  // GET /Groups/:id
  if (method === "GET" && id) {
    const { data: mapping } = await supabase.rpc("find_internal_by_scim_id", {
      p_organization_id: organizationId,
      p_external_id: id,
      p_resource_type: "Group",
    });

    const groupId = mapping || id;

    // Get group (team) and its members
    const { data: team, error } = await supabase
      .from("teams")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("id", groupId)
      .single();

    if (error || !team) {
      return createErrorResponse(404, `Group ${id} not found`);
    }

    const { data: members } = await supabase
      .from("team_members")
      .select("user_id, users(email, full_name)")
      .eq("team_id", groupId);

    const memberList = (members || []).map((m: any) => ({
      user_id: m.user_id,
      user_email: m.users?.email,
      user_name: m.users?.full_name,
    }));

    const group = { ...team, scim_id: id };

    return new Response(JSON.stringify(toScimGroup(group, memberList, baseUrl)), {
      headers: { ...corsHeaders, "Content-Type": "application/scim+json" },
    });
  }

  // GET /Groups (list)
  if (method === "GET") {
    const startIndex = parseInt(url.searchParams.get("startIndex") || "1");
    const count = Math.min(parseInt(url.searchParams.get("count") || "100"), 100);

    const { data: teams, error, count: totalResults } = await supabase
      .from("teams")
      .select("*", { count: "exact" })
      .eq("organization_id", organizationId)
      .range(startIndex - 1, startIndex - 1 + count - 1);

    if (error) {
      return createErrorResponse(500, error.message);
    }

    // Get SCIM mappings
    const teamIds = teams.map((t: any) => t.id);
    const { data: mappings } = await supabase
      .from("scim_external_ids")
      .select("external_id, internal_id")
      .eq("organization_id", organizationId)
      .eq("resource_type", "Group")
      .in("internal_id", teamIds);

    const mappingLookup = new Map(
      (mappings || []).map((m: any) => [m.internal_id, m.external_id])
    );

    const resources = teams.map((t: any) => {
      const group = { ...t, scim_id: mappingLookup.get(t.id) || t.id };
      return toScimGroup(group, [], baseUrl);
    });

    return new Response(
      JSON.stringify({
        schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
        totalResults: totalResults || 0,
        startIndex,
        itemsPerPage: resources.length,
        Resources: resources,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/scim+json" } }
    );
  }

  // POST /Groups (create)
  if (method === "POST") {
    const body = await req.json();

    if (!body.displayName) {
      return createErrorResponse(400, "displayName is required");
    }

    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        organization_id: organizationId,
        name: body.displayName,
        description: `SCIM provisioned group`,
      })
      .select()
      .single();

    if (error) {
      return createErrorResponse(500, error.message);
    }

    // Create SCIM ID mapping
    const scimId = body.externalId || crypto.randomUUID();
    await supabase.rpc("get_or_create_scim_mapping", {
      p_organization_id: organizationId,
      p_external_id: scimId,
      p_resource_type: "Group",
      p_internal_id: team.id,
    });

    // Log operation
    await supabase.rpc("log_scim_operation", {
      p_organization_id: organizationId,
      p_operation: "create",
      p_resource_type: "Group",
      p_resource_id: team.id,
      p_scim_id: scimId,
      p_request_body: body,
      p_response_status: 201,
    });

    // Add members if provided
    if (body.members?.length > 0) {
      for (const member of body.members) {
        const { data: internalUserId } = await supabase.rpc("find_internal_by_scim_id", {
          p_organization_id: organizationId,
          p_external_id: member.value,
          p_resource_type: "User",
        });

        if (internalUserId) {
          await supabase.from("team_members").insert({
            team_id: team.id,
            user_id: internalUserId,
          });
        }
      }
    }

    const group = { ...team, scim_id: scimId };

    return new Response(JSON.stringify(toScimGroup(group, body.members || [], baseUrl)), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/scim+json" },
    });
  }

  // PATCH /Groups/:id (update members)
  if (method === "PATCH" && id) {
    const body = await req.json();

    const { data: internalGroupId } = await supabase.rpc("find_internal_by_scim_id", {
      p_organization_id: organizationId,
      p_external_id: id,
      p_resource_type: "Group",
    });

    const groupId = internalGroupId || id;

    // Process SCIM PATCH operations
    for (const operation of body.Operations || []) {
      const op = operation.op?.toLowerCase();
      const path = operation.path?.toLowerCase();
      const value = operation.value;

      if (path?.startsWith("members") || path === "members") {
        if (op === "add") {
          // Add members
          const membersToAdd = Array.isArray(value) ? value : [value];
          for (const member of membersToAdd) {
            const { data: internalUserId } = await supabase.rpc("find_internal_by_scim_id", {
              p_organization_id: organizationId,
              p_external_id: member.value,
              p_resource_type: "User",
            });

            if (internalUserId) {
              await supabase.from("team_members").upsert({
                team_id: groupId,
                user_id: internalUserId,
              });
            }
          }
        } else if (op === "remove") {
          // Remove members
          const membersToRemove = Array.isArray(value) ? value : [value];
          for (const member of membersToRemove) {
            const { data: internalUserId } = await supabase.rpc("find_internal_by_scim_id", {
              p_organization_id: organizationId,
              p_external_id: member.value,
              p_resource_type: "User",
            });

            if (internalUserId) {
              await supabase
                .from("team_members")
                .delete()
                .eq("team_id", groupId)
                .eq("user_id", internalUserId);
            }
          }
        }
      } else if (path === "displayname" || (!path && typeof value === "object" && "displayName" in value)) {
        const displayName = path ? value : value.displayName;
        await supabase
          .from("teams")
          .update({ name: displayName })
          .eq("id", groupId);
      }
    }

    // Log operation
    await supabase.rpc("log_scim_operation", {
      p_organization_id: organizationId,
      p_operation: "update",
      p_resource_type: "Group",
      p_resource_id: groupId,
      p_scim_id: id,
      p_request_body: body,
      p_response_status: 200,
    });

    // Return updated group
    const { data: updatedTeam } = await supabase
      .from("teams")
      .select("*")
      .eq("id", groupId)
      .single();

    const { data: members } = await supabase
      .from("team_members")
      .select("user_id, users(email, full_name)")
      .eq("team_id", groupId);

    const memberList = (members || []).map((m: any) => ({
      user_id: m.user_id,
      user_email: m.users?.email,
      user_name: m.users?.full_name,
    }));

    const group = { ...updatedTeam, scim_id: id };

    return new Response(JSON.stringify(toScimGroup(group, memberList, baseUrl)), {
      headers: { ...corsHeaders, "Content-Type": "application/scim+json" },
    });
  }

  // DELETE /Groups/:id
  if (method === "DELETE" && id) {
    const { data: internalGroupId } = await supabase.rpc("find_internal_by_scim_id", {
      p_organization_id: organizationId,
      p_external_id: id,
      p_resource_type: "Group",
    });

    const groupId = internalGroupId || id;

    // Delete team members first
    await supabase.from("team_members").delete().eq("team_id", groupId);

    // Delete team
    await supabase.from("teams").delete().eq("id", groupId);

    // Delete SCIM mapping
    await supabase
      .from("scim_external_ids")
      .delete()
      .eq("organization_id", organizationId)
      .eq("external_id", id)
      .eq("resource_type", "Group");

    // Log operation
    await supabase.rpc("log_scim_operation", {
      p_organization_id: organizationId,
      p_operation: "delete",
      p_resource_type: "Group",
      p_resource_id: groupId,
      p_scim_id: id,
      p_request_body: null,
      p_response_status: 204,
    });

    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  return createErrorResponse(405, "Method not allowed");
}
