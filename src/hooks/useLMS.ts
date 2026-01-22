import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "./useCompany";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

// Types from Supabase schema
type LmsCourseRow = Database["public"]["Tables"]["lms_courses"]["Row"];
type LmsLessonRow = Database["public"]["Tables"]["lms_lessons"]["Row"];
type LmsEnrollmentRow = Database["public"]["Tables"]["lms_enrollments"]["Row"];
type LmsTestRow = Database["public"]["Tables"]["lms_tests"]["Row"];
type LmsQuestionRow = Database["public"]["Tables"]["lms_questions"]["Row"];
type LmsTestResultRow = Database["public"]["Tables"]["lms_test_results"]["Row"];

// Extended types with relations
export interface LmsCourse extends LmsCourseRow {}

export interface LmsLesson extends LmsLessonRow {}

export interface LmsEnrollment extends LmsEnrollmentRow {
  course?: LmsCourse;
}

export interface LmsTest extends LmsTestRow {
  course?: LmsCourse;
}

export interface LmsQuestion extends LmsQuestionRow {}

export interface LmsTestResult extends LmsTestResultRow {
  test?: LmsTest;
}

// Courses Hook
export function useCourses() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ["lms-courses", currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      const { data, error } = await supabase
        .from("lms_courses")
        .select("*")
        .eq("company_id", currentCompany.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.id,
  });

  const createCourse = useMutation({
    mutationFn: async (input: { title: string; description?: string; category?: string; is_published?: boolean }) => {
      if (!currentCompany?.id) throw new Error("会社が選択されていません");
      const { data, error } = await supabase
        .from("lms_courses")
        .insert({ ...input, company_id: currentCompany.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-courses"] });
      toast.success("コースを作成しました");
    },
    onError: (error) => {
      toast.error("コースの作成に失敗しました: " + error.message);
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<LmsCourseRow>) => {
      const { data, error } = await supabase
        .from("lms_courses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-courses"] });
      toast.success("コースを更新しました");
    },
    onError: (error) => {
      toast.error("コースの更新に失敗しました: " + error.message);
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lms_courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-courses"] });
      toast.success("コースを削除しました");
    },
    onError: (error) => {
      toast.error("コースの削除に失敗しました: " + error.message);
    },
  });

  return { courses, isLoading, error, createCourse, updateCourse, deleteCourse };
}

// Lessons Hook
export function useLessons(courseId?: string) {
  const queryClient = useQueryClient();

  const { data: lessons = [], isLoading, error } = useQuery({
    queryKey: ["lms-lessons", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data, error } = await supabase
        .from("lms_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  const createLesson = useMutation({
    mutationFn: async (input: { course_id: string; title: string; content_type?: string; content_text?: string; sort_order?: number }) => {
      const { data, error } = await supabase
        .from("lms_lessons")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-lessons"] });
      toast.success("レッスンを作成しました");
    },
    onError: (error) => {
      toast.error("レッスンの作成に失敗しました: " + error.message);
    },
  });

  const updateLesson = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<LmsLessonRow>) => {
      const { data, error } = await supabase
        .from("lms_lessons")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-lessons"] });
      toast.success("レッスンを更新しました");
    },
    onError: (error) => {
      toast.error("レッスンの更新に失敗しました: " + error.message);
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lms_lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-lessons"] });
      toast.success("レッスンを削除しました");
    },
    onError: (error) => {
      toast.error("レッスンの削除に失敗しました: " + error.message);
    },
  });

  return { lessons, isLoading, error, createLesson, updateLesson, deleteLesson };
}

// Enrollments Hook
export function useEnrollments(courseId?: string) {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading, error } = useQuery({
    queryKey: ["lms-enrollments", courseId],
    queryFn: async () => {
      let query = supabase
        .from("lms_enrollments")
        .select("*, course:lms_courses(*)");
      if (courseId) {
        query = query.eq("course_id", courseId);
      }
      const { data, error } = await query.order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: true,
  });

  const enrollUser = useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { data, error } = await supabase
        .from("lms_enrollments")
        .insert({
          user_id: userId,
          course_id: courseId,
          progress: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-enrollments"] });
      toast.success("受講登録しました");
    },
    onError: (error) => {
      toast.error("受講登録に失敗しました: " + error.message);
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const updates: { progress: number; completed_at?: string } = { progress };
      if (progress >= 100) {
        updates.completed_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from("lms_enrollments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-enrollments"] });
    },
    onError: (error) => {
      toast.error("進捗の更新に失敗しました: " + error.message);
    },
  });

  return { enrollments, isLoading, error, enrollUser, updateProgress };
}

// Tests Hook
export function useTests() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: tests = [], isLoading, error } = useQuery({
    queryKey: ["lms-tests", currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      const { data, error } = await supabase
        .from("lms_tests")
        .select("*, course:lms_courses(*)")
        .eq("company_id", currentCompany.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.id,
  });

  const createTest = useMutation({
    mutationFn: async (input: { title: string; description?: string; course_id?: string; time_limit_minutes?: number; pass_score?: number; max_attempts?: number }) => {
      if (!currentCompany?.id) throw new Error("会社が選択されていません");
      const { data, error } = await supabase
        .from("lms_tests")
        .insert({ ...input, company_id: currentCompany.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-tests"] });
      toast.success("テストを作成しました");
    },
    onError: (error) => {
      toast.error("テストの作成に失敗しました: " + error.message);
    },
  });

  const updateTest = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<LmsTestRow>) => {
      const { data, error } = await supabase
        .from("lms_tests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-tests"] });
      toast.success("テストを更新しました");
    },
    onError: (error) => {
      toast.error("テストの更新に失敗しました: " + error.message);
    },
  });

  const deleteTest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lms_tests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-tests"] });
      toast.success("テストを削除しました");
    },
    onError: (error) => {
      toast.error("テストの削除に失敗しました: " + error.message);
    },
  });

  return { tests, isLoading, error, createTest, updateTest, deleteTest };
}

// Questions Hook
export function useQuestions(testId?: string) {
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ["lms-questions", testId],
    queryFn: async () => {
      if (!testId) return [];
      const { data, error } = await supabase
        .from("lms_questions")
        .select("*")
        .eq("test_id", testId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!testId,
  });

  const createQuestion = useMutation({
    mutationFn: async (input: { test_id: string; question_text: string; question_type: string; options?: Json; correct_answer: Json; points?: number; sort_order?: number; explanation?: string }) => {
      const { data, error } = await supabase
        .from("lms_questions")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-questions"] });
      toast.success("問題を作成しました");
    },
    onError: (error) => {
      toast.error("問題の作成に失敗しました: " + error.message);
    },
  });

  const updateQuestion = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<LmsQuestionRow>) => {
      const { data, error } = await supabase
        .from("lms_questions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-questions"] });
      toast.success("問題を更新しました");
    },
    onError: (error) => {
      toast.error("問題の更新に失敗しました: " + error.message);
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lms_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lms-questions"] });
      toast.success("問題を削除しました");
    },
    onError: (error) => {
      toast.error("問題の削除に失敗しました: " + error.message);
    },
  });

  return { questions, isLoading, error, createQuestion, updateQuestion, deleteQuestion };
}

// Test Results Hook
export function useTestResults(testId?: string) {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ["lms-test-results", currentCompany?.id, testId],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      let query = supabase
        .from("lms_test_results")
        .select("*, test:lms_tests(*)")
        .eq("company_id", currentCompany.id);
      if (testId) {
        query = query.eq("test_id", testId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.id,
  });

  const submitResult = useMutation({
    mutationFn: async (input: {
      testId: string;
      userId: string;
      answers: Record<string, unknown>;
      score: number;
      maxScore: number;
      passed: boolean;
    }) => {
      if (!currentCompany?.id) throw new Error("会社が選択されていません");
      
      // Get attempt number
      const { data: existing } = await supabase
        .from("lms_test_results")
        .select("attempt_number")
        .eq("test_id", input.testId)
        .eq("user_id", input.userId)
        .order("attempt_number", { ascending: false })
        .limit(1);
      
      const attemptNumber = existing && existing.length > 0 
        ? (existing[0].attempt_number || 0) + 1 
        : 1;

      const { data, error } = await supabase
        .from("lms_test_results")
        .insert({
          test_id: input.testId,
          user_id: input.userId,
          company_id: currentCompany.id,
          answers: input.answers as Json,
          score: input.score,
          max_score: input.maxScore,
          passed: input.passed,
          completed_at: new Date().toISOString(),
          attempt_number: attemptNumber,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lms-test-results"] });
      if (data.passed) {
        toast.success("合格おめでとうございます！");
      } else {
        toast.info("残念ながら不合格でした。再挑戦してください。");
      }
    },
    onError: (error) => {
      toast.error("結果の保存に失敗しました: " + error.message);
    },
  });

  return { results, isLoading, error, submitResult };
}

// My Learning Hook (for individual users)
export function useMyLearning() {
  const { data: currentCompany } = useCurrentCompany();

  const { data: myEnrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("lms_enrollments")
        .select("*, course:lms_courses(*)")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["my-test-results", currentCompany?.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from("lms_test_results")
        .select("*, test:lms_tests(*)")
        .eq("user_id", user.id)
        .eq("company_id", currentCompany.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.id,
  });

  return {
    myEnrollments,
    myResults,
    isLoading: enrollmentsLoading || resultsLoading,
  };
}

// Stats Hook
export function useLMSStats() {
  const { data: currentCompany } = useCurrentCompany();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["lms-stats", currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return null;

      const [coursesRes, testsRes, enrollmentsRes, resultsRes] = await Promise.all([
        supabase.from("lms_courses").select("id", { count: "exact" }).eq("company_id", currentCompany.id),
        supabase.from("lms_tests").select("id", { count: "exact" }).eq("company_id", currentCompany.id),
        supabase.from("lms_enrollments").select("id, completed_at").eq("course:lms_courses.company_id" as never, currentCompany.id),
        supabase.from("lms_test_results").select("id, passed", { count: "exact" }).eq("company_id", currentCompany.id),
      ]);

      const completedEnrollments = enrollmentsRes.data?.filter(e => e.completed_at).length || 0;
      const passedTests = resultsRes.data?.filter(r => r.passed).length || 0;

      return {
        totalCourses: coursesRes.count || 0,
        totalTests: testsRes.count || 0,
        totalEnrollments: enrollmentsRes.data?.length || 0,
        completedEnrollments,
        totalTestAttempts: resultsRes.count || 0,
        passedTests,
        passRate: resultsRes.count ? Math.round((passedTests / resultsRes.count) * 100) : 0,
      };
    },
    enabled: !!currentCompany?.id,
  });

  return { stats, isLoading };
}
