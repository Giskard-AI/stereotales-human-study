import { NextRequest, NextResponse } from "next/server";

export const runtime = "experimental-edge";

function htmlResponse(status: number, icon: string, title: string, message: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f9fafb;
      color: #111827;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .card {
      max-width: 28rem;
      width: 100%;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 1rem;
      padding: 2.5rem 2rem;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0,0,0,.05);
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: .75rem; }
    p { color: #4b5563; line-height: 1.6; }
    .hint { color: #9ca3af; font-size: .85rem; margin-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <p class="hint">If you believe this is an error, please contact the study organizer.</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export function middleware(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const expectedToken = process.env.STUDY_ACCESS_TOKEN;

  if (!expectedToken) {
    console.warn("STUDY_ACCESS_TOKEN is not set — blocking all requests");
    return htmlResponse(
      503,
      "&#9881;",
      "Service Unavailable",
      "The study is not properly configured yet. Please try again later.",
    );
  }

  if (token !== expectedToken) {
    return htmlResponse(
      403,
      "&#128274;",
      "Access Restricted",
      "This study requires a valid access link. Please use the exact URL that was shared with you.",
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
