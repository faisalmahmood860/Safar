import { NextResponse } from 'next/server';
import { db, statements } from '@/lib/db';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM commission_invoices WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND payment_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY due_date ASC';

    const invoices = db.prepare(sql).all(...params) as any[];

    // Calculate aggregate revenue metrics
    const statsSql = `
      SELECT 
        SUM(gross_freight_amount) as totalGrossFreight,
        SUM(commission_amount) as totalCommission,
        SUM(CASE WHEN payment_status = 'paid' THEN commission_amount ELSE 0 END) as collectedCommission,
        SUM(CASE WHEN payment_status = 'pending' THEN commission_amount ELSE 0 END) as pendingCommission,
        SUM(CASE WHEN payment_status = 'overdue' THEN commission_amount ELSE 0 END) as overdueCommission,
        COUNT(*) as totalInvoices
      FROM commission_invoices
    `;
    const summary = db.prepare(statsSql).get() as any;

    const formattedInvoices = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      entityName: inv.entity_name,
      entityType: inv.entity_type,
      loadId: inv.load_id,
      route: inv.route,
      grossFreightAmount: inv.gross_freight_amount,
      commissionRatePercent: inv.commission_rate_percent,
      commissionAmount: inv.commission_amount,
      paymentStatus: inv.payment_status,
      dueDate: inv.due_date,
      paidDate: inv.paid_date,
      paymentMethod: inv.payment_method,
    }));

    return NextResponse.json({
      success: true,
      summary,
      invoices: formattedInvoices,
    });
  } catch (error: any) {
    console.error('Error fetching finance data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
