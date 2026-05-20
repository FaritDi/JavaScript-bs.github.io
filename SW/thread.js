const MESSAGE_TYPES = {
  GET_CACHED_RESULT: 'GET_CACHED_RESULT',
  REGENERATE: 'REGENERATE',
  CLEAR_CACHE: 'CLEAR_CACHE',
  UNREGISTER: 'UNREGISTER',
  RESULT: 'RESULT',
  CLEARED: 'CLEARED',
  UNREGISTERED: 'UNREGISTERED',
  ERROR: 'ERROR',
};

const CACHE_NAME = 'sw-slow-function-cache-v1';
const CACHE_KEY = '/sw-result';

const cache = {
  result: null,
};

const slowFunction = (timeout = 3000) => {
  const start = performance.now();
  let x = 0;
  let i = 0;

  do {
    i += 1;
    x += (Math.random() - 0.5) * i;
  } while (performance.now() - start < timeout);

  return {
    x: Number(x.toFixed(2)),
    iterations: i,
    spentMs: Math.round(performance.now() - start),
  };
};

const saveCachedResult = async (result) => {
  const storage = await caches.open(CACHE_NAME);
  const response = new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json' },
  });
  await storage.put(CACHE_KEY, response);
};

const readCachedResult = async () => {
  const storage = await caches.open(CACHE_NAME);
  const response = await storage.match(CACHE_KEY);
  if (!response) {
    return null;
  }
  return response.json();
};

const recalculate = async (timeout) => {
  cache.result = slowFunction(timeout);
  await saveCachedResult(cache.result);
  return cache.result;
};

const clearCachedResult = async () => {
  cache.result = null;
  await caches.delete(CACHE_NAME);
};

const getCachedResult = async (timeout) => {
  if (cache.result) {
    return { ...cache.result, source: 'memory-cache' };
  }

  const persisted = await readCachedResult();
  if (persisted) {
    cache.result = persisted;
    return { ...persisted, source: 'storage-cache' };
  }

  const recalculated = await recalculate(timeout);
  return { ...recalculated, source: 'calculated' };
};

const broadcast = async (msg) => {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  for (const client of clients) {
    client.postMessage(msg);
  }
};

self.addEventListener('install', (evt) => {
  evt.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('message', async (evt) => {
  try {
    const msg = evt.data || {};
    const timeout = Number(msg.payload?.timeout) || 3000;

    if (msg.type === MESSAGE_TYPES.GET_CACHED_RESULT) {
      const result = await getCachedResult(timeout);
      await broadcast({ type: MESSAGE_TYPES.RESULT, data: result });
      return;
    }

    if (msg.type === MESSAGE_TYPES.REGENERATE) {
      const result = await recalculate(timeout);
      await broadcast({
        type: MESSAGE_TYPES.RESULT,
        data: { ...result, source: 'recalculated' },
      });
      return;
    }

    if (msg.type === MESSAGE_TYPES.CLEAR_CACHE) {
      await clearCachedResult();
      await broadcast({ type: MESSAGE_TYPES.CLEARED });
      return;
    }

    if (msg.type === MESSAGE_TYPES.UNREGISTER) {
      await clearCachedResult();
      const payload = { type: MESSAGE_TYPES.UNREGISTERED };
      await broadcast(payload);

      const tabsChannel = new BroadcastChannel('sw_tabs_sync');
      tabsChannel.postMessage(payload);
      tabsChannel.close();
      return;
    }
  } catch (error) {
    await broadcast({ type: MESSAGE_TYPES.ERROR, error: String(error) });
  }
});
