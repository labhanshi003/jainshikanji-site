export async function staffLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}
