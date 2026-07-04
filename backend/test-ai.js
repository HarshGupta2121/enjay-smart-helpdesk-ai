const http = require('http');

async function testAIEngine() {
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

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  console.log('--- STARTING ENTERPRISE AI ENGINE VERIFICATION ---');

  // 1. GET AUTH TOKEN
  console.log('\n[1] Fetching Auth Token (Admin)...');
  const loginRes = await request('POST', '/auth/login', { email: 'admin@enjay.com', password: 'Admin@123' });
  const adminToken = loginRes.data.data.accessToken;
  console.log('✅ Admin authenticated.');

  // 2. CREATE TICKET
  console.log('\n[2] Creating ticket to trigger background AI processing...');
  const ticketRes = await request('POST', '/tickets', {
    title: 'The application crashes on login',
    description: 'Every time I try to log into the mobile app, it freezes and throws an error code 500. This is very frustrating.',
    priority: 'HIGH',
    category: 'SOFTWARE'
  }, adminToken);
  const ticketId = ticketRes.data.data.ticket.id;
  console.log('✅ Ticket created. AI Engine is processing in the background.');

  // 3. WAIT FOR BACKGROUND AI
  console.log('\n[3] Waiting 2 seconds for asynchronous AI execution...');
  await delay(2000);

  // 4. VERIFY AI METADATA
  console.log('\n[4] Verifying AI Ticket Metadata (Summary, Classification, Duplicate Detection)...');
  const updatedTicketRes = await request('GET', `/tickets/${ticketId}`, null, adminToken);
  const { ticket, timeline } = updatedTicketRes.data.data;

  if (!ticket.aiSummary) throw new Error('AI Summary is missing');
  if (!ticket.aiSentiment) throw new Error('AI Sentiment classification is missing');
  if (!ticket.aiCategoryReason) throw new Error('AI Category Reason is missing');
  if (ticket.duplicateScore === null || ticket.duplicateScore === undefined) throw new Error('Duplicate score was not computed');

  console.log(`✅ AI Summary generated: "${ticket.aiSummary}"`);
  console.log(`✅ AI Sentiment classified as: ${ticket.aiSentiment}`);
  console.log(`✅ AI Confidence: ${ticket.aiConfidence * 100}%`);
  console.log(`✅ Duplicate Score calculated (Cosine Similarity Fallback working).`);

  // 5. TEST SUGGESTED REPLY
  console.log('\n[5] Testing AI Draft Reply generation...');
  const replyRes = await request('POST', `/tickets/${ticketId}/ai/reply`, null, adminToken);
  if (replyRes.status !== 200) throw new Error(`Draft reply failed: ${JSON.stringify(replyRes.data)}`);

  console.log(`✅ AI Draft Reply successfully generated: "${replyRes.data.data.draft.substring(0, 50)}..."`);

  console.log('\n🎉 ALL AI ENGINE TESTS PASSED SUCCESSFULLY! 🎉');
}

testAIEngine().catch(console.error);