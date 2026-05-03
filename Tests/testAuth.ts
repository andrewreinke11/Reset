import { createAuthToken } from '../src/middleware/auth';

export const authHeadersFor = (userName: string) => ({
  Authorization: `Bearer ${createAuthToken(userName)}`,
});
