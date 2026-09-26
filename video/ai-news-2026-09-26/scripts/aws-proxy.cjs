// Preload for Lambda scripts in the cloud sandbox: the AWS SDK makes its own https.Agent,
// which ignores HTTPS_PROXY, so AWS calls skip the proxy that injects the real
// credentials. With this preloaded, `new https.Agent(...)` returns an agent that tunnels
// through the proxy. Only construction is redirected: https.Agent.prototype stays the
// original, which the proxy agent itself relies on. No effect when HTTPS_PROXY is unset.
const https = require('node:https');
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxy) {
  const {HttpsProxyAgent} = require('https-proxy-agent');
  const make = (opts = {}) => new HttpsProxyAgent(proxy, {keepAlive: true, ...opts});
  https.Agent = new Proxy(https.Agent, {construct: (_t, [opts]) => make(opts)});
  https.globalAgent = make();
}
