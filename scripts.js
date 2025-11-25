const ORCID_AUTH = "https://orcid.org/oauth/authorize";
    const CLIENT_ID = "APP-HIW7OM4YIXTBWLOB";
    const REDIRECT = "https://opcqroiixkbrtjjlrsia.supabase.co/functions/v1/orcid-callback";

    document.getElementById("orcid").onclick = () => {
      const url = new URL(ORCID_AUTH);
      url.searchParams.set("client_id", CLIENT_ID);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "/authenticate");
      url.searchParams.set("redirect_uri", REDIRECT);
      window.location.href = url.toString();
    };

    // Logout function
    document.getElementById("logoutBtn").onclick = () => {
      sessionStorage.removeItem('orcid_session');
      document.getElementById('loginBtn').style.display = 'block';
      document.getElementById('userInfo').style.display = 'none';
      document.getElementById('loginBtnBtm').style.display = 'block';
      document.getElementById('userInfoBtm').style.display = 'none';
      location.reload();
    };

    // Check for session ID in URL
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session') || sessionStorage.getItem('orcid_session');

    if (sessionId) {
      // Store in sessionStorage for future page loads
      sessionStorage.setItem('orcid_session', sessionId);

      
      // Remove from URL
      if (params.get('session')) {
        window.history.replaceState({}, '', location.pathname);
      }
      
      // Verify session
      fetch(`https://opcqroiixkbrtjjlrsia.supabase.co/functions/v1/get-session?session=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.authenticated) {
            // Show user info in navbar
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('userInfo').style.display = 'flex';
            document.getElementById('loginBtnBtm').style.display = 'none';
            document.getElementById('userInfoBtm').style.display = 'flex';
            document.getElementById('userName').textContent = data.name || 'User';
            document.getElementById('userOrcid').textContent = data.orcid;
            // After session check
            const user_id = data.orcid; // or however you map ORCID -> user
            window.LOGGED_IN_USER_ID = user_id;

          } else {
            sessionStorage.removeItem('orcid_session');
            document.getElementById('loginBtn').style.display = 'block';
            document.getElementById('userInfo').style.display = 'none';
          }
        })
        .catch(err => {
          console.error('Error checking session:', err);
          document.getElementById('loginBtn').style.display = 'block';
          document.getElementById('userInfo').style.display = 'none';
        });
    } else {
      document.getElementById('loginBtn').style.display = 'block';
      document.getElementById('userInfo').style.display = 'none';
    }

document.getElementById('saveProjectBtn').addEventListener('click', async () => {
  const form = document.getElementById('projectForm');

  // Trigger browser validation UI
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  // Collect fields
  const title = document.getElementById('projTitle').value.trim();
  const description = document.getElementById('projDesc').value.trim();
  const status = document.getElementById('projStatus').value;
  const discipline = document.getElementById('projDiscipline').value;
  const email = document.getElementById('projEmail').value.trim();

  // Optional URLs
  const preprint = document.getElementById('projPreprint').value.trim();
  const dataRepo = document.getElementById('projDataRepo').value.trim();
  const codeRepo = document.getElementById('projCodeRepo').value.trim();
  const protocol = document.getElementById('projProtocol').value.trim();
  const otherUrl = document.getElementById('projOtherUrl').value.trim();

  // Additional validation
  if (!validateEmail(email)) {
    return alert("Please enter a valid email address.");
  }

  const urls = { preprint, dataRepo, codeRepo, protocol, otherUrl };
  for (const [key, url] of Object.entries(urls)) {
    if (url && !isValidUrl(url)) {
      return alert(`Invalid URL in field: ${key.replace(/([A-Z])/g, ' $1')}`);
    }
  }

  const payload = {
    user_id: LOGGED_IN_USER_ID,  // Replace with real logged-in user ID
    title,
    description,
    status,
    discipline,
    email,
    links: {
      preprint: preprint || null,
      data_repo: dataRepo || null,
      code_repo: codeRepo || null,
      protocol: protocol || null,
      other: otherUrl || null
    }
  };

  try {
    const res = await fetch(
      'https://opcqroiixkbrtjjlrsia.supabase.co/functions/v1/add-project',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();
    if (!res.ok) return alert('Error: ' + data.error);

    alert('Project added!');
    bootstrap.Modal.getInstance(document.getElementById('newProjectModal')).hide();
    form.reset();
    form.classList.remove('was-validated');

    console.log("Inserted project:", data.project);

  } catch (err) {
    console.error(err);
    alert('Unexpected error.');
  }
});


// --- Validation Helpers ---
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
