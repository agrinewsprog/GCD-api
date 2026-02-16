const http = require("http");

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/workflow/tasks",
  method: "GET",
  headers: {
    Authorization: "Bearer YOUR_TOKEN_HERE", // Reemplazar con un token válido
    "Content-Type": "application/json",
  },
};

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Headers:", JSON.stringify(res.headers, null, 2));
    console.log("\nResponse:");
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      console.log(`\nTotal tareas: ${parsed.length || 0}`);
    } catch (e) {
      console.log(data);
    }
  });
});

req.on("error", (error) => {
  console.error("Error:", error);
});

req.end();
