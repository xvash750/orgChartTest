// script.js

// Get the checkbox and the password field
const togglePassword = document.getElementById('togglePassword');
const passwordField = document.getElementById('password');

// Add an event listener to toggle password visibility
togglePassword.addEventListener('change', function () {
    // Check the state of the checkbox
    if (togglePassword.checked) {
        passwordField.type = 'text'; // Show the password
    } else {
        passwordField.type = 'password'; // Hide the password
    }
});
