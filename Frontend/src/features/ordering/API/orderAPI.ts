// types/orders.ts

export interface OrderData {
  title: string;
  categoryId: number;
  budget: number;
  address: string;
  deadline: Date; // ← قبلاً string بود
  description: string;
  designerId?: number;
}


export interface OrderResponse extends OrderData {
  id: string;
  status: "pending" | "accepted" | "completed" | "cancelled" | string;
  designerName?: string;
}

export async function submitOrder(data: OrderData): Promise<OrderResponse> {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5157/request/api/ProjectRequest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "خطا در ارسال سفارش");
  }

  return res.json();
}

export async function fetchUserOrders(): Promise<OrderResponse[]> {
  const token = localStorage.getItem("token");

  const res = await fetch("https://your-api.com/orders/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("خطا در دریافت سفارش‌ها");
  }

  return res.json();
}
