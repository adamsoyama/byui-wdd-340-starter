document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".toggle-password");
  const passwordInput = document.getElementById("account_password");

  if (toggle && passwordInput) {
    toggle.addEventListener("click", function () {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      toggle.textContent = isHidden ? "🙈" : "👁️";
    });
  }
});
