import type { AuthorizationServer } from 'oauth4webapi';
export const googleServer:AuthorizationServer={issuer:'https://accounts.google.com',authorization_endpoint:'https://accounts.google.com/o/oauth2/v2/auth',token_endpoint:'https://oauth2.googleapis.com/token',jwks_uri:'https://www.googleapis.com/oauth2/v3/certs'};
