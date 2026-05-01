self.onmessage = (event) => {
  const timeout = Number(event.data?.timeout) || 3000;
  const childWorker = new Worker('./thread2.js');

  childWorker.onmessage = (childEvent) => {
    self.postMessage(childEvent.data);
    childWorker.terminate();
  };

  childWorker.onerror = () => {
    childWorker.terminate();
    self.postMessage({
      x: 0,
      iterations: 0,
      spentMs: 0,
      error: 'thread2 worker error',
    });
  };

  childWorker.postMessage({ timeout });
};