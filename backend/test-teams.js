const http = require('http');

async function testTeamsAndRouting() {
  const BASE_URL = 'http://localhost:4000/api';

  const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(`${BASE_URL}${path}`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (token) options.headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null }));
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  console.log('--- STARTING TEAM & ROUTING VERIFICATION ---');

  // 1. GET AUTH TOKEN (Admin)
  console.log('\n[1] Fetching Auth Token (Admin)...');
  const loginRes = await request('POST', '/auth/login', { email: 'admin@enjay.com', password: 'Admin@123' });
  if (loginRes.status !== 200) throw new Error('Admin login failed');
  const adminToken = loginRes.data.data.accessToken;
  console.log('✅ Admin authenticated.');

  // 2. CREATE A NEW AGENT
  console.log('\n[2] Registering a new Agent...');
  const agentEmail = `engineer-${Date.now()}@enjay.com`;
  const agentReg = await request('POST', '/auth/register', { email: agentEmail, password: 'Password123', fullName: 'System Engineer' });
  const agentId = agentReg.data.data.user.id;
  console.log('✅ Agent created.');

  // 3. CREATE A TEAM
  console.log('\n[3] Creating "Technical Engineering" Team with LEAST_OPEN strategy...');
  const teamRes = await request('POST', '/teams', {
    name: 'Technical Engineering',
    description: 'Handles software bugs and security',
    assignmentStrategy: 'LEAST_OPEN',
    firstResponseSlaHrs: 2,
    resolutionSlaHrs: 12
  }, adminToken);

  if (teamRes.status !== 201) throw new Error(`Team creation failed: ${JSON.stringify(teamRes.data)}`);
  const teamId = teamRes.data.data.team.id;
  console.log('✅ Team created successfully.');

  // 4. ASSIGN AGENT TO TEAM
  console.log('\n[4] Assigning Agent to Team...');
  const memberRes = await request('POST', `/teams/${teamId}/members`, { userId: agentId, role: 'ENGINEER' }, adminToken);
  if (memberRes.status !== 201) throw new Error('Failed to assign member');
  console.log('✅ Agent assigned to Technical Engineering.');

  // 5. CREATE TICKET TO TRIGGER AUTO-ROUTING
  console.log('\n[5] Creating a SOFTWARE ticket to trigger auto-routing...');
  const ticketRes = await request('POST', '/tickets', {
    title: 'Software keeps crashing',
    description: 'The app crashes when I click export.',
    priority: 'HIGH',
    type: 'BUG',
    category: 'SOFTWARE' // This explicitly maps to 'Technical Engineering' in routing.service.ts
  }, adminToken);

  if (ticketRes.status !== 201) throw new Error(`Ticket creation failed: ${JSON.stringify(ticketRes.data)}`);

  const ticket = ticketRes.data.data.ticket;

  // 6. VERIFY ROUTING
  console.log('\n[6] Verifying Auto-Assignment Logic...');
  if (ticket.teamId !== teamId) {
    throw new Error(`Routing failed. Expected TeamId ${teamId}, got ${ticket.teamId}`);
  }
  if (ticket.assigneeId !== agentId) {
    throw new Error(`Auto-assignment failed. Expected AssigneeId ${agentId}, got ${ticket.assigneeId}`);
  }

  console.log('✅ Auto-routing successful! Ticket was dynamically assigned to the correct Team Queue.');
  console.log(`✅ Auto-assignment successful! Ticket was explicitly assigned to Agent ${agentId} via LEAST_OPEN strategy.`);

  console.log('\n🎉 ALL TEAM & ROUTING TESTS PASSED SUCCESSFULLY! 🎉');
}

testTeamsAndRouting().catch(console.error);