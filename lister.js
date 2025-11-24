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
      const card = `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card p-3 project-card h-100">

            <!-- Title + badges -->
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 class="mb-2">${project.name}</h4>
                
                ${project.area ? `<span class="badge badge-area me-2">${project.area}</span>` : ""}

                ${project.status ? `<span class="badge badge-status">${project.status}</span>` : ""}
              </div>
            </div>

            <!-- Description -->
            <p class="text-muted mb-3">${project.description || "No description available."}</p>

            <!-- Links -->
            <div class="project-links mb-3">
              ${project.preprint_url ? `
                <a target="_blank" href="${project.preprint_url}">
                  <i class="bi bi-file-earmark-text"></i> Preprint
                </a>` : ""}

              ${project.github_url ? `
                <a target="_blank" href="${project.github_url}">
                  <i class="bi bi-github"></i> Repository
                </a>` : ""}

              ${project.dataset_url ? `
                <a target="_blank" href="${project.dataset_url}">
                  <i class="bi bi-database"></i> Dataset
                </a>` : ""}
            </div>

            <!-- Contact -->
            <button class="btn btn-contact btn-sm">
              <i class="bi bi-envelope"></i> Contact Researcher
            </button>
          </div>
        </div>
      `;

      container.insertAdjacentHTML("beforeend", card);
    });
  }

  document.addEventListener("DOMContentLoaded", loadProjects);