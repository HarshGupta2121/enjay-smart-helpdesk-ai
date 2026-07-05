const axios = require('axios');

async function test() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@enjay.com',
      password: 'Admin@123'
    });
    const token = loginRes.data.data.accessToken;
    console.log("Got token");

    // 2. Fetch users to find one to delete
    const usersRes = await axios.get('http://localhost:4000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Find customer3
    const targetUser = usersRes.data.data.users.find(u => u.email === 'customer3@enjay.com');
    if (!targetUser) {
      console.log("No target user found");
      return;
    }
    console.log("Target user:", targetUser.email, targetUser.id);

    // 3. Call DELETE api
    console.log(`Calling DELETE /api/users/${targetUser.id}`);
    const delRes = await axios.delete(`http://localhost:4000/api/users/${targetUser.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Delete response:", delRes.status, delRes.data);

    // 4. Verify in DB
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const dbCheck = await prisma.user.findUnique({ where: { id: targetUser.id } });
    if (dbCheck) {
      console.log("FAILED: User still in database!");
    } else {
      console.log("SUCCESS: User physically removed from DB!");
    }
    await prisma.$disconnect();

  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
}

test();
