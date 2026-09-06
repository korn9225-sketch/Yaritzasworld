export default async (request, context) => {
  const url = new URL(request.url);
  const fetchDestination = request.headers.get("sec-fetch-dest");
  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  const isAssetRequest = /\.(css|js|png|jpe?g|gif|svg|webp|ico|mp4|webm|mp3|woff2?|ttf|json|map|xml|txt)(?:\?.*)?$/i.test(url.pathname);
  const isDocumentRequest = fetchDestination === "document" || (!fetchDestination && acceptsHtml) || (request.method === "GET" && !isAssetRequest && acceptsHtml);

  if (!isDocumentRequest) {
    return context.next();
  }

  const visitor = {
    ip: context.ip ?? request.headers.get("x-forwarded-for") ?? request.headers.get("cf-connecting-ip"),
    city: context.geo?.city,
    country: context.geo?.country?.name ?? context.geo?.country?.code,
  };

  console.log("Visitor:", JSON.stringify(visitor));

  try {
    const webhookUrl = Netlify.env.get("DISCORD_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_URL is not configured");
      return context.next();
    }

    const timestamp = new Date().toISOString();
    const response = await fetch(
      webhookUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `✨ New visitor on Her Little Universe\n📍 IP: ${visitor.ip ?? "Unknown"}\n🏙️ City: ${visitor.city ?? "Unknown"}\n🌍 Country: ${visitor.country ?? "Unknown"}\n🕒 Time: ${timestamp}`,
        }),
      },
    );

    if (!response.ok) {
      console.error(`Discord webhook rejected visitor log: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to send visitor data to Discord:", error);
  }

  return context.next();
};

export const config = {
  path: "/*",
};
