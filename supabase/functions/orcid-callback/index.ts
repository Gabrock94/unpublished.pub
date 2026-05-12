import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const ORCID_TOKEN_URL = "https://orcid.org/oauth/token";
const CLIENT_ID = "APP-HIW7OM4YIXTBWLOB";
const CLIENT_SECRET = "f78831af-78e5-4a13-8664-d05f88145d25";
const REDIRECT_URI = "https://ckdobiuktlxgmdvuuolg.supabase.co/functions/v1/orcid-callback";
const FRONTEND_URL = "https://unpublished.pub"; // ← change if needed
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
Deno.serve(async (req)=>{
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Missing code", {
      status: 400
    });
  }
  // Exchange code for ORCID access token
  const tokenRes = await fetch(ORCID_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI
    })
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("Token exchange failed:", err);
    return new Response(`Token exchange failed: ${err}`, {
      status: 500
    });
  }
  const tokenData = await tokenRes.json();
  const orcid = tokenData.orcid;
  const name = tokenData.name;
  if (!orcid) {
    return new Response("No ORCID returned", {
      status: 500
    });
  }
  // Create session row in Supabase
  const { data: session, error } = await supabase.from("sessions").insert({
    orcid,
    name
  }).select("id").single();
  if (error || !session) {
    console.error("Session insert failed:", error);
    return new Response("Session creation failed", {
      status: 500
    });
  }
  // Redirect back to frontend with session ID
  return Response.redirect(`${FRONTEND_URL}/?session=${session.id}`, 302);
});
