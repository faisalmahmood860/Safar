import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const defaultUsers = [
  { id: 'usr-driver-1', role: 'driver', name: 'Verified Driver', name_ur: 'تصدیق شدہ ڈرائیور', email: 'driver@safarload.pk', phone: '03001234567', password: 'Driver@123', details: JSON.stringify({ cnicOrNtn: '35202-1234567-1' }) },
  { id: 'usr-shipper-1', role: 'shipper', name: 'Noor Textile Mills Ltd', name_ur: 'نور ٹیکسٹائل ملز', email: 'shipper@safarload.pk', phone: '03111234567', password: 'Shipper@123', details: JSON.stringify({ cnicOrNtn: '1234567-8' }) },
  { id: 'usr-fleet-1', role: 'fleet', name: 'Al-Farooq Fleet Logistics', name_ur: 'ال فاروق فلیٹ', email: 'fleet@safarload.pk', phone: '03221234567', password: 'Fleet@123', details: JSON.stringify({ cnicOrNtn: '2345678-9' }) },
  { id: 'usr-support-1', role: 'support', name: 'Ayesha Khan (Support Staff)', name_ur: 'عائشہ خان', email: 'support@safarload.pk', phone: '03331234567', password: 'Support@123', details: JSON.stringify({ cnicOrNtn: '35202-3333333-3' }) },
  { id: 'usr-finance-1', role: 'finance', name: 'Kamran Ali (Finance Desk)', name_ur: 'کامران علی', email: 'finance@safarload.pk', phone: '03441234567', password: 'Finance@123', details: JSON.stringify({ cnicOrNtn: '35202-4444444-4' }) },
  { id: 'usr-admin-1', role: 'admin', name: 'Admin', name_ur: 'سپر ایڈمن', email: 'admin@safarload.pk', phone: '03551234567', password: 'SafarLoad@2026#Admin', details: JSON.stringify({ cnicOrNtn: '35202-5555555-5' }) },
];

function ensureSeeded() {
  try {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (!countRow || countRow.count === 0) {
      const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO users (id, role, name, name_ur, email, phone, password, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of defaultUsers) {
        insertStmt.run(u.id, u.role, u.name, u.name_ur, u.email, u.phone, u.password, u.details);
      }
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

export async function GET() {
  try {
    ensureSeeded();
    const rows = db.prepare('SELECT * FROM users ORDER BY created_at ASC').all();
    return NextResponse.json({ success: true, users: rows });
  } catch (error: any) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    ensureSeeded();
    const body = await request.json();
    const { role, name, name_ur, email, phone, password, details } = body;

    if (!role || !name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Missing required user fields' }, { status: 400 });
    }

    const id = body.id || `usr-${role}-${Date.now()}`;
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || '');

    const insertStmt = db.prepare(`
      INSERT INTO users (id, role, name, name_ur, email, phone, password, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(id, role, name, name_ur || null, email.toLowerCase().trim(), phone || '', password, detailsStr);

    const createdUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return NextResponse.json({ success: true, user: createdUser });
  } catch (error: any) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    ensureSeeded();
    const body = await request.json();
    const { id, role, name, name_ur, email, phone, password, details } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required for update' }, { status: 400 });
    }

    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || '');

    const updateStmt = db.prepare(`
      UPDATE users
      SET role = ?, name = ?, name_ur = ?, email = ?, phone = ?, password = ?, details = ?
      WHERE id = ?
    `);

    updateStmt.run(role, name, name_ur || null, email.toLowerCase().trim(), phone || '', password, detailsStr, id);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('PUT /api/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    ensureSeeded();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
