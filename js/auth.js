import { supabase } from "./supabaseClient.js";

export async function signUp(email, password) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function requireLogin() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireLogin();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}

export async function wireNav() {
  const logoutLink = document.getElementById("logout-link");
  const loginLink = document.getElementById("login-link");
  const ordersLink = document.getElementById("orders-link");
  const adminLink = document.getElementById("admin-link");

  logoutLink?.addEventListener("click", async (e) => {
    e.preventDefault();
    await signOut();
    window.location.href = "index.html";
  });

  const user = await getCurrentUser();
  if (!user) {
    if (loginLink) loginLink.hidden = false;
    return;
  }

  if (logoutLink) logoutLink.hidden = false;
  if (ordersLink) ordersLink.hidden = false;

  if (!adminLink) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profile?.is_admin) {
    adminLink.hidden = false;
  }
}
