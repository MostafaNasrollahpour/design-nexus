export interface OrderData {
  name: string;
  email: string;
  title: string;
  category: string;
  budget: string;
  address: string;
  deadline: string;
  description: string;
}

export interface OrderResponse extends OrderData {
  id: string;
  status: string;        // وضعیت سفارش: pending, accepted, completed و غیره
  designerName?: string; // نام طراح در صورت اختصاص سفارش
}

export async function submitOrder(data: OrderData): Promise<OrderResponse> {
  const token = localStorage.getItem("token");
  const res = await fetch("https://your-api.com/orders", {
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
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("خطا در دریافت سفارش‌ها");
  return res.json();
}
