import { NextResponse } from 'next/server';
import { db, statements } from '@/lib/db';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const startTime = performance.now();

    // 1. Check PRAGMA settings
    const pragmas = statements.getDbPragmas();

    // 2. Fetch table counts
    const counts = {
      loads: (db.prepare('SELECT COUNT(*) as count FROM loads').get() as any).count,
      bids: (db.prepare('SELECT COUNT(*) as count FROM bids').get() as any).count,
      fleetTrucks: (db.prepare('SELECT COUNT(*) as count FROM fleet_trucks').get() as any).count,
      driverAvailabilities: (db.prepare('SELECT COUNT(*) as count FROM driver_availabilities').get() as any).count,
      invoices: (db.prepare('SELECT COUNT(*) as count FROM commission_invoices').get() as any).count,
      users: (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count,
    };

    // 3. Inspect active indexes
    const indexes = db.prepare(`
      SELECT name, tbl_name, sql 
      FROM sqlite_master 
      WHERE type = 'index' AND sql IS NOT NULL
    `).all() as any[];

    // 4. Benchmark: Run 200 indexed queries to test microsecond execution latency
    const benchmarkStart = performance.now();
    const testStmt = db.prepare('SELECT id, title, price FROM loads WHERE status = ? AND pickup_city = ? LIMIT 5');
    for (let i = 0; i < 200; i++) {
      testStmt.all('posted', 'Multan');
    }
    const benchmarkEnd = performance.now();
    const benchmarkTotalMs = benchmarkEnd - benchmarkStart;
    const avgQueryLatencyUs = Math.round((benchmarkTotalMs / 200) * 1000); // in microseconds!

    const totalTimeMs = performance.now() - startTime;

    return NextResponse.json({
      success: true,
      status: 'healthy',
      engine: 'Node.js 24 Native SQLite (node:sqlite) with C-level bindings',
      optimizations: {
        journalMode: (pragmas.journalMode as any)?.journal_mode || 'wal',
        synchronous: (pragmas.synchronous as any)?.synchronous,
        cacheSizeKb: Math.abs((pragmas.cacheSize as any)?.cache_size || 64000),
        mmapSizeBytes: (pragmas.mmapSize as any)?.mmap_size,
        pageSizeBytes: (pragmas.pageSize as any)?.page_size,
        pageCount: (pragmas.pageCount as any)?.page_count,
        totalDbSizeBytes: ((pragmas.pageSize as any)?.page_size || 4096) * ((pragmas.pageCount as any)?.page_count || 1),
      },
      benchmark: {
        totalQueriesRun: 200,
        benchmarkDurationMs: Number(benchmarkTotalMs.toFixed(3)),
        avgQueryLatencyUs: `${avgQueryLatencyUs} µs (${(avgQueryLatencyUs / 1000).toFixed(3)} ms)`,
        throughputOpsPerSecond: Math.round(200 / (benchmarkTotalMs / 1000)),
      },
      counts,
      activeIndexes: indexes.map((idx) => ({ name: idx.name, table: idx.tbl_name })),
      diagnosticsExecutionMs: Number(totalTimeMs.toFixed(3)),
    });
  } catch (error: any) {
    console.error('Database health check failed:', error);
    return NextResponse.json({ success: false, status: 'unhealthy', error: error.message }, { status: 500 });
  }
}
