import { NextResponse } from 'next/server';
import { db, statements } from '@/lib/db';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingBid = statements.getBidById.get(id) as any;
    if (!existingBid) {
      return NextResponse.json({ success: false, error: 'Bid not found' }, { status: 404 });
    }

    // Atomic transaction for state transition
    if (body.status === 'accepted') {
      db.exec('BEGIN TRANSACTION;');
      try {
        statements.updateBidStatus.run('accepted', id);
        statements.updateLoadStatus.run('booked', existingBid.load_id);
        db.exec('COMMIT;');
      } catch (err) {
        db.exec('ROLLBACK;');
        throw err;
      }
    } else if (body.status) {
      statements.updateBidStatus.run(body.status, id);
    }

    if (body.shipperCounterPrice !== undefined) {
      db.prepare(`
        UPDATE bids
        SET shipper_counter_price = ?, shipper_counter_note = ?, last_updated_by = 'shipper'
        WHERE id = ?
      `).run(body.shipperCounterPrice, body.shipperCounterNote || null, id);
    }

    return NextResponse.json({ success: true, message: 'Bid updated successfully' });
  } catch (error: any) {
    console.error('Error updating bid:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
