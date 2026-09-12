import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const status = searchParams.get('status') || 'available';

    let sql = 'SELECT * FROM driver_availabilities WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (city) {
      sql += ' AND (current_city = ? OR current_city_ur = ?)';
      params.push(city, city);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = db.prepare(sql).all(...params) as any[];

    const formatted = rows.map((r) => ({
      id: r.id,
      driverName: r.driver_name,
      driverNameUr: r.driver_name_ur,
      driverPhone: r.driver_phone,
      driverRating: r.driver_rating,
      completedTrips: r.completed_trips,
      healthStatus: r.health_status,
      isFleetManaged: Boolean(r.is_fleet_managed),
      fleetCompanyName: r.fleet_company_name,
      fleetManager: r.fleet_manager,
      truckNumber: r.truck_number,
      truckType: r.truck_type,
      currentCity: r.current_city,
      currentCityUr: r.current_city_ur,
      currentLocation: r.current_location,
      preferredDestination: r.preferred_destination,
      preferredDestinationUr: r.preferred_destination_ur,
      availableCapacityTons: r.available_capacity_tons,
      departureTime: r.departure_time,
      status: r.status,
      postedAgo: r.posted_ago || 'Recently',
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching driver availabilities:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
