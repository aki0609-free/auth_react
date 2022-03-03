import React from 'react'

export const Register = () => {
  return (
    <main className="form-signin">
      <form>
        <h1 className="h3 mb-3 fw-normal">Please Register</h1>
        <div className="form-floating">
          <input type="text" className="form-control" id="floatingFirstName" placeholder="your first name" />
          <label htmlFor="floatingFirstName">First Name</label>
        </div>
        <div className="form-floating">
          <input type="text" className="form-control" id="floatingLastName" placeholder="your last name" />
          <label htmlFor="floatingLastName">Last Name</label>
        </div>
        <div className="form-floating">
          <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" />
          <label htmlFor="floatingInput">Email address</label>
        </div>
        <div className="form-floating">
          <input type="password" className="form-control" id="floatingPassword" placeholder="Password" />
          <label htmlFor="floatingPassword">Password</label>
        </div>
        <div className="form-floating">
          <input type="password" className="form-control" id="floatingPasswordConfirm" placeholder="Password Confirm" />
          <label htmlFor="floatingPasswordConfirm">Password Confirm</label>
        </div>
        <button className="w-100 btn btn-lg btn-primary" type="submit">Submit</button>
      </form>
    </main>
  )
}
