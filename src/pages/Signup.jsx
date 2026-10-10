import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSignup(event) {
    event.preventDefault();

    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Get all existing users
    const existingUsers =
      JSON.parse(localStorage.getItem("vocatube-users")) || [];

    const normalizedEmail =
      email.trim().toLowerCase();

    // Check whether this email already exists
    const emailAlreadyExists = existingUsers.some(
      (user) => user.email === normalizedEmail
    );

    if (emailAlreadyExists) {
      setError(
        "An account with this email already exists. Please login."
      );
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password: password,
    };

    // Add new user without deleting existing users
    const updatedUsers = [
      ...existingUsers,
      newUser,
    ];

    // Save all users
    localStorage.setItem(
      "vocatube-users",
      JSON.stringify(updatedUsers)
    );

    // alert("✅ Account created successfully!");

    navigate("/login");
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🎙️ <span>Voca</span>Tube
        </div>

        <p className="auth-label">
          CREATE YOUR ACCOUNT
        </p>

        <h1>
          Join VocaTube
        </h1>

        <p className="auth-description">
          Create your account and start your smart
          video learning experience.
        </p>

        <form onSubmit={handleSignup}>

          <div className="auth-field">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </div>

          <div className="auth-field">
            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
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
            Create Account →
          </button>

        </form>

        <div className="auth-switch">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default Signup;
