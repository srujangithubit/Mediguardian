const http = require('http');

async function runTest() {
  const loginRes = await fetch("http://localhost:4000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test_senior_debugger@example.com",
      password: "password123"
    })
  });
  
  const loginData = await loginRes.json();
  const token = loginData.data ? loginData.data.token : loginData.token;
  
  const meRes = await fetch("http://localhost:4000/auth/me", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const meData = await meRes.json();
  const memberId = meData.data.families[0].members[0].id;
  console.log("Member ID:", memberId);
  
  const timelineRes = await fetch(`http://localhost:4000/timeline?familyMemberId=${memberId}&date=${new Date().toISOString()}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const text = await timelineRes.text();
  console.log("Timeline response:", text);
}

runTest().catch(console.error);
