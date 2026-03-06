import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';



export async function GET() {
  try {
    // Traemos todo de la tabla personas
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM personas');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error en DB:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const setClauses = [];
    const values = [];

    // Recorre dinámicamente lo que le enviamos y construye la consulta SQL
    for (const [key, value] of Object.entries(fields)) {
      setClauses.push(`${key} = ?`);
      // Si enviamos una fecha, la ajusta a formato MySQL
      if ((key === 'ultimo_almuerzo' || key === 'ultima_limpieza') && value) {
        values.push(new Date(value as string).toISOString().slice(0, 19).replace('T', ' '));
      } else {
        values.push(value);
      }
    }

    if (setClauses.length === 0) return NextResponse.json({ message: 'Nada que actualizar' });

    values.push(id);
    const query = `UPDATE personas SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    return NextResponse.json({ message: 'Usuario actualizado' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre } = await request.json();
    // Insertamos solo el nombre, dejando que la DB use los defaults para el resto
    await pool.query('INSERT INTO personas (nombre) VALUES (?)', [nombre]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// BORRAR PERSONA (Usando el ID de la URL)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await pool.query('DELETE FROM personas WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Persona eliminada' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}