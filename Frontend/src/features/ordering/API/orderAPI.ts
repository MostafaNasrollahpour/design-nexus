// src/API/orderAPI.ts
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

export async function submitOrder(data: OrderData) {
  const token = localStorage.getItem("token");
  const res = await fetch("https://your-api.com/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("خطا در ارسال سفارش");
  return res.json();
}
