import React, { useState } from "react";
import {
  SignIn,
  SignUp,
  useUser,
  SignedOut,
  SignedIn,
} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

const AuthPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <SignedIn>
        <div className="welcome-box">
          <h2 className="gradient-text">Welcome back!</h2>
          <button className="cta-btn" onClick={() => navigate("/")}>
            Go to Dashboard
          </button>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="auth-panels single">
          <div className="auth-card">
            <h2 className="gradient-text">
              {isLogin ? "Login" : "Register"}
            </h2>

            {isLogin ? (
              <>
                <SignIn routing="virtual" />
                <p className="toggle-text">
                  New user?{" "}
                  <span onClick={() => setIsLogin(false)}>
                    Register now
                  </span>
                </p>
              </>
            ) : (
              <>
                <SignUp routing="virtual" />
                <p className="toggle-text">
                  Already have an account?{" "}
                  <span onClick={() => setIsLogin(true)}>
                    Login here
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </SignedOut>
    </div>
  );
};

export default AuthPage;
