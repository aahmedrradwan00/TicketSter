import prisma from '@/app/lib/database';
import { SignupUserDto } from '@/app/lib/dtos';
import { signupScheam } from '@/app/lib/validationSchemas';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSession } from '@/app/lib/session';

export async function POST(req: NextRequest) {
    const body = (await req.json()) as SignupUserDto;

    const validation = signupScheam.safeParse(body);

    if (!validation.success) return NextResponse.json({ message: validation.error.flatten().fieldErrors }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (user) return NextResponse.json({ message: 'This user is already registered' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(body.password, 12);

    const newUser = await prisma.user.create({
        data: {
            name: body.name,
            email: body.email,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            role: true,
        },
    });

    await createSession({ id: newUser.id, name: newUser.name, role: newUser.role });

    return NextResponse.json({ newUser, message: 'Registered successfully' }, { status: 201 });
}