import { Request, Response } from "express";
import { getRepository, MoreThanOrEqual } from "typeorm";
import { User } from "../entity/user.entity";
import bcryptjs from 'bcryptjs';
import { sign, verify } from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import { Token } from "../entity/token.entity";
import { idText } from "typescript";
const speakeasy = require('speakeasy');

export const Register = async (req: Request, res: Response) => {
   const body = req.body;

   if (body.password !== body.password_confirm){
     return res.status(400).send({
       message: 'Password do not match'
     });
   }

   const {password, tfa_secret, ...user} = await getRepository(User).save({
     first_name: body.first_name,
     last_name: body.last_name,
     email: body.email,
     password: await bcryptjs.hash(body.password, 12)
   });

   res.send(user);
}

export const Login = async (req: Request, res: Response) => {
  const user = await getRepository(User).findOne({
    email: req.body.email
  });

  if (!user) {
    return res.status(400).send({
      message: 'invalid credentials'
    });
  }

  if (!await bcryptjs.compare(req.body.password, user.password)){
    return res.status(400).send({
      message: 'invalid credentials'
    });
  }

  if (user.tfa_secret) {
    return res.send({
      id: user.id
    })
  }

  const secret = speakeasy.generateSecret({
    name: 'My App'
  });

  res.send({
    id: user.id,
    secret: secret.ascii,
    otpauth_url: secret.otpauth_url
  });
}

const qrcode = require('qrcode');
export const QR = async (req: Request, res: Response) => {
  qrcode.toDataURL("otpauth://totp/My%20App?secret=NFIUOYJ6ERIXIVJFMJNHO23PJJBCMQDJMZQT4UJFFIQXQ63PEU4A", (err: any, data: any) => {
  res.send(`<img src="${data}" />`);
  })
}

export const TwoFactor = async (req:Request, res: Response) => {

  try {
    const id = req.body.id;

    const repoditory = getRepository(User);

    const user = await repoditory.findOne(id);

    if (!user) {
      return res.status(400).send({
        message: 'invalid credentials'
      });
    }

    const secret = user.tfa_secret !== '' ? user.tfa_secret : req.body.secret;

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'ascii',
      token: req.body.code
    });

    if(!verified) {
      return res.status(400).send({
        message: 'invalid credentials'
      });
    }

    if (user.tfa_secret === '') {
      await repoditory.update(id, {tfa_secret: secret});
    }

    const refreshToken = sign({id}, process.env.REFRESH_SECRET || '', {expiresIn: '1w'});

    res.cookie('refresh_token' || '', refreshToken, {
      httpOnly: true,
      maxAge: 7*24*60*60*1000 // 7day
    });

    const expired_at = new Date();
    expired_at.setDate(expired_at.getDate() + 7);

    await getRepository(Token).save({
      user_id: id,
      token: refreshToken,
      expired_at
    });

    const token = sign({id}, process.env.ACCESS_SECRET || '', {expiresIn: '50s'});

    res.send({
      token
    });
  } catch(e) {
    return res.status(401).send({
      messsage: 'unauthenticated'
    });
  }
}

export const AuthenticatedUser = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('Authorization')?.split(' ')[1] || '';

    const payload: any = verify(accessToken, process.env.ACCESS_SECRET || '');

    if (!payload) {
      return res.status(401).send({
        message: 'unauthenticated'
      });
    }

    const user = await getRepository(User).findOne(payload.id);

    if (!user) {
      return res.status(401).send({
        message: 'unauthenticated'
      });
    }

    const {password, tfa_secret, ...data} = user;

    res.send(data);
  } catch(error) {
    return res.status(401).send({
      messsage: 'unauthenticated'
    });
  }
}

export const Refresh = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies['refresh_token'];

    const payload: any = verify(cookie, process.env.REFRESH_SECRET || '');

    if (!payload) {
      return res.status(401).send({
        message: 'unauthenticated'
      });
    }

    const refreshToken = await getRepository(Token).findOne({
      user_id: payload.id,
      expired_at: MoreThanOrEqual(new Date())
    });

    if (!refreshToken) {
      return res.status(401).send({
        message: 'unauthenticated'
      });
    }

    const token = sign({
      id: payload.id
    }, process.env.ACCESS_SECRET || '', {expiresIn: '50s'});

    res.send({
      token
    });

  } catch(error) {
    return res.status(401).send({
      messsage: 'unauthenticated'
    });
  }
}

export const Logout = async (req: Request, res: Response) => {

  await getRepository(Token).delete({
    token: req.cookies['refresh_token']
  });

  res.cookie('refresh_token', '', {maxAge: 0});

  res.send({
    message: 'success'
  });
}

export const GoogleAuth = async (req: Request, res: Response) => {
  const {token} = req.body;

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

  if(!payload) {
    return res.status(401).send({
      message: 'unauthenticated'
    });
  }

  const repository = getRepository(User);

  let user = await repository.findOne({
    email: payload.email
  });

  if (!user) {
    user = await repository.save({
      first_name: payload.given_name,
      last_name: payload.family_name,
      email: payload.email,
      password: await bcryptjs.hash(token, 12)
    });
  }

  const refreshToken = sign({
    id: user.id
  }, process.env.REFRESH_SECRET || '', {expiresIn: '1w'});

  res.cookie('refresh_token' || '', refreshToken, {
    httpOnly: true,
    maxAge: 7*24*60*60*1000 // 7day
  });

  const expired_at = new Date();

  expired_at.setDate(expired_at.getDate() + 7);

  await getRepository(Token).save({
    user_id: user.id,
    token: refreshToken,
    expired_at
  });

  res.send({
    token: sign({
      id: user.id
    }, process.env.ACCESS_SECRET || '', {expiresIn: '50s'})
  });
}
