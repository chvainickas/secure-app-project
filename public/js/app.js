// VULNERABILITY: DOM-based XSS
// This script reads URL parameters and directly injects them into the DOM

document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const welcome = urlParams.get('welcome');

    // VULNERABILITY: Using innerHTML with unsanitized user input from URL
    if (message) {
        const messageDiv = document.getElementById('notification-message');
        if (messageDiv) {
            messageDiv.innerHTML = message;
            messageDiv.style.display = 'block';
        }
    }

    // VULNERABILITY: Another DOM-based XSS vector
    if (welcome) {
        const welcomeDiv = document.getElementById('welcome-message');
        if (welcomeDiv) {
            welcomeDiv.innerHTML = 'Welcome, ' + welcome + '!';
        }
    }

    // VULNERABILITY: eval() with user-controlled data
    const action = urlParams.get('action');
    if (action) {
        try {
            eval(action);
        } catch (e) {
            console.error('Action error:', e);
        }
    }
});
