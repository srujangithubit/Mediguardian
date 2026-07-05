async function runTest() {
  const loginRes = await fetch("http://localhost:4000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test_senior_debugger@example.com",
      password: "password123"
    })
  });
  
  const text = await loginRes.text();
  console.log("Status:", loginRes.status);
  console.log("Body:", text);
}

runTest().catch(console.error);
