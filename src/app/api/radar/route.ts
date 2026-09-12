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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `RADAR-${Date.now()}`;
    const driverName = body.driverName || 'Verified Driver';
    const driverPhone = body.driverPhone || '+92 300 1234567';
    const truckNumber = body.truckNumber || 'LHR-5678';
    const truckType = body.truckType || '22-Wheeler Flatbed Trailer';
    const currentCity = body.currentCity || 'Lahore';
    const isOpenToAnywhere = body.isOpenToAnywhere === true || body.preferredDestination === 'Open to Go Anywhere in Pakistan 🇵🇰';
    const preferredDestination = isOpenToAnywhere ? 'Open to Go Anywhere in Pakistan 🇵🇰' : (body.preferredDestination || 'Karachi');
    const capacityTons = body.availableCapacityTons || 25;
    const departureTime = body.departureTime || 'Immediate / Ready Now';
    const currentLocation = body.currentLocation || `${currentCity} Terminal`;

    db.prepare(`
      INSERT INTO driver_availabilities (
        id, driver_name, driver_phone, driver_rating, completed_trips,
        truck_number, truck_type, current_city, current_location,
        preferred_destination, available_capacity_tons, departure_time, status, posted_ago
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, driverName, driverPhone, 4.9, 128,
      truckNumber, truckType, currentCity, currentLocation,
      preferredDestination, capacityTons, departureTime, 'available', 'Just now'
    );

    return NextResponse.json({
      success: true,
      id,
      broadcast: {
        id,
        driverName,
        driverPhone,
        driverRating: 4.9,
        completedTrips: 128,
        truckNumber,
        truckType,
        currentCity,
        currentLocation,
        preferredDestination,
        availableCapacityTons: capacityTons,
        departureTime,
        status: 'available',
        postedAgo: 'Just now',
      },
      message: 'Driver availability broadcasted successfully!',
    });
  } catch (error: any) {
    console.error('Error broadcasting driver availability:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
