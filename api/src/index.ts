import { Hono, Context } from 'hono'
import crypto from 'node:crypto'
import { Env_Vars} from '../env'
import fetchEmails  from './emails' // Ensure the fetchEmails function is properly exported from its module
import classifyEmailsWithGemini from  './gem-ai'
import { cors } from 'hono/cors'
 
export type Variables ={
  ACCESS_TOKEN:string
} 

export type Env={
  accessstoken:KVNamespace
} 
 
const app = new Hono<{Bindings:Env}>()
app.use(cors())
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.use('*', cors({
  origin: ['http://localhost:8080', 'https://api.hanmadishit74.workers.dev'], // Allow requests from both http://localhost:8080 and the origin itself
  allowHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  allowMethods: ['GET', 'POST', 'OPTIONS'], // Specify allowed HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));


interface TokenData {
  access_token: string
  error?: string
  error_description?: string
}

interface UserInfo {
  email: string
  name: string
  picture: string
}

let accessToken_var ;
function generateJWT(payload: string, secret: string, expiresIn: string): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(payload)
  const signature = sign(`${encodedHeader}.${encodedPayload}`, secret)
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str)  // Use btoa instead of Buffer
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await parseKey(secret)
  const enc = new TextEncoder().encode(data)
  const hmac = await crypto.subtle.sign('HMAC', key, enc)
  const signature = btoa(String.fromCharCode(...new Uint8Array(hmac)))
  return base64UrlEncode(signature)
}

async function parseKey(key: string): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(key)
  return crypto.subtle.importKey(
    'raw',
    enc,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
}

function parseCookie(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) return null
  const cookies = cookieHeader.split(';')

  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name.trim() === cookieName) {
      return value.trim()
    }
  }
  return null
}

function decodeJWT(token: string): { header: any; payload: any } {
  const [encodedHeader, encodedPayload] = token.split('.')
  const header = JSON.parse(base64UrlDecode(encodedHeader))
  const payload = JSON.parse(base64UrlDecode(encodedPayload))
  return { header, payload }
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padding = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4)
  const paddedBase64 = base64 + '==='.slice(0, padding)
  return atob(paddedBase64)  // Use atob instead of Buffer
}



function extractAccessTokenFromCookie(cookieHeader) {
  const cookies = cookieHeader ? cookieHeader.split('; ') : [];
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === 'custom_auth') {
      return value;
    }
  }
  return null;
}

app.get('/auth/google', (c) => {
  const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authorizationUrl.searchParams.set('client_id', Env_Vars.GOOGLE_CLIENT_ID)
  authorizationUrl.searchParams.set('redirect_uri', Env_Vars.GOOGLE_REDIRECT_URI)
  authorizationUrl.searchParams.set('prompt', 'consent')
  authorizationUrl.searchParams.set('response_type', 'code')
  authorizationUrl.searchParams.set('scope', 'openid email profile https://mail.google.com/') // Add the Gmail scope
  authorizationUrl.searchParams.set('access_type', 'offline')
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizationUrl.toString(),
    },
   })
})

app.get('/oauth2callback', async (c ) => {
  console.log('Received /oauth2callback request')
  const code = new URL(c.req.raw.url).searchParams.get('code')
 
  console.log('Authorization code:', code)
  if (!code) return new Response('No code provided', { status: 400 })
  try {
    const tokenEndpoint = new URL('https://accounts.google.com/o/oauth2/token')
    tokenEndpoint.searchParams.set('code', code)
    tokenEndpoint.searchParams.set('grant_type', 'authorization_code')
    tokenEndpoint.searchParams.set('client_id', Env_Vars.GOOGLE_CLIENT_ID)
    tokenEndpoint.searchParams.set('client_secret',Env_Vars.GOOGLE_CLIENT_SECRET)
    tokenEndpoint.searchParams.set('redirect_uri', Env_Vars.GOOGLE_REDIRECT_URI)
    console.log('Requesting token with endpoint: ', tokenEndpoint.toString())
    const tokenResponse = await fetch(tokenEndpoint.origin + tokenEndpoint.pathname, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenEndpoint.searchParams.toString(),
    })
    const tokenData = await tokenResponse.json() as TokenData
    console.log('Token response:', tokenData)
    if (tokenData.error) {
      return new Response(`Error: ${tokenData.error_description}`, { status: 400 })
    }
    const accessToken = tokenData.access_token
    await c.env.accessstoken.put("access_token",accessToken)
    accessToken_var=await c.env.accessstoken.get("access_token")
    
    console.log('Received access token: ', accessToken)
    console.log('global access token: ', accessToken_var);
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    
    const userInfo = await userInfoResponse.json()
    console.log('User info: ', userInfo)
    const { email, name, picture } = userInfo as UserInfo
    const tokenPayload = JSON.stringify({ email, name, picture })
    const cookie = await generateJWT(tokenPayload, c.env.AUTH_SECRET, '1h')
     return new Response(null, {
      status: 302,
      headers: {
        Location: 'http://localhost:8080/mails',
        'Set-Cookie': `access_token=${accessToken}; Path=/; HttpOnly`,
      },
    })
  } catch (error) {
    console.log('Error during OAuth callback')
    console.log(error)
    console.error('Error fetching user info:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
app.get('/emails', async (c) => {
  try {
    // Extract the access token from the Authorization header
    const authorizationHeader = c.req.header('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Access token is required' }, 400);
    }
    
    const accessToken = authorizationHeader.split('Bearer ')[1];
    console.log(`Extracted access token: ${accessToken}`);
    
    // Fetch emails using the access token (you'll need to implement this function)
    const emails = await fetchEmails(accessToken);
    const classifiedEmails = await classifyEmailsWithGemini(emails);
    
    console.log(`Fetched emails: ${emails}`);
    console.log(`Classified emails: ${classifiedEmails}`);

    return c.json(classifiedEmails);
  } catch (error) {
    console.log('Error fetching emails:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/getAccessToken', async (c) => {
  
  const send_acessToken=await c.env.accessstoken.get("access_token")
  console.log('Access token variable:', send_acessToken);

  return c.json({ accessToken: send_acessToken });
});

app.get('/classifiedEmails',async (c)=>{
  try {

    const classifiedEmails= await classifyEmailsWithGPT(emails)



  }catch(err){
    console.log(err)
  }
})



app.get('/', async (c: Context) => {
  const cookieHeader = c.req.raw.headers.get('Cookie')
  const cookie = parseCookie(cookieHeader, 'custom_auth')
  if (cookie) {
    const decodedToken = decodeJWT(cookie)
    if (decodedToken) return new Response(JSON.stringify(decodedToken.payload), { headers: { 'Content-Type': 'application/json' } })
  }
  return new Response(JSON.stringify({}), { headers: { 'Content-Type': 'application/json' } })
})


export default app
