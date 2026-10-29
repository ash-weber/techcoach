import React, { useState } from "react";
import "../../assets/styles/pages/Login.css";
import Test from "../../assets/images/testimonial_IBT.png";
import Test1 from "../../assets/images/testimonial_GS.png";
import tech from "../../assets/images/logo.png";
import GoogleLogo from "../../assets/images/google_logo.png";
import MicrosoftLogo from "../../assets/images/microsoft_logo.webp";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginProvider, setLoginProvider] = useState("");

  const loginWithProvider = (provider) => {
    const apiUrl = process.env.REACT_APP_API_URL;

    if (!apiUrl) {
      alert("API URL is not configured.");
      return;
    }

    setIsLoading(true);
    setLoginProvider(provider);
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <main className="home-container">
      <section className="login-page">
        <div className="brand-container">
          <img src={tech} alt="Decision Coach Logo" className="brand-logo" />
          <span className="login-brand">Decision Coach</span>
        </div>

        <div className="login-content">
          <div className="login-heading">
            <span className="login-eyebrow">WELCOME TO DECISION COACH</span>
            <h1>Make decisions with confidence.</h1>
            <p>
              Reflect on your choices, evaluate your options, and make better
              decisions.
            </p>
          </div>

          <div className="login-form">
            <button
              type="button"
              className="social-login-btn"
              onClick={() => loginWithProvider("google")}
              disabled={isLoading}
            >
              <img
  src={GoogleLogo}
  alt="Google"
  className="social-icon provider-logo"
/>
              <span>
                {isLoading && loginProvider === "google"
                  ? "Redirecting..."
                  : "Continue with Google"}
              </span>
              <span className="social-arrow">→</span>
            </button>

            <button
              type="button"
              className="social-login-btn"
              onClick={() => loginWithProvider("microsoft")}
              disabled={isLoading}
            >
             <img
  src={MicrosoftLogo}
  alt="Microsoft"
  className="social-icon provider-logo"
/>
              <span>
                {isLoading && loginProvider === "microsoft"
                  ? "Redirecting..."
                  : "Continue with Microsoft"}
              </span>
              <span className="social-arrow">→</span>
            </button>
          </div>

          <p className="login-sso-note">
            Sign in securely with your preferred account.
          </p>
        </div>

        <footer className="login-footer">
          <span>© {new Date().getFullYear()} Decision Coach</span>
          <span className="footer-status">
            <span className="status-dot" />
            Secure sign-in
          </span>
        </footer>
      </section>

      <aside className="testimonial-panel">
        <div className="testimonial-overlay" />

        <div className="testimonial-content">
          <span className="testimonial-eyebrow">THINK. REFLECT. GROW.</span>

          <h2>
            Every decision
            <br />
            shapes your future.
          </h2>

          <p className="testimonial-description">
            Understand your patterns. Evaluate your choices. Build a better
            decision-making habit.
          </p>

          <div className="testimonial-images">
            <div className="testimonial-image-card">
              <img src={Test} alt="Decision Coach testimonial" />
            </div>

            <div className="testimonial-image-card">
              <img src={Test1} alt="Decision Coach testimonial" />
            </div>
          </div>
        </div>

        <div className="testimonial-bottom">
          <span>Reflect</span>
          <span>Evaluate</span>
          <span>Improve</span>
        </div>
      </aside>
    </main>
  );
};

export default Home;
