// src/services/comment.service.ts
import axios from "axios";

const BASES = [
  "http://localhost:8888/api/comments",
  "http://localhost:8888/api/comments/comments",
] as const;

/* =========== helpers =========== */
async function getWithFallback<T>(path: string): Promise<T> {
  let lastErr: any;
  for (const b of BASES) {
    try {
      const res = await axios.get<T>(`${b}${path}`);
      return res.data as T;
    } catch (e: any) {
      lastErr = e;
      if (e?.response?.status !== 404) throw e;
    }
  }
  throw lastErr;
}

async function deleteWithFallback<T>(path: string, headers?: any): Promise<T> {
  let lastErr: any;
  for (const b of BASES) {
    try {
      const res = await axios.delete<T>(`${b}${path}`, headers);
      return res.data as T;
    } catch (e: any) {
      lastErr = e;
      if (e?.response?.status !== 404) throw e;
    }
  }
  throw lastErr;
}

export function getAuthHeaders(): Record<string, string> | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = localStorage.getItem("token");
  if (!raw) return undefined;
  return { Authorization: raw.toLowerCase().startsWith("bearer ") ? raw : `Bearer ${raw}` };
}

/* =========== APIS =========== */

/** GET: tất cả comment (admin) – có phân trang/lọc) */
export async function getAllComments(params?: {
  page?: number;
  limit?: number;
  q?: string;          // search content
  star?: number;       // 1..5
  productId?: string;  // lọc theo product
}) {
  const qsp = new URLSearchParams();
  if (params?.page)      qsp.set("page", String(params.page));
  if (params?.limit)     qsp.set("limit", String(params.limit));
  if (params?.q)         qsp.set("q", params.q);
  if (params?.star)      qsp.set("star", String(params.star));
  if (params?.productId) qsp.set("productId", params.productId);

  const qs = qsp.toString();
  return getWithFallback<{ items: any[]; total: number; page: number; pages: number }>(
    `/${qs ? `?${qs}` : ""}`
  );
}

/** GET: comment theo productId (gốc + reply nếu all=true) */
export async function getCommentsByProduct(productId: string, all = true) {
  return getWithFallback<any[]>(`/${productId}${all ? "?all=1" : ""}`);
}

/** DELETE: xoá 1 comment theo id (cần token) */
export async function deleteComment(id: string) {
  const headers = getAuthHeaders();
  return deleteWithFallback<{ message: string }>(
    `/${id}`,
    headers ? { headers } : undefined
  );
}
