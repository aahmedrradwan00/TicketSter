import prisma from '@/app/lib/database';
import { StadiumDto } from '@/app/lib/dtos';
import { handelValidationErrors } from '@/app/lib/handelValidationErrors';
import { createStadiumSchema, updateStadiumSchema } from '@/app/lib/validationSchemas';
import { verifyAdmin } from '@/app/lib/verifyAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const stadiums = await prisma.stadium.findMany({
            include: { team: true, matches: true },
        });

        if (!stadiums || stadiums.length === 0) return NextResponse.json({ message: 'No stadiums found.' }, { status: 404 });

        return NextResponse.json({ stadiums, message: 'Stadiums retrieved successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error fetching stadiums:', error);
        return NextResponse.json({ message: 'An error occurred while fetching stadiums.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const response = await verifyAdmin();
    if (response) return response;

    const body = (await req.json()) as StadiumDto;
    const validation = createStadiumSchema.safeParse(body);

    if (!validation.success) {
        const errorMessage = handelValidationErrors(validation);
        return NextResponse.json({ message: errorMessage }, { status: 400 });
    }

    try {
        const existingStadium = await prisma.stadium.findFirst({ where: { name: body.name } });

        if (existingStadium) return NextResponse.json({ message: 'A stadium with this name already exists.' }, { status: 400 });

        const newStadium = await prisma.stadium.create({
            data: {
                name: body.name,
                location: body.location,
                capacity: body.capacity,
            },
        });

        return NextResponse.json({ newStadium, message: 'Stadium created successfully.' }, { status: 201 });
    } catch (error) {
        console.error('Error creating stadium:', error);
        return NextResponse.json({ message: 'An error occurred while creating the stadium.' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const response = await verifyAdmin();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'Stadium ID is required' }, { status: 400 });

    const body = (await req.json()) as StadiumDto;
    const validation = updateStadiumSchema.safeParse(body);

    if (!validation.success) {
        const errorMessage = handelValidationErrors(validation); 
        return NextResponse.json({ message: errorMessage }, { status: 400 });
    }

    try {
        const updatedStadium = await prisma.stadium.update({
            where: { id: Number(id) },
            data: {
                name: body.name,
                location: body.location,
                capacity: body.capacity,
            },
        });

        return NextResponse.json({ updatedStadium, message: 'Stadium updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error updating stadium:', error);
        return NextResponse.json({ message: 'An error occurred while updating the stadium.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const response = await verifyAdmin();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'Stadium ID is required' }, { status: 400 });

    try {
        await prisma.stadium.delete({
            where: { id: Number(id) },
        });
        return NextResponse.json({ message: 'Stadium deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting stadium:', error);
        return NextResponse.json({ message: 'An error occurred while deleting the stadium.' }, { status: 500 });
    }
}
