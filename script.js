document.addEventListener('DOMContentLoaded', () => {
  // Signup form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('newUsername').value.trim();
      const password = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!username || !password || !confirmPassword) {
        alert('All fields are required.');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Signup successful! Please login.');
          window.location.href = 'login.html';
        } else {
          console.error('Signup Error:', data);
          alert(data.error || 'Signup failed.');
        }
      } catch (err) {
        console.error('Network/Fetch error during signup:', err);
        alert('Error during signup. Please try again.');
      }
    });
  }

  // Login form with unsafe XSS test handling
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (!username) {
        alert('Username is required.');
        return;
      }

      // Simulate reflected XSS by inserting username unsafely
      const container = document.querySelector('.container');
      const resultBox = document.createElement('div');
      resultBox.innerHTML = `<p>Welcome, ${username}</p>`; // 🚨 XSS Injection Point
      resultBox.style.color = 'red';
      resultBox.style.fontWeight = 'bold';
      container.appendChild(resultBox);

      // Fake login flow (you can remove this or keep it as simulation)
      // alert('Login simulated.'); // Optional
    });
  }
});
