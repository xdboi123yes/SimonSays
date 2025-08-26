import { useState } from "react";
import {
  LogIn,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Password validation rules as array of test functions and messages
const passwordRules = [
  {
    test: (pw: string) => pw.length >= 8,
    message: "At least 8 characters",
  },
  {
    test: (pw: string) => /[A-Z]/.test(pw),
    message: "Contains uppercase letter",
  },
  {
    test: (pw: string) => /[a-z]/.test(pw),
    message: "Contains lowercase letter",
  },
  {
    test: (pw: string) => /[0-9]/.test(pw),
    message: "Contains number",
  },
];

// Returns the first failed password rule error message
const getPasswordError = (password: string): string | null => {
  if (!password) return "Password is required";
  const failedRule = passwordRules.find((rule) => !rule.test(password));
  return failedRule ? failedRule.message : null;
};

// Simple email validation with regex
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Enter a valid email address";
  return null;
};

// Username validation: 3+ characters, alphanumerics and underscores
const validateUsername = (username: string): string | null => {
  if (!username) return "Username is required";
  if (username.length < 3) return "At least 3 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return "Only letters, numbers, underscores";
  return null;
};

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // State variables for UI control and form values
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // Validation error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Resets all form-related error messages
  const resetFormErrors = () => {
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setUsernameError(null);
  };

  // Handles login/register form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormErrors();

    const emailErr = validateEmail(email);
    const passwordErr = getPasswordError(password);
    const usernameErr = isLogin ? null : validateUsername(username);

    setEmailError(emailErr);
    setPasswordError(isLogin ? null : passwordErr);
    setUsernameError(usernameErr);

    // Abort if any errors exist
    if (emailErr || (!isLogin && (passwordErr || usernameErr))) return;

    setLoading(true);

    try {
      // Attempt login or registration
      const result = isLogin
        ? await login(email, password)
        : await register(email, password, username);

      if (result?.error) throw result.error;

      // Redirect on success
      navigate("/play");
    } catch (err: any) {
      // Handle known Supabase/Auth errors
      const message = err.message?.toLowerCase() || "";
      const code = err.code?.toLowerCase() || "";

      if (code === "invalid_credentials" || message.includes("invalid login")) {
        setError("Invalid credentials. Try again.");
      } else if (message.includes("email") && message.includes("registered")) {
        setError("Email already registered.");
      } else if (message.includes("username") && message.includes("taken")) {
        setError("Username taken.");
      } else if (message.includes("network") || message.includes("fetch")) {
        setError("Network error. Try again.");
      } else {
        setError(isLogin ? "Sign in failed." : "Registration failed.");
      }

      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isLogin
              ? "Play Simon Says and track your progress"
              : "Join and challenge other players"}
          </p>
        </div>

        {/* General error message */}
        {error && (
          <div className="p-3 bg-error-50 text-error-700 dark:bg-error-900/30 dark:text-error-400 rounded-md text-sm flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form start */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUsername(value);
                    setUsernameError(validateUsername(value));
                  }}
                  className={`input ${usernameError ? "border-error-300 dark:border-error-700" : ""}`}
                  placeholder="YourUsername"
                />
                {usernameError && (
                  <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                    {usernameError}
                  </p>
                )}
              </div>
            )}

            {/* Email input field */}
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  setEmailError(validateEmail(value));
                }}
                className={`input ${emailError ? "border-error-300 dark:border-error-700" : ""}`}
                placeholder="you@example.com"
              />
              {emailError && (
                <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password input + rules */}
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  if (!isLogin) {
                    setPasswordError(getPasswordError(value));
                  }
                }}
                className={`input ${passwordError ? "border-error-300 dark:border-error-700" : ""}`}
                placeholder="••••••••"
              />

              {/* Password rules / strength feedback */}
              {!isLogin &&
                password.length > 0 &&
                (passwordRules.every((r) => r.test(password)) ? (
                  <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
                    <ShieldCheck className="h-4 w-4" />
                    Strong password
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm">
                    {passwordRules.map((rule, index) => {
                      const passed = rule.test(password);
                      const Icon = passed ? CheckCircle : XCircle;
                      return (
                        <li
                          key={index}
                          className={`flex items-center gap-2 ${
                            passed
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {rule.message}
                        </li>
                      );
                    })}
                  </ul>
                ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : isLogin ? (
              <LogIn className="h-5 w-5 mr-2" />
            ) : (
              <User className="h-5 w-5 mr-2" />
            )}
            {loading ? "Loading..." : isLogin ? "Sign in" : "Register"}
          </button>

          {/* Toggle login/register mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetFormErrors();
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {isLogin
                ? "Need an account? Register"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
