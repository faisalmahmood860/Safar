import { NextResponse } from 'next/server';
import { db, statements } from '@/lib/db';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const city = searchParams.get('city');

    let sql = 'SELECT * FROM fleet_trucks WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (city) {
      sql += ' AND (current_city = ? OR current_city_ur = ?)';
      params.push(city, city);
    }

    sql += ' ORDER BY id ASC';

    const rows = db.prepare(sql).all(...params) as any[];

    const formatted = rows.map((r) => ({
      id: r.id,
      registrationNumber: r.registration_number,
      type: r.type,
      typeUr: r.type_ur,
      typeIcon: r.type_icon,
      driverName: r.driver_name,
      driverNameUr: r.driver_name_ur,
      status: r.status,
      currentCity: r.current_city,
      currentCityUr: r.current_city_ur,
      lat: r.lat,
      lng: r.lng,
      fuelLevel: r.fuel_level,
      lastMaintenance: r.last_maintenance,
      nextMaintenance: r.next_maintenance,
      totalKm: r.total_km,
      currentLoad: r.current_load,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching fleet trucks:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
