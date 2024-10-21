// script.js

// Function to clear input fields
function clearForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Clear the form every time the page is shown (including back button navigation)
window.addEventListener('pageshow', function() {
    clearForm();
});

// Example login function
function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Simulate checking credentials (in a real-world scenario, you'd send these to the server)
    const correctUsername = "admin";
    const correctPassword = "password123";

    if (username === correctUsername && password === correctPassword) {
        sessionStorage.setItem("isLoggedIn", "true"); // Set flag in local storage
        window.location.href = "homepage.html"; // Redirect to homepage
    } else {
        document.getElementById("error-message").innerText = "Invalid credentials!";
    }
}
