import axios from 'axios';
import React, { SyntheticEvent, useState } from 'react'
import { Link } from 'react-router-dom';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';

export const LoginForm = (props: { loginData: Function, success: Function }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const {data} = await axios.post('login', {
      email,
      password
    });

    props.loginData(data);
  }

  const onSuccess = async (gooleUser: any) => {

    const {status, data} = await axios.post('google-auth', {
      token: gooleUser.tokenId
    }, {withCredentials: true});

    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    
    if (status === 200) {
      props.success();
    }
  }

  const onFailure = (e: Error) => {
    alert(e.message);
  }

  return (
    <>
      <form onSubmit={submit}>
        <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
        <div className="form-floating">
          <input onChange={e => setEmail(e.target.value)} type="email" className="form-control" id="floatingInput" placeholder="name@example.com" />
          <label htmlFor="floatingInput">Email address</label>
        </div>
        <div className="form-floating">
          <input onChange={e => setPassword(e.target.value)} type="password" className="form-control" id="floatingPassword" placeholder="Password" />
          <label htmlFor="floatingPassword">Password</label>
        </div>

        <div className="mb-3">
          <Link to='/forgot'>Forgot password ?</Link>
        </div>

        <button className="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
      </form>
      <GoogleLogin 
        clientId="363266987146-lsifr3niv6e4914rbkrvtvoj8vc70mpa.apps.googleusercontent.com"
        buttonText='Login with Google'
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy="single_host_origin"
        className='mt-3 w-100'
      />
    </>
  )
}
