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
          console.error('Signup error:', data);
          alert(data.error || 'Signup failed.');
        }
      } catch (err) {
        console.error('Network/Fetch error during signup:', err);
        alert('Error during signup. Please try again.');
      }
    });
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (!username || !password) {
        alert('Both username and password are required.');
        return;
      }

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Login successful!');
          window.location.href = 'home.html';
        } else {
          console.error('Login error:', data);
          alert(data.error || 'Login failed.');
        }
      } catch (err) {
        console.error('Network/Fetch error during login:', err);
        alert('Error during login. Please try again.');
      }
    });
  }
});
