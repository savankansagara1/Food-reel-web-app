import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserRegister = () => {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullname = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post("http://localhost:3000/api/auth/user/register", {
      fullname,
      email,
      password,
    },{
      withCredentials: true,
    });
    console.log(response.data);
    navigate("/")
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h2>Create your account</h2>
        <p className="lead">
          Register as a user to discover nearby food partners.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name</label>
            <input name="name" placeholder="Full name" />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@domain.com" />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" />
          </div>

          <div className="form-row">
            <label>Confirm password</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit">
              Create account
            </button>
          </div>
        </form>

        <div className="alt-row">
          <span className="small">Already have an account?</span>
          <Link className="link" to="/user/login">
            Sign in
          </Link>
        </div>

        <div className="alt-row" style={{ marginTop: 10 }}>
          <span className="small">Are you a food partner?</span>
          <Link className="link" to="/food-partner/register">
            Partner sign up
          </Link>
        </div>
      </section>
    </main>
  );
};

export default UserRegister;
