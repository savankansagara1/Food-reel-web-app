import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PartnerRegister = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullname = e.target.fullname.value;
    const email = e.target.email.value;
    const city = e.target.city.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/foodpartner/register`,
      {
        fullname,
        email,
        city,
        phone,
        password,
      },
      {
        withCredentials: true,
      }
    );
    navigate("/create-food");
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h2>Partner registration</h2>
        <p className="lead">
          Create an account to list and manage your food offerings.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Business name</label>
            <input name="fullname" placeholder="Business or brand name" />
          </div>

          <div className="form-row">
            <label>Contact email</label>
            <input name="email" type="email" placeholder="you@business.com" />
          </div>

          <div className="form-row split">
            <div style={{ flex: 1 }}>
              <label>City</label>
              <input name="city" placeholder="City" />
            </div>
            <div style={{ flex: 1 }}>
              <label>Phone</label>
              <input name="phone" placeholder="Phone number" />
            </div>
          </div>

          <div className="form-row">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" />
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit">
              Create partner account
            </button>
          </div>
        </form>

        <div className="alt-row">
          <span className="small">Already registered?</span>
          <Link className="link" to="/food-partner/login">
            Partner sign in
          </Link>
        </div>

        <div className="alt-row" style={{ marginTop: 10 }}>
          <span className="small">Looking for user account?</span>
          <Link className="link" to="/user/register">
            User sign up
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PartnerRegister;
