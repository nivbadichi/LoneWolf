import { register, login } from "../api/authApi.js";
import { setSession, isLoggedIn } from "../utils/auth.js";
import { showToast } from "../components/toast.js";
import { qs } from "../utils/dom.js";

if (isLoggedIn()) {
  window.location.href = "events.html";
}

const form = qs("#register-form");
const submitButton = qs("#register-submit");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = qs("#name").value.trim();
  const email = qs("#email").value.trim();
  const password = qs("#password").value;

  submitButton.disabled = true;
  submitButton.textContent = "Creating account...";

  try {
    await register({ name, email, password });
    const data = await login({ email, password });

    setSession(data.token, data.user);
    showToast("Account created! Welcome.", "success");

    setTimeout(() => {
      window.location.href = "events.html";
    }, 600);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Register";
  }
});
