import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Supabase client ---
const supabase = createClient(
  "https://opcqroiixkbrtjjlrsia.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY3Fyb2lpeGticnRqamxyc2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzQ1MzcsImV4cCI6MjA3Nzc1MDUzN30.Rt4dsFqj3m5YKISofcMGCurAI8ZQnEkFFxfyRK-j6FM"
);

async function loadProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    document.getElementById("project-list").innerHTML =
      `<div class="col-12 text-danger">Error loading projects</div>`;
    return;
  }

  const container = document.getElementById("project-list");
  container.innerHTML = "";

  data.forEach((project) => {
    const links = project.links || {};

    const card = `
      <div class="col-12 col-md-8 col-lg-8">
        <div class="card p-3 project-card h-100">

          <!-- Title + badges -->
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 class="mb-2">${project.title}</h4>
              ${project.discipline ? `<span class="badge badge-area me-2 badge-secondary bg-secondary">${project.discipline}</span>` : ""}
              ${project.status ? `<span class="badge badge-status badge-info bg-info">${project.status}</span>` : ""}
            </div>
          </div>

          <!-- Description -->
          <p class="text-muted mb-3">${project.description || "No description available."}</p>

          <!-- Links -->
          <div class="project-links mb-3">
            ${links.preprint ? `
              <a target="_blank" href="${links.preprint}">
                <i class="bi bi-file-earmark-text"></i> Preprint
              </a>` : ""}
            ${links.data_repo ? `
              <a target="_blank" href="${links.data_repo}">
                <i class="bi bi-database"></i> Dataset
              </a>` : ""}
            ${links.code_repo ? `
              <a target="_blank" href="${links.code_repo}">
                <i class="bi bi-github"></i> Code
              </a>` : ""}
            ${links.protocol ? `
              <a target="_blank" href="${links.protocol}">
                <i class="bi bi-book"></i> Protocol
              </a>` : ""}
            ${links.other ? `
              <a target="_blank" href="${links.other}">
                <i class="bi bi-link"></i> Other
              </a>` : ""}
          </div>

          <!-- Contact -->
          ${project.email ? `
            <a href="mailto:${project.email}" class="btn btn-contact btn-sm">
              <i class="bi bi-envelope"></i> Contact Researcher
            </a>` : ""}
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", card);
  });
}

document.addEventListener("DOMContentLoaded", loadProjects);
