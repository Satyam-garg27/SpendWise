
import { useState } from "react";
import { Wallet, Mail, Lock, User, ArrowRight } from "lucide-react";
import "./Auth.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Auth({ onLogin }) {
    const [mode, setMode] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint = mode === "login" ? "login" : "register";

            const response = await fetch(
                `${API_URL}/auth/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        mode === "login"
                            ? { email, password }
                            : { name, email, password }
                    )
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Authentication failed");
            }

            onLogin(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-brand">
                    <div className="auth-logo">
                        <Wallet size={25}/>
                    </div>
                    <h1>SpendWise</h1>
                    <p>Take control of your finances.</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={mode === "login" ? "selected" : ""}
                        onClick={() => {
                            setMode("login");
                            setError("");
                        }}
                        type="button"
                    >
                        Login
                    </button>

                    <button
                        className={mode === "register" ? "selected" : ""}
                        onClick={() => {
                            setMode("register");
                            setError("");
                        }}
                        type="button"
                    >
                        Register
                    </button>
                </div>

                <div className="auth-heading">
                    <h2>
                        {mode === "login" ? "Welcome back" : "Create your account"}
                    </h2>
                    <p>
                        {mode === "login"
                            ? "Sign in to access your financial dashboard."
                            : "Get started with your personal finance tracker."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">

                    {mode === "register" && (
                        <>
                            <label>Full Name</label>
                            <div className="auth-input">
                                <User size={18}/>
                                <input
                                    required
                                    minLength={2}
                                    maxLength={50}
                                    placeholder="Your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <label>Email Address</label>
                    <div className="auth-input">
                        <Mail size={18}/>
                        <input
                            required
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <label>Password</label>
                    <div className="auth-input">
                        <Lock size={18}/>
                        <input
                            required
                            type="password"
                            minLength={mode === "register" ? 8 : undefined}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button className="auth-submit" disabled={loading}>
                        {loading
                            ? "Please wait..."
                            : mode === "login" ? "Sign In" : "Create Account"}
                        {!loading && <ArrowRight size={17}/>}
                    </button>
                </form>

                <p className="auth-switch">
                    {mode === "login"
                        ? "Don't have an account?"
                        : "Already have an account?"}

                    <button
                        onClick={() => {
                            setMode(mode === "login" ? "register" : "login");
                            setError("");
                        }}
                    >
                        {mode === "login" ? "Register" : "Login"}
                    </button>
                </p>

                <div className="auth-footer">
                    SpendWise © 2026 · Personal Finance Management
                </div>
            </div>
        </div>
    );
}

export default Auth;
