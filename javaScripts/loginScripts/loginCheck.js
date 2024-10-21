window.onload = function() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
        window.location.href = "login.html"; // Redirect to login if not logged in
    }
};
