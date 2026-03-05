import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 1. Elegir 2 para Almuerzo (los que menos veces llevan y hace más tiempo)
    const [almuerzo] = await pool.query(
      'SELECT id, nombre FROM personas ORDER BY veces_almuerzo ASC, ultimo_almuerzo ASC LIMIT 2'
    ) as any[];

    // 2. Elegir 1 para Limpieza
    const [limpieza] = await pool.query(
      'SELECT id, nombre FROM personas ORDER BY veces_limpieza ASC, ultima_limpieza ASC LIMIT 1'
    ) as any[];

    const hoy = new Date();

    // 3. Actualizar registros en la DB
    for (const p of almuerzo) {
      await pool.query(
        'UPDATE personas SET veces_almuerzo = veces_almuerzo + 1, ultimo_almuerzo = ? WHERE id = ?',
        [hoy, p.id]
      );
    }

    await pool.query(
      'UPDATE personas SET veces_limpieza = veces_limpieza + 1, ultima_limpieza = ? WHERE id = ?',
      [hoy, limpieza[0].id]
    );

    return NextResponse.json({ almuerzo, limpieza: limpieza[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}