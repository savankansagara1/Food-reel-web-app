import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PartnerLogin = () => {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/foodpartner/login`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    navigate(`/create-food`); 
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h2>Partner sign in</h2>
        <p className="lead">
          Access your partner dashboard and manage listings.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@business.com" />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" />
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit">
              Sign in
            </button>
          </div>
        </form>

        <div className="alt-row">
          <span className="small">New partner?</span>
          <Link className="link" to="/food-partner/register">
            Create account
          </Link>
        </div>

        <div className="alt-row" style={{ marginTop: 10 }}>
          <span className="small">Need a user account?</span>
          <Link className="link" to="/user/login">
            User sign in
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PartnerLogin;
