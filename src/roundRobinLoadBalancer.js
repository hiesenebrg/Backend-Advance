const http = require('http');
const httpProxy = require('http-proxy');

// List of target servers
const servers = [
  'http://localhost:8001',
  'http://localhost:8002',
  'http://localhost:8003'
];
let currentIndex = 0; // Start from the first server

// Create a proxy server
const proxy = httpProxy.createProxyServer();

// Create the load balancer server
const loadBalancer = http.createServer((req, res) => {
  // Select the server using round-robin
  const target = servers[currentIndex];

  // Proxy the request to the target server
  proxy.web(req, res, { target }, (err) => {
    console.error(`Error proxying to server: ${target}`, err);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway');
  });

  // Move to the next server (round-robin)
  currentIndex = (currentIndex + 1) % servers.length;
});

// Start the load balancer on port 8000
loadBalancer.listen(8000, () => {
  console.log('Load Balancer running at http://localhost:8000');
  console.log('Forwarding requests to:');
  servers.forEach((server) => console.log(` - ${server}`));
});
