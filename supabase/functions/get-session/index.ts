import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session");
  if (!sessionId) {
    return Response.json({
      authenticated: false,
      error: "Missing session"
    }, {
      status: 400,
      headers: corsHeaders
    });
  }
  const { data: session, error } = await supabase.from("sessions").select("id, orcid, name, expires_at").eq("id", sessionId).single();
  if (error || !session) {
    return Response.json({
      authenticated: false,
      error: "Session not found"
    }, {
      status: 401,
      headers: corsHeaders
    });
  }
  // Check expiry
  if (new Date(session.expires_at) < new Date()) {
    await supabase.from("sessions").delete().eq("id", sessionId);
    return Response.json({
      authenticated: false,
      error: "Session expired"
    }, {
      status: 401,
      headers: corsHeaders
    });
  }
  return Response.json({
    authenticated: true,
    orcid: session.orcid,
    name: session.name
  }, {
    headers: corsHeaders
  });
});
