import axios from 'axios';
import React, { SyntheticEvent, useState } from 'react'

export const Forgot = () => {

  const [email, setEmail] = useState('');
  const [notify, setNotify] = useState({
    show: false,
    error: false,
    message: ''
  });

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      await axios.post('forgot', {email});
      setNotify({
        show: true,
        error: false,
        message: 'Please check your email'
      });
    } catch(e) {
      setNotify({
        show: true,
        error: true,
        message: 'An Error occurred'
      });
    }
  }

  const info = notify.show 
  ? <div className={notify.error ? 'alert alert-danger' : 'alert alert-success'} role='alert'>{notify.message}</div>
  : null;

  return (
    <main className="form-signin">
      {info}
      <form onSubmit={submit}>
        <h1 className="h3 mb-3 fw-normal">Please put your email</h1>
        <div className="form-floating">
          <input onChange={e => setEmail(e.target.value)} type="email" className="form-control" id="floatingInput" placeholder="name@example.com" />
          <label htmlFor="floatingInput">Email address</label>
        </div>
        <button className="w-100 btn btn-lg btn-primary mt-3" type="submit">Submit</button>
      </form>
    </main>
  )
}
