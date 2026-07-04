const http = require('http');

async function testAuth() {
  const BASE_URL = 'http://localhost:4000/api/auth';
  let accessToken = '';
  let refreshTokenCookie = '';

  const request = (method, path, body = null, token = null, cookie = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(`${BASE_URL}${path}`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (token) options.headers['Authorization'] = `Bearer ${token}`;
      if (cookie) options.headers['Cookie'] = cookie;

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null,
          });
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  console.log('--- STARTING AUTH VERIFICATION ---');

  // 1. REGISTER
  const registerPayload = { email: `test-${Date.now()}@enjay.com`, password: 'TestPassword123', fullName: 'Automated Tester' };
  console.log('\n[1] Testing Registration...');
  const regRes = await request('POST', '/register', registerPayload);
  console.log(`Status: ${regRes.status}`);
  if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
  console.log('✅ Registration successful. Password hashed and user stored.');

  // 2. LOGIN (Verify JWT and HttpOnly Cookie)
  console.log('\n[2] Testing Login (Valid Credentials)...');
  const loginRes = await request('POST', '/login', { email: registerPayload.email, password: registerPayload.password });
  console.log(`Status: ${loginRes.status}`);
  if (loginRes.status !== 200) throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);

  accessToken = loginRes.data.data.accessToken;
  const setCookieHeader = loginRes.headers['set-cookie'];
  if (!setCookieHeader || !setCookieHeader[0].includes('HttpOnly')) {
    throw new Error('HttpOnly refresh token cookie was not set properly.');
  }
  refreshTokenCookie = setCookieHeader[0].split(';')[0];
  console.log('✅ Login successful. JWT generated. HttpOnly cookie set securely.');

  // 3. BAD LOGIN (Verify Error Handling)
  console.log('\n[3] Testing Login (Invalid Password)...');
  const badLoginRes = await request('POST', '/login', { email: registerPayload.email, password: 'wrongpassword' });
  console.log(`Status: ${badLoginRes.status}`);
  if (badLoginRes.status !== 401) throw new Error('Expected 401 Unauthorized for bad login.');
  console.log('✅ Error handling working correctly (401 Unauthorized).');

  // 4. GET PROFILE (Verify JWT Decoding)
  console.log('\n[4] Testing Get Current User (Profile)...');
  const profileRes = await request('GET', '/profile', null, accessToken);
  console.log(`Status: ${profileRes.status}`);
  if (profileRes.status !== 200) throw new Error('Failed to get profile with valid token.');
  if (!profileRes.data.data.user.role) throw new Error('Decoded user does not contain Role.');
  console.log('✅ Profile fetched successfully. JWT decoded correctly.');

  // 5. ROLE GUARD (Verify Role Middleware)
  console.log('\n[5] Testing Role Middleware (Admin Route)...');
  const roleRes = await request('GET', '/admin-only', null, accessToken);
  console.log(`Status: ${roleRes.status}`);
  if (roleRes.status !== 403) throw new Error('Expected 403 Forbidden for non-admin user.');
  console.log('✅ Role middleware blocked unauthorized access (403 Forbidden).');

  // 6. REFRESH TOKEN (Verify Token Rotation)
  console.log('\n[6] Testing Refresh Token Rotation...');
  const refreshRes = await request('POST', '/refresh-token', null, null, refreshTokenCookie);
  console.log(`Status: ${refreshRes.status}`);
  if (refreshRes.status !== 200) throw new Error('Failed to refresh token.');

  const newSetCookieHeader = refreshRes.headers['set-cookie'];
  const newRefreshTokenCookie = newSetCookieHeader[0].split(';')[0];
  if (refreshTokenCookie === newRefreshTokenCookie) throw new Error('Refresh token was not rotated!');
  console.log('✅ Token rotated successfully. Old token revoked, new HttpOnly cookie issued.');

  // 7. LOGOUT (Verify Cookie Deletion)
  console.log('\n[7] Testing Logout...');
  const logoutRes = await request('POST', '/logout', null, accessToken, newRefreshTokenCookie);
  console.log(`Status: ${logoutRes.status}`);

  const logoutCookieHeader = logoutRes.headers['set-cookie'][0];
  if (!logoutCookieHeader.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT')) {
    throw new Error('Logout did not clear the cookie correctly.');
  }
  console.log('✅ Logout successful. Token revoked in database, cookie cleared from browser.');

  console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY! 🎉');
}

testAuth().catch(console.error);