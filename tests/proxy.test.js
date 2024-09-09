import { ProxyRotation } from '../src/proxy.js';
import fs from 'node:fs/promises';

async function runTests() {
  console.log('Starting tests for ProxyRotation class...');

  // Mock data for proxies
  const proxies = ['proxy1', 'proxy2', 'proxy3'];

  // Test 1: Creating ProxyRotation and rotating randomly
  const proxyRotation = new ProxyRotation(proxies, { timeout: 500 });
  try {
    const randomProxy = await proxyRotation.randomRotate();
    console.log(`Randomly selected proxy: ${randomProxy}`);
    if (proxies.includes(randomProxy)) {
      console.log('randomRotate() Test Passed ✔️');
    } else {
      console.error('randomRotate() Test Failed ❌');
    }
  } catch (error) {
    console.error('randomRotate() Test Failed ❌', error);
  }

  // Test 2: Circular proxy rotation
  try {
    const proxy1 = await proxyRotation.rotate();
    const proxy2 = await proxyRotation.rotate();
    const proxy3 = await proxyRotation.rotate();
    const proxy4 = await proxyRotation.rotate(); // Should return to the start

    if (proxy1 === 'proxy1' && proxy2 === 'proxy2' && proxy3 === 'proxy3' && proxy4 === 'proxy1') {
      console.log('rotate() Test Passed ✔️');
    } else {
      console.error('rotate() Test Failed ❌');
    }
  } catch (error) {
    console.error('rotate() Test Failed ❌', error);
  }

  // Test 3: Rotation with exclusion of used proxies
  try {
    const proxyA = await proxyRotation.rotateWithExclusion();
    const proxyB = await proxyRotation.rotateWithExclusion();
    const proxyC = await proxyRotation.rotateWithExclusion();

    if (proxyA !== proxyB && proxyB !== proxyC && proxyA !== proxyC) {
      console.log('rotateWithExclusion() Test Passed ✔️');
    } else {
      console.error('rotateWithExclusion() Test Failed ❌');
    }
  } catch (error) {
    console.error('rotateWithExclusion() Test Failed ❌', error);
  }

  // Test 4: Adding and removing proxies
  try {
    proxyRotation.addProxy('proxy4');
    proxyRotation.addProxy('proxy5');

    proxyRotation.removeProxy('proxy4');

    if (!proxyRotation.proxies.includes('proxy4') && proxyRotation.proxies.includes('proxy5')) {
      console.log('addProxy() and removeProxy() Test Passed ✔️');
    } else {
      console.error('addProxy() and removeProxy() Test Failed ❌');
    }
  } catch (error) {
    console.error('addProxy() and removeProxy() Test Failed ❌', error);
  }

  // Test 5: Loading proxies from a file
  try {
    const mockFileContent = 'proxy6\nproxy7\nproxy8';
    await fs.writeFile('proxies.txt', mockFileContent, 'utf-8');
    await proxyRotation.loadProxyFromFile('proxies.txt');

    if (proxyRotation.proxies.includes('proxy6') && proxyRotation.proxies.includes('proxy8')) {
      console.log('loadProxyFromFile() Test Passed ✔️');
    } else {
      console.error('loadProxyFromFile() Test Failed ❌');
    }
  } catch (error) {
    console.error('loadProxyFromFile() Test Failed ❌', error);
  } finally {
    await fs.unlink('proxies.txt'); // Remove the test file
  }

  // Test 6: Checking rotation timeout
  try {
    const start = Date.now();
    await proxyRotation.applyTimeout();
    const end = Date.now();

    if (end - start >= 500) {
      console.log('applyTimeout() Test Passed ✔️');
    } else {
      console.error('applyTimeout() Test Failed ❌');
    }
  } catch (error) {
    console.error('applyTimeout() Test Failed ❌', error);
  }

  // Test 7: Checking proxy health (mock fetch)
  try {
    global.fetch = async () => ({ ok: true }); // Mock function for fetch

    const isHealthy = await proxyRotation.proxyHealthCheck('https://example.com', 'proxy1');
    if (isHealthy) {
      console.log('proxyHealthCheck() Test Passed ✔️');
    } else {
      console.error('proxyHealthCheck() Test Failed ❌');
    }
  } catch (error) {
    console.error('proxyHealthCheck() Test Failed ❌', error);
  }

  console.log('All tests completed.');
}

runTests();
