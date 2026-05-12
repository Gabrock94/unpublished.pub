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
  if (req.method !== "POST") {
    return Response.json({
      error: "Method not allowed"
    }, {
      status: 405,
      headers: corsHeaders
    });
  }
  let body;
  try {
    body = await req.json();
  } catch  {
    return Response.json({
      error: "Invalid JSON"
    }, {
      status: 400,
      headers: corsHeaders
    });
  }
  const { user_id, title, description, status, discipline, email, preprint, data_repo, code_repo, protocol, other } = body;
  // Basic validation
  if (!user_id || !title || !description || !status || !discipline || !email) {
    return Response.json({
      error: "Missing required fields"
    }, {
      status: 400,
      headers: corsHeaders
    });
  }
  // Verify that user_id corresponds to a real, active session (optional but recommended)
  const { data: session } = await supabase.from("sessions").select("orcid, name, expires_at").eq("orcid", user_id).order("created_at", {
    ascending: false
  }).limit(1).single();
  if (!session || new Date(session.expires_at) < new Date()) {
    return Response.json({
      error: "Unauthorized"
    }, {
      status: 401,
      headers: corsHeaders
    });
  }
  const { data: project, error } = await supabase.from("projects").insert({
    user_id,
    title,
    description,
    status,
    discipline,
    email,
    researcher: session.name,
    preprint: preprint || null,
    data_repo: data_repo || null,
    code_repo: code_repo || null,
    protocol: protocol || null,
    other: other || null,
    published: true
  }).select().single();
  if (error) {
    console.error("Insert error:", error);
    return Response.json({
      error: error.message
    }, {
      status: 500,
      headers: corsHeaders
    });
  }
  return Response.json({
    project
  }, {
    status: 201,
    headers: corsHeaders
  });
});
