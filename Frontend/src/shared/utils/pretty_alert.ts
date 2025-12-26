export function prettyAlert(message: string, type: "success" | "error" = "success") {
  if (typeof document === "undefined") return;

  const wrapId = "pa-wrap";
  let wrap = document.getElementById(wrapId);
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = wrapId;
    wrap.className = "pa-wrap";
    document.body.appendChild(wrap);
  }

  const toast = document.createElement("div");
  toast.className = `pa-toast ${type === "error" ? "pa-error" : ""}`;

  const bar = document.createElement("div");
  bar.className = "pa-bar";

  const content = document.createElement("div");

  const title = document.createElement("div");
  title.className = "pa-title";
  title.textContent = type === "error" ? "خطا" : "موفقیت";

  const msg = document.createElement("div");
  msg.className = "pa-msg";
  msg.textContent = message;

  content.appendChild(title);
  content.appendChild(msg);

  const close = document.createElement("button");
  close.className = "pa-x";
  close.type = "button";
  close.textContent = "✕";

  const remove = () => {
    toast.classList.remove("pa-show");
    window.setTimeout(() => toast.remove(), 200);
  };
  close.onclick = remove;

  toast.appendChild(bar);
  toast.appendChild(content);
  toast.appendChild(close);

  wrap.appendChild(toast);

  window.setTimeout(() => toast.classList.add("pa-show"), 10);
  window.setTimeout(remove, 3000);
}
