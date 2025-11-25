import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Supabase client --- 
const supabase = createClient( "https://opcqroiixkbrtjjlrsia.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY3Fyb2lpeGticnRqamxyc2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzQ1MzcsImV4cCI6MjA3Nzc1MDUzN30.Rt4dsFqj3m5YKISofcMGCurAI8ZQnEkFFxfyRK-j6FM" );

let lastLoaded = 0;
const pageSize = 10;

async function loadProjects(loadMore = false) {
  const start = loadMore ? lastLoaded : 0;
  const end = start + pageSize - 1;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error(error);
    if (!loadMore) {
      document.getElementById("project-list").innerHTML =
        `<div class="col-12 text-danger">Error loading projects</div>`;
    }
    return;
  }

  const container = document.getElementById("project-list");
  if (!loadMore) container.innerHTML = "";

  data.forEach((project) => {
    const links = project.links || {};

    const card = `
      <div class="col-12 col-md-12 col-lg-12">
        <div class="project-card">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 class="mb-2">${project.title}</h4>
              ${project.discipline ? `<span class="badge badge-area me-2">${project.discipline}</span>` : ""}
              ${project.status ? `<span class="badge badge-status">${project.status}</span>` : ""}
            </div>
          </div>
          <p class="text-muted mb-3">${project.description || "No description available."}</p>
          <div class="project-links mb-3">
            ${links.preprint ? `<a target="_blank" href="${links.preprint}"><i class="bi bi-file-earmark-text"></i> Preprint</a>` : ""}
            ${links.data_repo ? `<a target="_blank" href="${links.data_repo}"><i class="bi bi-database"></i> Dataset</a>` : ""}
            ${links.code_repo ? `<a target="_blank" href="${links.code_repo}"><i class="bi bi-github"></i> Code</a>` : ""}
            ${links.protocol ? `<a target="_blank" href="${links.protocol}"><i class="bi bi-book"></i> Protocol</a>` : ""}
            ${links.other ? `<a target="_blank" href="${links.other}"><i class="bi bi-link-45deg"></i> Other</a>` : ""}
          </div>
          <div class="d-flex gap-2 flex-wrap">
            ${project.email ? `<a class="btn btn-contact btn-sm" href="mailto:${project.email}"><i class="bi bi-envelope"></i> Contact Researcher</a>` : ""}
            ${project.user_id ? `<a href="https://orcid.org/${project.user_id}" target="_blank" class="btn btn-sm btn-outline-secondary"><i class="bi bi-person-badge"></i> View ORCID</a>` : ""}
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", card);
  });

  lastLoaded += data.length;

  // Hide Load More button if less than pageSize items returned
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (data.length < pageSize) {
    loadMoreBtn.style.display = "none";
  } else {
    loadMoreBtn.style.display = "inline-block";
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", () => loadProjects());

// Load more button
document.getElementById("loadMoreBtn").addEventListener("click", () => loadProjects(true));
