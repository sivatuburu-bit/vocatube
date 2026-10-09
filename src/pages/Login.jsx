import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    setError("");

    // Get all registered users
    const existingUsers =
      JSON.parse(localStorage.getItem("vocatube-users")) || [];

    // Check whether any account exists
    if (existingUsers.length === 0) {
      setError(
        "No account found. Please sign up first."
      );
      return;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // Find matching user
    const matchedUser = existingUsers.find(
      (user) =>
        user.email === normalizedEmail &&
        user.password === password
    );

    // Invalid login
    if (!matchedUser) {
      setError("Invalid email or password.");
      return;
    }

    // Save login status
    localStorage.setItem(
      "vocatube-auth",
      "true"
    );

    // Save currently logged-in user
    localStorage.setItem(
      "vocatube-current-user",
      JSON.stringify({
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
      })
    );

    alert("✅ Login successful!");

    navigate("/");
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🎙️ <span>Voca</span>Tube
        </div>

        <p className="auth-label">
          WELCOME BACK
        </p>

        <h1>
          Login to VocaTube
        </h1>

        <p className="auth-description">
          Continue your smart video learning
          experience.
        </p>

        <form onSubmit={handleLogin}>

          <div className="auth-field">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </div>

          {error && (
            <div className="auth-error">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-button"
          >
            Login →
          </button>

        </form>

        <div className="auth-switch">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={() => navigate("/signup")}
          >
            Create Account
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;