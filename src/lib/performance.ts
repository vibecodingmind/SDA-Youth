/**
 * Performance Monitoring Utility
 * 
 * Tools for measuring and tracking performance metrics in the application.
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    slowestOperations: PerformanceMetric[];
  };
}

/**
 * Performance metrics store (in-memory for development)
 */
class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  /**
   * Record a performance metric
   */
  record(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_PERF_TRACKING === 'true') {
      this.metrics.push({
        ...metric,
        timestamp: Date.now(),
      });

      // Keep only recent metrics
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(-this.maxMetrics);
      }
    }
  }

  /**
   * Measure execution time of an async function
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.record({
        name,
        value: duration,
        unit: 'ms',
        tags: { ...tags, status: 'success' },
      });
      
      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.log(`[Perf] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.record({
        name,
        value: duration,
        unit: 'ms',
        tags: { ...tags, status: 'error' },
      });
      
      throw error;
    }
  }

  /**
   * Measure execution time of a sync function
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string>
  ): T {
    const start = performance.now();
    
    try {
      const result = fn();
      const duration = performance.now() - start;
      
      this.record({
        name,
        value: duration,
        unit: 'ms',
        tags: { ...tags, status: 'success' },
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.record({
        name,
        value: duration,
        unit: 'ms',
        tags: { ...tags, status: 'error' },
      });
      
      throw error;
    }
  }

  /**
   * Get metrics by name pattern
   */
  getMetrics(pattern?: string): PerformanceMetric[] {
    if (!pattern) return [...this.metrics];
    
    const regex = new RegExp(pattern);
    return this.metrics.filter(m => regex.test(m.name));
  }

  /**
   * Generate performance report
   */
  getReport(filter?: string): PerformanceReport {
    const metrics = filter ? this.getMetrics(filter) : this.metrics;
    
    if (metrics.length === 0) {
      return {
        metrics: [],
        summary: {
          totalMetrics: 0,
          avgResponseTime: 0,
          p95ResponseTime: 0,
          slowestOperations: [],
        },
      };
    }

    const times = metrics
      .filter(m => m.unit === 'ms')
      .map(m => m.value)
      .sort((a, b) => a - b);

    const avgResponseTime = times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;

    const p95Index = Math.floor(times.length * 0.95);
    const p95ResponseTime = times[p95Index] ?? 0;

    const slowestOperations = metrics
      .filter(m => m.unit === 'ms')
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      metrics,
      summary: {
        totalMetrics: metrics.length,
        avgResponseTime,
        p95ResponseTime,
        slowestOperations,
      },
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

// Singleton instance
export const perfTracker = new PerformanceTracker();

/**
 * Decorator for measuring class method performance
 */
export function measure(perfName?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const name = perfName ?? `${String(propertyKey)}`;

    descriptor.value = async function (...args: unknown[]) {
      return perfTracker.measure(name, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

/**
 * API route performance wrapper
 */
export function withPerformanceTracking<T>(
  name: string,
  handler: () => Promise<T>
): Promise<T> {
  return perfTracker.measure(`api:${name}`, handler);
}

/**
 * Database query performance wrapper
 */
export function trackDbQuery<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  return perfTracker.measure(`db:${queryName}`, query);
}

/**
 * Memory usage tracker
 */
export function getMemoryUsage(): {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
} | null {
  if (typeof process.memoryUsage === 'function') {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
    };
  }
  return null;
}

/**
 * Log performance summary
 */
export function logPerformanceSummary(): void {
  if (process.env.NODE_ENV === 'development') {
    const report = perfTracker.getReport();
    
    console.log('\n=== Performance Summary ===');
    console.log(`Total metrics: ${report.summary.totalMetrics}`);
    console.log(`Avg response time: ${report.summary.avgResponseTime.toFixed(2)}ms`);
    console.log(`P95 response time: ${report.summary.p95ResponseTime.toFixed(2)}ms`);
    
    if (report.summary.slowestOperations.length > 0) {
      console.log('\nSlowest operations:');
      report.summary.slowestOperations.forEach((op, i) => {
        console.log(`  ${i + 1}. ${op.name}: ${op.value.toFixed(2)}ms`);
      });
    }
    
    const memory = getMemoryUsage();
    if (memory) {
      console.log('\nMemory usage:');
      console.log(`  Heap used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Heap total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  RSS: ${(memory.rss / 1024 / 1024).toFixed(2)}MB`);
    }
    
    console.log('=========================\n');
  }
}

export { PerformanceTracker };
