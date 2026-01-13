import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const hrTools = [
  {
    name: "list_employees",
    description: "従業員の一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        department: {
          type: "string",
          description: "部署でフィルタ",
        },
        status: {
          type: "string",
          enum: ["active", "inactive", "on_leave"],
          description: "ステータスでフィルタ",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト: 20）",
        },
      },
      required: [],
    },
  },
  {
    name: "employee_get",
    description: "指定されたIDの従業員の詳細を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        employee_id: {
          type: "string",
          description: "従業員ID",
        },
      },
      required: ["employee_id"],
    },
  },
  {
    name: "employee_create",
    description: "新しい従業員を追加します。",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "氏名",
        },
        email: {
          type: "string",
          description: "メールアドレス",
        },
        department: {
          type: "string",
          description: "部署",
        },
        position: {
          type: "string",
          description: "役職",
        },
        hire_date: {
          type: "string",
          description: "入社日（YYYY-MM-DD形式）",
        },
        salary: {
          type: "number",
          description: "給与（月額）",
        },
      },
      required: ["name", "email", "department"],
    },
  },
  {
    name: "employee_update",
    description: "従業員情報を更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        employee_id: {
          type: "string",
          description: "従業員ID",
        },
        department: {
          type: "string",
          description: "部署",
        },
        position: {
          type: "string",
          description: "役職",
        },
        status: {
          type: "string",
          enum: ["active", "inactive", "on_leave"],
          description: "ステータス",
        },
        salary: {
          type: "number",
          description: "給与（月額）",
        },
      },
      required: ["employee_id"],
    },
  },
  {
    name: "attendance_clock_in",
    description: "出勤打刻を記録します。",
    input_schema: {
      type: "object" as const,
      properties: {
        employee_id: {
          type: "string",
          description: "従業員ID",
        },
        note: {
          type: "string",
          description: "備考",
        },
      },
      required: ["employee_id"],
    },
  },
  {
    name: "attendance_clock_out",
    description: "退勤打刻を記録します。",
    input_schema: {
      type: "object" as const,
      properties: {
        employee_id: {
          type: "string",
          description: "従業員ID",
        },
        note: {
          type: "string",
          description: "備考",
        },
      },
      required: ["employee_id"],
    },
  },
  {
    name: "attendance_list",
    description: "勤怠記録の一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        employee_id: {
          type: "string",
          description: "従業員IDでフィルタ",
        },
        start_date: {
          type: "string",
          description: "開始日（YYYY-MM-DD形式）",
        },
        end_date: {
          type: "string",
          description: "終了日（YYYY-MM-DD形式）",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト: 30）",
        },
      },
      required: [],
    },
  },
  {
    name: "calculate_payroll",
    description: "給与計算を実行します。指定月の給与明細を生成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        employee_id: {
          type: "string",
          description: "従業員ID（指定しない場合は全員）",
        },
        year: {
          type: "number",
          description: "対象年",
        },
        month: {
          type: "number",
          description: "対象月",
        },
      },
      required: ["year", "month"],
    },
  },
];

export async function executeHrTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "list_employees": {
      let query = supabase
        .from("employees")
        .select("*")
        .eq("user_id", userId)
        .order("name", { ascending: true })
        .limit(input.limit as number || 20);

      if (input.department) {
        query = query.ilike("department", `%${input.department}%`);
      }
      if (input.status) {
        query = query.eq("status", input.status);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { employees: data, count: data?.length || 0 };
    }

    case "employee_get": {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", input.employee_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);
      return { employee: data };
    }

    case "employee_create": {
      const { data, error } = await supabase
        .from("employees")
        .insert({
          user_id: userId,
          name: input.name,
          email: input.email,
          department: input.department,
          position: input.position,
          hire_date: input.hire_date,
          salary: input.salary,
          status: "active",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { employee: data, message: "従業員を追加しました" };
    }

    case "employee_update": {
      const updateData: Record<string, unknown> = {};
      if (input.department) updateData.department = input.department;
      if (input.position) updateData.position = input.position;
      if (input.status) updateData.status = input.status;
      if (input.salary !== undefined) updateData.salary = input.salary;

      const { data, error } = await supabase
        .from("employees")
        .update(updateData)
        .eq("id", input.employee_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { employee: data, message: "従業員情報を更新しました" };
    }

    case "attendance_clock_in": {
      const now = new Date();
      const { data, error } = await supabase
        .from("attendance_records")
        .insert({
          employee_id: input.employee_id,
          user_id: userId,
          date: now.toISOString().split("T")[0],
          clock_in: now.toISOString(),
          note: input.note,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { attendance: data, message: `${now.toLocaleTimeString("ja-JP")}に出勤を記録しました` };
    }

    case "attendance_clock_out": {
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      // Find today's attendance record
      const { data: existing, error: findError } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("employee_id", input.employee_id)
        .eq("date", today)
        .is("clock_out", null)
        .single();

      if (findError) throw new Error("本日の出勤記録が見つかりません");

      const { data, error } = await supabase
        .from("attendance_records")
        .update({
          clock_out: now.toISOString(),
          note: input.note ? `${existing.note || ""} ${input.note}` : existing.note,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Calculate working hours
      const clockIn = new Date(existing.clock_in);
      const workingHours = (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

      return {
        attendance: data,
        message: `${now.toLocaleTimeString("ja-JP")}に退勤を記録しました（勤務時間: ${workingHours.toFixed(1)}時間）`,
      };
    }

    case "attendance_list": {
      let query = supabase
        .from("attendance_records")
        .select(`
          *,
          employees (name)
        `)
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(input.limit as number || 30);

      if (input.employee_id) {
        query = query.eq("employee_id", input.employee_id);
      }
      if (input.start_date) {
        query = query.gte("date", input.start_date);
      }
      if (input.end_date) {
        query = query.lte("date", input.end_date);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { attendance_records: data, count: data?.length || 0 };
    }

    case "calculate_payroll": {
      const year = input.year as number;
      const month = input.month as number;
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      // Get employees
      let employeeQuery = supabase
        .from("employees")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active");

      if (input.employee_id) {
        employeeQuery = employeeQuery.eq("id", input.employee_id);
      }

      const { data: employees, error: empError } = await employeeQuery;
      if (empError) throw new Error(empError.message);

      const payrollResults = [];

      for (const employee of employees || []) {
        // Get attendance records for the month
        const { data: attendance, error: attError } = await supabase
          .from("attendance_records")
          .select("*")
          .eq("employee_id", employee.id)
          .gte("date", startDate)
          .lte("date", endDate);

        if (attError) throw new Error(attError.message);

        // Calculate working hours
        let totalHours = 0;
        for (const record of attendance || []) {
          if (record.clock_in && record.clock_out) {
            const hours = (new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()) / (1000 * 60 * 60);
            totalHours += hours;
          }
        }

        // Calculate pay (simplified)
        const baseSalary = employee.salary || 0;
        const workingDays = attendance?.length || 0;

        payrollResults.push({
          employee_id: employee.id,
          employee_name: employee.name,
          period: `${year}年${month}月`,
          working_days: workingDays,
          total_hours: Math.round(totalHours * 10) / 10,
          base_salary: baseSalary,
          gross_pay: baseSalary,
          // Simplified deductions
          deductions: {
            health_insurance: Math.round(baseSalary * 0.05),
            pension: Math.round(baseSalary * 0.0915),
            income_tax: Math.round(baseSalary * 0.1),
          },
          net_pay: Math.round(baseSalary * 0.7585),
        });
      }

      return {
        period: `${year}年${month}月`,
        payroll: payrollResults,
        total_gross: payrollResults.reduce((sum, p) => sum + p.gross_pay, 0),
        total_net: payrollResults.reduce((sum, p) => sum + p.net_pay, 0),
      };
    }

    default:
      throw new Error(`Unknown HR tool: ${toolName}`);
  }
}
