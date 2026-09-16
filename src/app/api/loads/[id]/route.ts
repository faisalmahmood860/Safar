import { NextResponse } from 'next/server';
import { db, statements } from '@/lib/db';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const load = statements.getLoadById.get(id) as any;

    if (!load) {
      return NextResponse.json({ success: false, error: 'Load not found' }, { status: 404 });
    }

    const bids = statements.getBidsForLoad.all(id) as any[];

    let specialRequirements: string[] = [];
    try {
      if (load.special_requirements) {
        specialRequirements = JSON.parse(load.special_requirements);
      }
    } catch {
      specialRequirements = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        ...load,
        specialRequirements,
        bids,
      },
    });
  } catch (error: any) {
    console.error('Error fetching load by id:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status) {
      statements.updateLoadStatus.run(body.status, id);
    }

    return NextResponse.json({ success: true, message: 'Load updated successfully' });
  } catch (error: any) {
    console.error('Error updating load:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    statements.deleteLoad.run(id);
    return NextResponse.json({ success: true, message: 'Load deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting load:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
