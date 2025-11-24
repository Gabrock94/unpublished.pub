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
  const title = document.getElementById('projTitle').value.trim();
  const description = document.getElementById('projDesc').value.trim();
  const status = document.getElementById('projStatus').value;
  const linksInput = document.getElementById('projLinks').value.trim();

  if (!title || !description || !status) return alert('Please fill all required fields');

  const payload = {
    user_id: LOGGED_IN_USER_ID, // replace with actual logged-in user id
    title,
    description,
    status,
    links: linksInput ? linksInput.split(',').map(l => l.trim()).filter(l => l) : []
  };

  try {
    const res = await fetch('https://opcqroiixkbrtjjlrsia.supabase.co/functions/v1/add-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) return alert('Error: ' + data.error);

    alert('Project added!');
    bootstrap.Modal.getInstance(document.getElementById('newProjectModal')).hide();
    document.getElementById('projectForm').reset();
    console.log(data.project);

  } catch (err) {
    console.error(err);
    alert('Unexpected error');
  }
});