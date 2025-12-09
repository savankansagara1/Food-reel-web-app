# 🍔 Food Reel Web App  
A modern video-reel style food discovery platform built using the MERN stack.  
Users can explore food reels, like/save videos, and visit food partner stores.  
Food Partners can upload reels and manage their items.  

---

## 🚀 Live Demo

### 🔵 Frontend (Vercel)
https://food-reel-web-app.vercel.app/

### 🟣 Backend (Render)
https://food-reel-web-app.onrender.com/

---

## 📸 Screenshots

### 🔐 User Login
<p align="center">
  <img src="https://raw.githubusercontent.com/savankansagara1/Food-reel-web-app/main/frontend/src/assets/login.jpg" width="280" style="border-radius: 10px;" />
</p>

---

### 📝 Register Page
<p align="center">
  <img src="https://raw.githubusercontent.com/savankansagara1/Food-reel-web-app/main/frontend/src/assets/register.jpg" width="280" style="border-radius: 10px;" />
</p>

---

### 🎥 Food Reel Page
<p align="center">
  <img src="https://raw.githubusercontent.com/savankansagara1/Food-reel-web-app/main/frontend/src/assets/reel.jpg" width="260" style="border-radius: 10px;" />
</p>

---

### 👤 Profile Page
<p align="center">
  <img src="https://raw.githubusercontent.com/savankansagara1/Food-reel-web-app/main/frontend/src/assets/profile.jpg" width="260" style="border-radius: 10px;" />
</p>

---

### 🍽️ Food Partner Dashboard
<p align="center">
  <img src="https://raw.githubusercontent.com/savankansagara1/Food-reel-web-app/main/frontend/src/assets/partner_dashboard.jpg" width="280" style="border-radius: 10px;" />
</p>


## 🎥 Features

- Scrollable vertical **reels like Instagram**
- ❤️ Like reels
- 📌 Save reels
- 🔐 JWT Authentication with HttpOnly cookies
- 👤 User Login / Register
- 🍽️ Food Partner Login / Dashboard
- 📱 Fully responsive UI
- ☁️ Hosted on Vercel + Render + MongoDB Atlas
- 🔄 Auto redirect to login if token expired

## 🏗️ Tech Stack

### Frontend
- React.js  
- Vite  
- Axios  
- React Router  
- CSS  

### Backend
- Node.js  
- Express.js  
- MongoDB Atlas  
- Mongoose  
- JWT  
- Cookie-parser  
- CORS with credentials

  ---

## 🧪 API Endpoints

### 🔐 Auth (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User Register |
| POST | `/api/auth/login` | User Login |
| POST | `/api/auth/logout` | Logout |

---

### 🍔 Food

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food` | Get all reels |
| GET | `/api/food/saved` | Get saved reels |
| POST | `/api/food/like` | Like a reel |
| POST | `/api/food/save` | Save a reel |

---

### 👨‍🍳 Food Partner

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/foodpartner/register` | Register food partner |
| POST | `/api/foodpartner/login` | Login food partner |

---

---

## 🔧 Setup Instructions

##Project setup
```bash
git clone https://github.com/savankansagara1/Food-reel-web-app.git
cd Food-reel-web-app


cd backend
npm install

#Run backend
npm start

#frontend setup
cd frontend
npm install
```
##🙌 Author

Savan Kansagara
Aspiring Full Stack Developer

🔗 GitHub: https://github.com/savankansagara1

📧 Email: important.savan@gmail.com

  
