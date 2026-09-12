import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pickupCity = searchParams.get('pickup_city');
    const dropoffCity = searchParams.get('dropoff_city');
    const truckType = searchParams.get('truck_type');
    const status = searchParams.get('status') || 'posted';
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    // Dynamically build efficient SQL query utilizing composite B-Tree indexes
    const conditions: string[] = [];
    const params: any[] = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (pickupCity) {
      conditions.push('(pickup_city = ? OR pickup_city_ur = ?)');
      params.push(pickupCity, pickupCity);
    }

    if (dropoffCity) {
      conditions.push('(dropoff_city = ? OR dropoff_city_ur = ?)');
      params.push(dropoffCity, dropoffCity);
    }

    if (truckType) {
      conditions.push('truck_type = ?');
      params.push(truckType);
    }

    if (search) {
      conditions.push('(title LIKE ? OR cargo_type LIKE ? OR pickup_address LIKE ? OR dropoff_address LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count query
    const countSql = `SELECT COUNT(*) as total FROM loads ${whereClause}`;
    const totalRow = db.prepare(countSql).get(...params) as { total: number };
    const total = totalRow ? totalRow.total : 0;

    // Paginated loads query (sorted by created_at DESC)
    const querySql = `
      SELECT * FROM loads
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const queryParams = [...params, limit, offset];
    const rows = db.prepare(querySql).all(...queryParams) as any[];

    // Parse JSON special_requirements and format fields
    const formatted = rows.map((r) => {
      let specialRequirements: string[] = [];
      try {
        if (r.special_requirements) {
          specialRequirements = JSON.parse(r.special_requirements);
        }
      } catch {
        specialRequirements = [];
      }

      return {
        id: r.id,
        title: r.title,
        pickupCity: r.pickup_city,
        pickupCityUr: r.pickup_city_ur,
        pickupAddress: r.pickup_address,
        dropoffCity: r.dropoff_city,
        dropoffCityUr: r.dropoff_city_ur,
        dropoffAddress: r.dropoff_address,
        pickupLat: r.pickup_lat,
        pickupLng: r.pickup_lng,
        dropoffLat: r.dropoff_lat,
        dropoffLng: r.dropoff_lng,
        cargoType: r.cargo_type,
        cargoTypeUr: r.cargo_type_ur,
        cargoIcon: r.cargo_icon,
        truckType: r.truck_type,
        truckTypeUr: r.truck_type_ur,
        weight: r.weight,
        price: r.price,
        pricePerKm: r.price_per_km,
        distance: r.distance,
        estimatedHours: r.estimated_hours,
        pickupDate: r.pickup_date,
        pickupTime: r.pickup_time,
        specialRequirements,
        shipperName: r.shipper_name,
        shipperRating: r.shipper_rating,
        shipperLoads: r.shipper_loads,
        shipperVerified: Boolean(r.shipper_verified),
        status: r.status,
        postedAgo: r.posted_ago || 'Recently',
        bidsCount: r.bids_count,
        isUrgent: Boolean(r.is_urgent),
        isBookNow: Boolean(r.is_book_now),
        createdAt: r.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching loads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const id = body.id || `LD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const title = body.title || `${body.cargoType || 'Cargo'} — ${body.pickupCity} to ${body.dropoffCity}`;

    const insertStmt = db.prepare(`
      INSERT INTO loads (
        id, title, pickup_city, pickup_city_ur, pickup_address,
        dropoff_city, dropoff_city_ur, dropoff_address,
        pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
        cargo_type, cargo_type_ur, cargo_icon, truck_type, truck_type_ur,
        weight, price, price_per_km, distance, estimated_hours,
        pickup_date, pickup_time, special_requirements,
        shipper_name, shipper_rating, shipper_loads, shipper_verified,
        status, posted_ago, bids_count, is_urgent, is_book_now
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    insertStmt.run(
      id,
      title,
      body.pickupCity || '',
      body.pickupCityUr || body.pickupCity || '',
      body.pickupAddress || '',
      body.dropoffCity || '',
      body.dropoffCityUr || body.dropoffCity || '',
      body.dropoffAddress || '',
      body.pickupLat ?? null,
      body.pickupLng ?? null,
      body.dropoffLat ?? null,
      body.dropoffLng ?? null,
      body.cargoType || 'General Goods',
      body.cargoTypeUr || 'عام سامان',
      body.cargoIcon || '📦',
      body.truckType || 'Trailer',
      body.truckTypeUr || 'ٹریلر',
      Number(body.weight || 0),
      Number(body.price || 0),
      body.pricePerKm ? Number(body.pricePerKm) : null,
      body.distance ? Number(body.distance) : null,
      body.estimatedHours ? Number(body.estimatedHours) : null,
      body.pickupDate || new Date().toISOString().split('T')[0],
      body.pickupTime || '08:00 AM',
      JSON.stringify(body.specialRequirements || []),
      body.shipperName || 'Registered Shipper',
      Number(body.shipperRating || 5.0),
      Number(body.shipperLoads || 1),
      body.shipperVerified ? 1 : 1,
      body.status || 'posted',
      'Just now',
      0,
      body.isUrgent ? 1 : 0,
      body.isBookNow ? 1 : 1
    );

    return NextResponse.json({
      success: true,
      data: { id, title, status: body.status || 'posted' },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error inserting load:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
