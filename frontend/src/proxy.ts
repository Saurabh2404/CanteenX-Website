import { NextResponse, type NextRequest } from "next/server";
// Only redirect legacy catalogue filters. No database or image requests here.
export function proxy(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  if (!category) return NextResponse.next();
  const target = request.nextUrl.clone();
  target.pathname =
    category === "all"
      ? "/products"
      : `/products/category/${encodeURIComponent(category)}`;
  target.searchParams.delete("category");
  return NextResponse.redirect(target, 308);
}
export const config = { matcher: "/products" };
