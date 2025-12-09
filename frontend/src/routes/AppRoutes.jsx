import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import UserRegister from '../pages/UserRegister'
import UserLogin from '../pages/UserLogin'
import PartnerRegister from '../pages/PartnerRegister'
import PartnerLogin from '../pages/PartnerLogin'
import Home from '../pages/general/Home'
import CreateFood from '../pages/food-partner/CreateFood'
import Profile from '../pages/food-partner/Profile'
import Saved from '../pages/general/Saved'

const AppRoutes = () => {
  return (
    <div>
      <Router>
        <Routes>
            <Route path='/user/register' element={<UserRegister/>} />
            <Route path='/user/login' element={<UserLogin/>} />
            <Route path='/food-partner/register' element={<PartnerRegister/>} />
            <Route path='/food-partner/login' element={<PartnerLogin/>} />
            <Route path='/' element={<Home/>} />
            <Route path='/create-food' element={<CreateFood />} />
            <Route path="/food-partner/:id" element={<Profile />} />
            <Route path="/saved" element={<Saved />} />
       </Routes>
      </Router>
    </div>
  )
}

export default AppRoutes
