import { Request, Response } from "express";
import { createTransport } from "nodemailer";
import { getRepository } from "typeorm";
import { Reset } from "../entity/reset.entity";
import { User } from "../entity/user.entity";
import bcryptjs from 'bcryptjs';

export const ForgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const token = Math.random().toString(20).substring(2, 12);

  await getRepository(Reset).save({
    email,
    token
  });

  const transporter = createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "6850b9d8d0c0d5",
      pass: "83533655a6304f"
    }
  });

  const url = `http://localhost:3000/reset/${token}`;

  await transporter.sendMail({
    from: 'from@example.com',
    to: '336960b5e7-dd645c@inbox.mailtrap.io', //your email
    subject: 'Reset your password',
    html: `Click <a href="${url}">here</a> to reset your password`,
  });

  res.send({
    message: 'Please check your email'
  });
}

export const ResetPassword = async (req: Request, res: Response) => {
  const {token, password, password_confirm} = req.body;

  if (password !== password_confirm) {
    return res.status(400).send({
      message: 'password do not match'
    });
  }

  const resetPassword = await getRepository(Reset).findOne({token});

  if(!resetPassword) {
    return res.status(400).send({
      message: 'invalid link'
    });
  }

  const user = await getRepository(User).findOne({email: resetPassword.email});

  if (!user) {
    return res.status(404).send({
      message: 'User not found'
    });
  }

  await getRepository(User).update(user.id, {
    password: await bcryptjs.hash(password, 12)
  });

  res.send({
    message: 'success'
  });
}