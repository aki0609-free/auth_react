import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { Forgot } from './components/Forgot';
import { Home } from './components/Home';
import { Login } from './components/login/Login';
import { Nav } from './components/Nav';
import { Register } from './components/Register';
import { Reset } from './components/Reset';

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot' element={<Forgot />} />
        <Route path='/reset/:token' element={<Reset />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
