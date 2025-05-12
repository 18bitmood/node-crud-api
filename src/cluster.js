const cluster = require('cluster');
const http = require('http');
const { availableParallelism } = require('os');
const dotenv = require('dotenv');
const { server, start } = require('./index');

dotenv.config();

const BASE_PORT = parseInt(process.env.PORT || 3000);

const availableCPUs = availableParallelism();
const envParallelism = process.env.PARALLELISM ? parseInt(process.env.PARALLELISM) : null;
const numCPUs = (envParallelism && envParallelism <= availableCPUs) ? envParallelism - 1 : availableCPUs;

let currentWorker = 0;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Setting up ${numCPUs} workers...`);

  const loadBalancer = http.createServer((req, res) => {
    currentWorker = (currentWorker + 1) % numCPUs;
    const workerPort = BASE_PORT + currentWorker + 1;

    console.log(`[Load Balancer] Forwarding request to worker on port ${workerPort}`);

    const options = {
      hostname: 'localhost',
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });

    proxyReq.on('error', (err) => {
      console.error(`[Load Balancer] Error forwarding request: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal Server Error', error: 'Failed to forward request' }));
    });
  });

  loadBalancer.listen(BASE_PORT, () => {
    console.log(`Load balancer running on port ${BASE_PORT}`);
  });

  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork({
      WORKER_PORT: BASE_PORT + i + 1
    });

    console.log(`Worker ${worker.process.pid} started on port ${BASE_PORT + i + 1}`);
  }

  process.on('SIGINT', () => {
    console.log('Primary shutting down...');

    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }

    loadBalancer.close(() => {
      console.log('Load balancer closed');
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 3000);
  });
} else {
  const workerPort = parseInt(process.env.WORKER_PORT);

  start(workerPort).catch(err => {
    console.error(`Worker failed to start: ${err.message}`);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log(`Worker ${process.pid} shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 3000);
  });
}
