// Simulated API delays for mock backend

export const delays = {
  // Fast operations
  fast: () => new Promise(resolve => setTimeout(resolve, 200)),
  
  // Standard operations
  standard: () => new Promise(resolve => setTimeout(resolve, 500)),
  
  // Slow operations (lock/unlock, work orders)
  slow: () => new Promise(resolve => setTimeout(resolve, 800)),
  
  // PMS sync
  sync: () => new Promise(resolve => setTimeout(resolve, 1000)),
  
  // Custom delay
  custom: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Random delay between min and max ms
export const randomDelay = (min: number, max: number) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
};
