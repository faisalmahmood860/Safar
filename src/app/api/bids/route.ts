import { NextResponse } from 'next/server';
import { db, statements } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const loadId = searchParams.get('load_id');
    const driverPhone = searchParams.get('driver_phone');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM bids WHERE 1=1';
    const params: any[] = [];

    if (loadId) {
      sql += ' AND load_id = ?';
      params.push(loadId);
    }
    if (driverPhone) {
      sql += ' AND driver_phone = ?';
      params.push(driverPhone);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = db.prepare(sql).all(...params) as any[];

    const formatted = rows.map((r) => ({
      id: r.id,
      loadId: r.load_id,
      loadTitle: r.load_title,
      route: r.route,
      shipperName: r.shipper_name,
      driverName: r.driver_name,
      driverNameUr: r.driver_name_ur,
      driverPhone: r.driver_phone,
      driverRating: r.driver_rating,
      driverTrips: r.driver_trips,
      truckNumber: r.truck_number,
      truckType: r.truck_type,
      originalPrice: r.original_price,
      offeredBidPrice: r.offered_bid_price,
      bidMessage: r.bid_message,
      status: r.status,
      submittedTime: r.submitted_time || 'Just now',
      shipperCounterPrice: r.shipper_counter_price,
      shipperCounterNote: r.shipper_counter_note,
      lastUpdatedBy: r.last_updated_by,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching bids:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || `BID-${String(Date.now()).slice(-4)}`;

    const insertBid = db.prepare(`
      INSERT INTO bids (
        id, load_id, load_title, route, shipper_name,
        driver_name, driver_name_ur, driver_phone, driver_rating, driver_trips,
        truck_number, truck_type, original_price, offered_bid_price,
        bid_message, status, submitted_time, shipper_counter_price, shipper_counter_note, last_updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBid.run(
      id,
      body.loadId,
      body.loadTitle || '',
      body.route || '',
      body.shipperName || '',
      body.driverName,
      body.driverNameUr || body.driverName,
      body.driverPhone,
      Number(body.driverRating || 5.0),
      Number(body.driverTrips || 0),
      body.truckNumber,
      body.truckType,
      Number(body.originalPrice || 0),
      Number(body.offeredBidPrice || 0),
      body.bidMessage || '',
      body.status || 'pending',
      body.submittedTime || 'Just now',
      body.shipperCounterPrice ?? null,
      body.shipperCounterNote ?? null,
      body.lastUpdatedBy || 'driver'
    );

    // Atomically increment bid count on the load
    if (body.loadId) {
      statements.incrementLoadBidsCount.run(body.loadId);
    }

    return NextResponse.json({
      success: true,
      data: { id, status: body.status || 'pending' },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting bid:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
