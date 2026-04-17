import { SessionOptions } from 'iron-session'

export interface SessionData {
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'frankgaard-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}
