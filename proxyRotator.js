export class ProxyRotation extends Proxy {
  constructor(proxies = [], options = {}) {
    super(proxies, options);

    this.proxies = proxies;
    this.options = options;
    this.usedProxies = [];
    this.position = 0;
  }

  randomRotate() {
    if (this.proxies.length === 0) {
      throw new Error('No proxies available for rotation');
    }
    const randomElement = Math.floor(Math.random() * this.proxies.length);
    return this.proxies[randomElement];
  }

  rotate() {
    if (this.proxies.length === 0) {
      throw new Error('No proxies available for rotation');
    }
    const proxyElement = this.proxies[this.position];
    this.position = (this.position + 1) % this.proxies.length;
    return proxyElement;
  }

  rotateWithExclusion() {
    if (this.proxies.length === 0) {
      throw new Error('No proxies available for rotation');
    }

    if (this.usedProxies.length === this.proxies.length) {
      this.usedProxies = [];
    }

    const availableProxies = this.proxies.filter((proxy) => !this.usedProxies.includes(proxy));
    const randomIndex = Math.floor(Math.random() * availableProxies.length);
    const selectedProxy = availableProxies[randomIndex];

    this.usedProxies.push(selectedProxy);
    return selectedProxy;
  }

  addProxy(proxy) {
    if (typeof proxy === 'string' && proxy.length > 0 && !this.proxies.includes(proxy)) {
      this.proxies.push(proxy);
    } else {
      throw new Error('Invalid proxy or already exists');
    }
  }

  removeProxy(proxy) {
    if (typeof proxy === 'string') {
      const index = this.proxies.indexOf(proxy);
      if (index > -1) {
        this.proxies.splice(index, 1);
      } else {
        throw new Error('Proxy not found');
      }
    } else {
      throw new Error('Invalid proxy format');
    }
  }

  async proxyHealthCheck(url, proxy, timeout = 5000) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { proxy, signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      throw new Error('Proxy health check failed: ' + error.message);
    }
  }

  async cleanProxies(url) {
    const workingProxies = [];

    for (const proxy of this.proxies) {
      if (await this.proxyHealthCheck(url, proxy)) {
        workingProxies.push(proxy);
      }
    }

    this.proxies = workingProxies;
  }
}
