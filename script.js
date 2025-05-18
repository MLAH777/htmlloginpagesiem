document.addEventListener('DOMContentLoaded', () => {
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('newUsername').value; // FIXED HERE
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
  
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
            alert(data.error);
          }
        } catch (err) {
          alert('Error during signup. Please try again.');
        }
      });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
  
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
            alert(data.error);
          }
        } catch (err) {
          alert('Error during login. Please try again.');
        }
      });
    }
});
