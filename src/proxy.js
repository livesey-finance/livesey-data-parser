import fs from 'node:fs/promises';

export class ProxyRotation {
  constructor(proxies = [], options = {}) {
    this.proxies = proxies;
    this.options = options;
    this.usedProxies = [];
    this.position = 0;
    this.rotationTimeout = options.timeout || 0;

    if (this.options.proxyFile) this.loadProxyFromFile(this.options.proxyFile);
    if (this.options.method) this.setMethod(this.options.method);
  }

  async setMethod(method) {
    const methods = {
      'random': this.randomRotate.bind(this),
      'roundRobin': this.rotate.bind(this),
      'rotateWithExclusion': this.rotateWithExclusion.bind(this)
    };

    if (methods[method]) {
      return methods[method];
    } else {
      throw new Error(`Unknown method: ${method}`);
    }
  }

  async randomRotate() {
    if (this.proxies.length === 0) {
      throw new Error('No proxies available for rotation');
    }

    await this.applyTimeout();
    const randomElement = Math.floor(Math.random() * this.proxies.length);
    return this.proxies[randomElement];
  }

  async rotate() {
    if (this.proxies.length === 0) {
      throw new Error('No proxies available for rotation');
    }

    await this.applyTimeout();
    const proxyElement = this.proxies[this.position];
    this.position = (this.position + 1) % this.proxies.length;
    return proxyElement;
  }

  async rotateWithExclusion() {
    if (this.proxies.length === 0) {
      throw new Error('No proxies available for rotation');
    }

    if (this.usedProxies.length === this.proxies.length) {
      this.usedProxies = [];
    }

    await this.applyTimeout();

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
      const response = await fetch(url, { signal: controller.signal });
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

  async loadProxyFromFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const proxies = data.split('\n').filter((proxy) => proxy.trim() !== '');
      this.proxies.push(...proxies);
    } catch (error) {
      throw new Error(`Error loading proxies from file: ${error.message}`);
    }
  }

  async loadProxyFromApi(url) {
    try {
      const data = await fetch(url);
      const proxies = await data.json();
      this.proxies.push(...proxies);
    } catch (error) {
      throw new Error(`Error loading proxies from API: ${error.message}`);
    }
  }

  async applyTimeout() {
    if (this.rotationTimeout > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.rotationTimeout));
    }
  }
}
