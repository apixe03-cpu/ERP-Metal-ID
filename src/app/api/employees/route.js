import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching employees' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, pin, role } = await request.json();
    
    // El PIN normalmente se encriptaría, pero como es un sistema interno de agilidad de taller, 
    // lo guardamos y validamos directo por ahora, según lo requerido.
    const newEmployee = await prisma.employee.create({
      data: {
        name: name.trim(),
        pin: pin.trim(),
        role: role || 'OPERATOR'
      }
    });
    
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un empleado con este nombre.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error creating employee' }, { status: 500 });
  }
}
