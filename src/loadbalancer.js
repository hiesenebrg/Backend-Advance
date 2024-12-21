const cluster = require('cluster');
const http = require('http');
const os = require('os');

// Get the number of CPU cores
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process running with PID: ${process.pid}`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart worker if it crashes
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new one...`);
    cluster.fork();
  });

} else {
  // Workers can share any TCP connection
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end(`Handled by worker: ${process.pid}`);
    })
    .listen(8000);

  console.log(`Worker process started with PID: ${process.pid}`);
}
