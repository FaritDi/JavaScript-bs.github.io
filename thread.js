self.onmessage = (event) => {
  const timeout = Number(event.data?.timeout) || 3000;
  const start = performance.now();
  let x = 0;
  let i = 0;

  do {
    i += 1;
    x += (Math.random() - 0.5) * i;
  } while (performance.now() - start < timeout);

  self.postMessage({
    x: Number(x.toFixed(2)),
    iterations: i,
    spentMs: Math.round(performance.now() - start),
  });
};