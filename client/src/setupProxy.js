const { createProxyMiddleware } = require('http-proxy-middleware');

// Proxy API and WebSocket requests to the Kestra backend running on port 8080
module.exports = function (app) {
    const target = 'http://127.0.0.1:8080';

    // Proxy any /api requests
    app.use(
        '/api',
        createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
            logLevel: 'debug',
        })
    );

    // Proxy websocket path(s) used by the app (adjust if backend uses a different ws path)
    app.use(
        '/ws',
        createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
            logLevel: 'debug',
        })
    );
};
