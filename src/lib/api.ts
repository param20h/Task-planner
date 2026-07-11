const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiOptions {
  method?: string;
  body?: Record<string, any>;
  params?: Record<string, string>;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("momentum_token");
  }

  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("momentum_token", token);
    }
  }

  clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("momentum_token");
    }
  }

  private async request<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body, params } = options;
    const token = this.getToken();

    let url = `${API_URL}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
  }

  // ─── Auth ────────────────────────────────────────────
  async login(email: string, password: string) {
    const data = await this.request<{ user: any; session: any }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (data.session?.access_token) {
      this.setToken(data.session.access_token);
    }
    return data;
  }

  async register(email: string, password: string, name: string) {
    const data = await this.request<{ user: any; session: any }>("/auth/register", {
      method: "POST",
      body: { email, password, name },
    });
    if (data.session?.access_token) {
      this.setToken(data.session.access_token);
    }
    return data;
  }

  async logout() {
    await this.request("/auth/logout", { method: "POST" });
    this.clearToken();
  }

  async getMe() {
    return this.request<{ user: any }>("/auth/me");
  }

  // ─── Profile ─────────────────────────────────────────
  async getProfile() {
    return this.request<{ name: string; groq_api_key: string }>("/profile");
  }

  async updateProfile(data: { name: string; groq_api_key: string }) {
    return this.request("/profile", { method: "PUT", body: data });
  }

  async deleteAccount() {
    return this.request("/profile", { method: "DELETE" });
  }

  // ─── Food ────────────────────────────────────────────
  async getFood(date?: string) {
    return this.request<any[]>("/food", {
      params: date ? { date } : undefined,
    });
  }

  async addFood(food: {
    meal_type: string;
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) {
    return this.request("/food", { method: "POST", body: food });
  }

  async deleteFood(id: string) {
    return this.request(`/food/${id}`, { method: "DELETE" });
  }

  // ─── Water ───────────────────────────────────────────
  async getWater(date?: string) {
    return this.request<any[]>("/water", {
      params: date ? { date } : undefined,
    });
  }

  async addWater(amount_liters: number) {
    return this.request("/water", {
      method: "POST",
      body: { amount_liters },
    });
  }

  async deleteWater(id: string) {
    return this.request(`/water/${id}`, { method: "DELETE" });
  }

  // ─── Workouts ────────────────────────────────────────
  async getWorkouts() {
    return this.request<any[]>("/workouts");
  }

  async getWorkout(id: string) {
    return this.request<any>(`/workouts/${id}`);
  }

  async createWorkout(workout: {
    name: string;
    notes?: string;
    exercises: { exercise_name: string; sets: { reps: number; weight: number }[] }[];
  }) {
    return this.request("/workouts", { method: "POST", body: workout });
  }

  async updateWorkout(id: string, data: { end_time?: string; notes?: string }) {
    return this.request(`/workouts/${id}`, { method: "PUT", body: data });
  }

  // ─── Tasks ───────────────────────────────────────────
  async getTasks() {
    return this.request<any[]>("/tasks");
  }

  async addTask(task: { title: string; description?: string; due_date?: string }) {
    return this.request("/tasks", { method: "POST", body: task });
  }

  async updateTask(id: string, data: { title?: string; status?: string; description?: string; due_date?: string }) {
    return this.request(`/tasks/${id}`, { method: "PUT", body: data });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, { method: "DELETE" });
  }

  // ─── Planner ─────────────────────────────────────────
  async getPlannerEvents(day: number) {
    return this.request<any[]>("/planner/events", {
      params: { day: String(day) },
    });
  }

  async addPlannerEvent(event: {
    time_slot: string;
    event_title: string;
    description?: string;
    duration?: string;
    day_date: number;
  }) {
    return this.request("/planner/events", { method: "POST", body: event });
  }

  async deletePlannerEvent(id: string) {
    return this.request(`/planner/events/${id}`, { method: "DELETE" });
  }

  // ─── Journal ─────────────────────────────────────────
  async getJournalEntries() {
    return this.request<any[]>("/journal");
  }

  async addJournalEntry(entry: {
    entry_text: string;
    mood: string;
    reflection_text?: string;
  }) {
    return this.request("/journal", { method: "POST", body: entry });
  }

  // ─── Goals ───────────────────────────────────────────
  async getGoals() {
    return this.request<any[]>("/goals");
  }

  async addGoal(goal: {
    title: string;
    category: string;
    progress?: number;
    value_label?: string;
    status?: string;
  }) {
    return this.request("/goals", { method: "POST", body: goal });
  }

  async updateGoal(id: string, data: Record<string, any>) {
    return this.request(`/goals/${id}`, { method: "PUT", body: data });
  }

  // ─── Analytics ───────────────────────────────────────
  async getDashboardStats() {
    return this.request<{
      calories: number;
      water: number;
      workoutCount: number;
      tasksTotal: number;
      tasksCompleted: number;
    }>("/analytics/dashboard");
  }

  // ─── Razorpay Subscriptions ──────────────────────────
  async createRazorpayOrder(currency: string, billingCycle: string) {
    return this.request<{ id: string; amount: number; currency: string }>("/subscription/create-order", {
      method: "POST",
      body: { currency, billingCycle }
    });
  }

  async verifyRazorpayPayment(payload: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) {
    return this.request<{ success: boolean; plan: string }>("/subscription/verify-payment", {
      method: "POST",
      body: payload
    });
  }

  // ─── Admin Dashboard ───────────────────────────────
  async getAdminUsers() {
    return this.request<any[]>("/admin/users");
  }

  async changeUserPlan(targetUserId: string, plan: "pro" | "free") {
    return this.request<{ success: boolean; targetUserId: string; plan: string }>("/admin/change-plan", {
      method: "POST",
      body: { targetUserId, plan }
    });
  }

  async getAdminPayments() {
    return this.request<any[]>("/admin/payments");
  }

  async contactEnterprise() {
    return this.request<{ success: boolean; message: string }>("/subscription/contact-enterprise", {
      method: "POST"
    });
  }
}

export const api = new ApiClient();
