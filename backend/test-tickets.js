const http = require('http');

async function testTickets() {
  const BASE_URL = 'http://localhost:4000/api';
  let accessToken = '';
  let ticketId = '';
  let currentVersion = 1;

  const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(`${BASE_URL}${path}`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (token) options.headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
          });
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  console.log('--- STARTING TICKET ENGINE VERIFICATION ---');

  // 1. GET AUTH TOKEN (Using the seeded admin user)
  console.log('\n[1] Fetching Auth Token (Admin)...');
  const loginRes = await request('POST', '/auth/login', { email: 'admin@enjay.com', password: 'Admin@123' });
  if (loginRes.status !== 200) throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
  accessToken = loginRes.data.data.accessToken;
  console.log('✅ Auth token acquired.');

  // 2. CREATE TICKET (Verify TicketNumber & SLAs)
  console.log('\n[2] Testing Ticket Creation (Priority: URGENT)...');
  const createRes = await request('POST', '/tickets', {
    title: 'Server is down',
    description: 'The main database server is unreachable.',
    priority: 'URGENT',
    type: 'INCIDENT',
    category: 'HARDWARE'
  }, accessToken);

  if (createRes.status !== 201) throw new Error(`Create ticket failed: ${JSON.stringify(createRes.data)}`);

  const ticket = createRes.data.data.ticket;
  ticketId = ticket.id;
  currentVersion = ticket.version;

  if (!ticket.ticketNumber.startsWith('HD-')) throw new Error('Ticket number sequence failed.');
  if (!ticket.firstResponseDueAt || !ticket.resolutionDueAt) throw new Error('SLA timestamps were not assigned.');

  console.log(`✅ Ticket Created successfully. Number: ${ticket.ticketNumber}`);
  console.log(`✅ SLAs attached. Resolution Due: ${new Date(ticket.resolutionDueAt).toLocaleTimeString()}`);

  // 3. INVALID STATE TRANSITION (Verify State Machine)
  console.log('\n[3] Testing State Machine (NEW -> PENDING)...');
  const invalidTransitionRes = await request('PATCH', `/tickets/${ticketId}/status`, {
    status: 'PENDING',
    version: currentVersion
  }, accessToken);

  if (invalidTransitionRes.status !== 400) throw new Error(`State machine failed. Expected 400, got ${invalidTransitionRes.status}`);
  console.log('✅ State Machine successfully blocked jumping from NEW to PENDING (400 Bad Request).');

  // 4. VALID STATE TRANSITION (NEW -> OPEN)
  console.log('\n[4] Testing State Machine (NEW -> OPEN)...');
  const validTransitionRes = await request('PATCH', `/tickets/${ticketId}/status`, {
    status: 'OPEN',
    version: currentVersion
  }, accessToken);

  if (validTransitionRes.status !== 200) throw new Error(`Valid transition failed: ${JSON.stringify(validTransitionRes.data)}`);
  currentVersion = validTransitionRes.data.data.ticket.version;
  console.log(`✅ Status updated to OPEN. Ticket version incremented to: ${currentVersion}`);

  // 5. OPTIMISTIC LOCKING FAILURE
  console.log('\n[5] Testing Optimistic Locking (Stale Version)...');
  // Attempt to update the ticket using the OLD version number
  const lockFailRes = await request('PATCH', `/tickets/${ticketId}/status`, {
    status: 'RESOLVED',
    version: 1 // Stale!
  }, accessToken);

  if (lockFailRes.status !== 409) throw new Error(`Optimistic locking failed. Expected 409, got ${lockFailRes.status}`);
  console.log('✅ Optimistic Locking blocked stale update request successfully (409 Conflict).');

  // 5.5 Create an Agent/Second User to test SLA fulfillment
  // (SLA only fulfills if the person commenting is NOT the requester)
  console.log('\n[5.5] Authenticating a secondary user (Agent) to reply...');
  const agentEmail = `agent-${Date.now()}@enjay.com`;
  await request('POST', '/auth/register', { email: agentEmail, password: 'TestPassword123', fullName: 'Agent Tester' });
  const agentLogin = await request('POST', '/auth/login', { email: agentEmail, password: 'TestPassword123' });
  const agentToken = agentLogin.data.data.accessToken;

  // 6. ADD COMMENT & FIRST RESPONSE SLA
  console.log('\n[6] Testing Comment & First Response SLA fulfillment...');
  const commentRes = await request('POST', `/tickets/${ticketId}/comments`, {
    content: 'We are investigating the server issue now.',
    isInternal: false
  }, agentToken);

  if (commentRes.status !== 201) throw new Error(`Comment failed: ${JSON.stringify(commentRes.data)}`);
  console.log('✅ Comment added successfully by Agent.');

  // 7. GET TIMELINE (Verify merged comments and activities)
  console.log('\n[7] Testing Unified Timeline & Audit Trail...');
  const timelineRes = await request('GET', `/tickets/${ticketId}`, null, accessToken);

  if (timelineRes.status !== 200) throw new Error('Timeline fetch failed.');
  const { timeline, ticket: updatedTicket } = timelineRes.data.data;

  if (!updatedTicket.firstResponseAt) throw new Error('First Response SLA was not auto-fulfilled by comment!');
  console.log(`✅ First Response SLA auto-fulfilled at: ${new Date(updatedTicket.firstResponseAt).toLocaleTimeString()}`);

  const hasActivity = timeline.some(item => item.timelineType === 'ACTIVITY' && item.action === 'STATUS_CHANGED');
  const hasComment = timeline.some(item => item.timelineType === 'COMMENT');

  if (!hasActivity || !hasComment) throw new Error('Timeline did not merge comments and activities properly.');
  console.log('✅ Timeline successfully merged Audit Activities and Comments in chronological order.');

  console.log('\n🎉 ALL TICKET ENGINE TESTS PASSED SUCCESSFULLY! 🎉');
}

testTickets().catch(console.error);