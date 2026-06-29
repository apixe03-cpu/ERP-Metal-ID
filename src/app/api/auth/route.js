import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";


export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // Contraseña maestra: 'Metal2026' por defecto
    const MASTER_PASSWORD = process.env.MASTER_PASSWORD || "Metal2026";
    const OPERATOR_PASSWORD = process.env.OPERATOR_PASSWORD || "Laser2026";

    let role = null;
    if (password === MASTER_PASSWORD) role = 'admin';
    else if (password === OPERATOR_PASSWORD) role = 'operator';

    if (role) {
      // Si la contraseña es correcta, generamos la cookie de sesión con el rol
      const response = NextResponse.json({ success: true, role });
      
      response.cookies.set({
        name: 'metal_session',
        value: role,
        httpOnly: true, // Impide que la cookie sea leída por JavaScript (más seguro)
        secure: false, // Debe ser false porque se accede por HTTP (no HTTPS)
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // Persiste por 1 año
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
