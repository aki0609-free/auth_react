import axios from 'axios';
import React, { SyntheticEvent, useState } from 'react'
import { Navigate } from 'react-router-dom';

export const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [redirect, setRedirect] = useState(false);

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();

    await axios.post('register', {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password_confirm: passwordConfirm
    });

    setRedirect(true);
  }

  if (redirect) {
    return <Navigate  to='/login' />
  }


  return (
    <main className="form-signin">
      <form onSubmit={submit}>
        <h1 className="h3 mb-3 fw-normal">Please Register</h1>
        <div className="form-floating">
          <input onChange={e => setFirstName(e.target.value)} type="text" className="form-control" id="floatingFirstName" placeholder="your first name" />
          <label htmlFor="floatingFirstName">First Name</label>
        </div>
        <div className="form-floating">
          <input onChange={e => setLastName(e.target.value)} type="text" className="form-control" id="floatingLastName" placeholder="your last name" />
          <label htmlFor="floatingLastName">Last Name</label>
        </div>
        <div className="form-floating">
          <input onChange={e => setEmail(e.target.value)} type="email" className="form-control" id="floatingInput" placeholder="name@example.com" />
          <label htmlFor="floatingInput">Email address</label>
        </div>
        <div className="form-floating">
          <input onChange={e => setPassword(e.target.value)} type="password" className="form-control" id="floatingPassword" placeholder="Password" />
          <label htmlFor="floatingPassword">Password</label>
        </div>
        <div className="form-floating">
          <input onChange={e => setPasswordConfirm(e.target.value)} type="password" className="form-control" id="floatingPasswordConfirm" placeholder="Password Confirm" />
          <label htmlFor="floatingPasswordConfirm">Password Confirm</label>
        </div>
        <button className="w-100 btn btn-lg btn-primary" type="submit">Submit</button>
      </form>
    </main>
  )
}
