// Check auth status and update navigation
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated) {
            // Update navigation for authenticated users
            const loginLink = document.querySelector('.nav-link[href="login.html"]');
            if (loginLink) {
                loginLink.textContent = 'Profile';
                loginLink.href = 'profile.html';
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const errorDiv = document.getElementById('signupError');

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Hide any previous error messages
            errorDiv.classList.add('d-none');
            
            // Show success message and switch to login tab
            alert('Account created successfully! Please log in.');
            
            // Switch to login tab
            const loginTab = document.getElementById('login-tab');
            const tab = new bootstrap.Tab(loginTab);
            tab.show();
            
            // Clear signup form
            document.getElementById('signupForm').reset();
        } else {
            // Show error message
            errorDiv.textContent = data.error || 'Signup failed';
            errorDiv.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.classList.remove('d-none');
    }
}

// Check if user is logged in when page loads
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            // User is logged in
            const data = await response.json();
            // Update UI to show logged-in state
            document.querySelector('.nav-link[href="login.html"]').textContent = 'Profile';
            document.querySelector('.nav-link[href="login.html"]').href = 'profile.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Initialize auth check when document loads
document.addEventListener('DOMContentLoaded', () => {
    // Check auth status and update navigation
    checkAuthStatus();
});
