"use client";
import { Persona } from '@/types';
import { useEffect, useState } from 'react';

export default function SorteoPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorteoActivo, setSorteoActivo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [almuerzoWinners, setAlmuerzoWinners] = useState<Persona[]>([]);
  const [limpiezaWinner, setLimpiezaWinner] = useState<Persona | null>(null);
  const [almuerzoPool, setAlmuerzoPool] = useState<Persona[]>([]);
  const [limpiezaPool, setLimpiezaPool] = useState<Persona[]>([]);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/personas', { cache: 'no-store' });
      const data = await res.json();
      setPersonas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error al cargar personas:", e);
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return 'Nunca';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const obtenerTurnoActual = () => {
    const lista = Array.isArray(personas) ? personas : [];
    const almuerzos = lista.filter(p => p.almuerzo === 'Le toca');
    const limpieza = lista.find(p => p.limpieza === 'Le toca') || null;
    return { almuerzos, limpieza };
  };
  
  const turnoActual = obtenerTurnoActual();

  const sortSorteo = (a: Persona, b: Persona, tipo: 'almuerzo' | 'limpieza') => {
    const vecesA = tipo === 'almuerzo' ? a.veces_almuerzo : a.veces_limpieza;
    const vecesB = tipo === 'almuerzo' ? b.veces_almuerzo : b.veces_limpieza;
    if (vecesA !== vecesB) return vecesA - vecesB;
    const dateA = tipo === 'almuerzo' ? a.ultimo_almuerzo : a.ultima_limpieza;
    const dateB = tipo === 'almuerzo' ? b.ultimo_almuerzo : b.ultima_limpieza;
    const timeA = dateA ? new Date(dateA).getTime() : 0; 
    const timeB = dateB ? new Date(dateB).getTime() : 0;
    return timeA - timeB || a.nombre.localeCompare(b.nombre); 
  };

  const iniciarSorteo = () => {
    const eligibleAlmuerzo = personas.filter(p => p.almuerzo !== 'No puede').sort((a, b) => sortSorteo(a, b, 'almuerzo'));
    const eligibleLimpieza = personas.filter(p => p.limpieza !== 'No puede').sort((a, b) => sortSorteo(a, b, 'limpieza'));
    setAlmuerzoWinners(eligibleAlmuerzo.slice(0, 2));
    setLimpiezaWinner(eligibleLimpieza[0] || null);
    setAlmuerzoPool(eligibleAlmuerzo.slice(2));
    setLimpiezaPool(eligibleLimpieza.slice(1));
    setSorteoActivo(true);
  };

  const confirmarResultados = async () => {
    setGuardando(true);
    const ahora = new Date().toISOString();
    try {
      const requests = [];
      for (const p of personas) {
        let changed = false;
        let patchData: any = { id: p.id };
        if (almuerzoWinners.some(w => w.id === p.id)) {
          patchData.almuerzo = 'Le toca';
          patchData.veces_almuerzo = p.veces_almuerzo + 1;
          patchData.ultimo_almuerzo = ahora;
          changed = true;
        } else if (p.almuerzo === 'Le toca') {
          patchData.almuerzo = null;
          changed = true;
        }
        if (limpiezaWinner?.id === p.id) {
          patchData.limpieza = 'Le toca';
          patchData.veces_limpieza = p.veces_limpieza + 1;
          patchData.ultima_limpieza = ahora;
          changed = true;
        } else if (p.limpieza === 'Le toca') {
          patchData.limpieza = null;
          changed = true;
        }
        if (changed) {
          requests.push(fetch('/api/personas', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchData)
          }));
        }
      }
      await Promise.all(requests);
      await fetchPersonas();
      setSorteoActivo(false);
    } catch (e) { alert("Error al guardar."); } finally { setGuardando(false); }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, system-ui, sans-serif; background: #f8f9fa; color: #1a1a1a; }
        .page { padding: 40px 24px; max-width: 950px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .btn-large { background: #df30a4; color: #fff; border: none; border-radius: 8px; padding: 16px 32px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-large:hover { background: #b01e7a; transform: translateY(-1px); }
        .cards-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 24px; }
        @media (min-width: 768px) { .cards-grid { grid-template-columns: 1fr 1fr; } }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); position: relative; overflow: hidden; }
        .winner-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fafafa; border-radius: 8px; margin-top: 8px; }
        .name-info b { display: block; font-size: 15px; }
        .name-info span { font-size: 11px; color: #888; }
        .badge { position: absolute; top: 12px; right: -30px; background: #df30a4; color: white; font-size: 10px; font-weight: 800; padding: 4px 35px; transform: rotate(45deg); text-transform: uppercase; letter-spacing: 1px; }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{fontSize: 32, fontWeight: 800}}>OfficeBot</h1>
          <p style={{color: '#666'}}>Turnos de equipo</p>
        </div>

        {loading ? (
            <div style={{textAlign: 'center', padding: '50px', color: '#888'}}>Cargando datos...</div>
        ) : !sorteoActivo ? (
          <>
            <div className="cards-grid">
              <div className="card">
                <div style={{fontWeight: 700, marginBottom: 12}}>🥪 Almuerzo Vigente</div>
                {turnoActual.almuerzos.length === 0 ? <p>Sin sorteo.</p> :
                  turnoActual.almuerzos.map(p => (
                    <div className="winner-row" key={p.id}>
                      <div className="name-info">
                        <b>{p.nombre}</b>
                        <span>Último: {formatFecha(p.ultimo_almuerzo)}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
              <div className="card">
                <div style={{fontWeight: 700, marginBottom: 12}}>🧹 Limpieza Vigente</div>
                {turnoActual.limpieza ? (
                  <div className="winner-row">
                    <div className="name-info">
                      <b>{turnoActual.limpieza.nombre}</b>
                      <span>Último: {formatFecha(turnoActual.limpieza.ultima_limpieza)}</span>
                    </div>
                  </div>
                ) : <p>Sin sorteo.</p>}
              </div>
            </div>
            <div style={{textAlign:'center', marginTop:40}}>
              <button className="btn-large" onClick={iniciarSorteo}>🎲 Nuevo Sorteo</button>
            </div>
          </>
        ) : (
          <>
            <div className="cards-grid">
              <div className="card" style={{borderColor: '#df30a4'}}>
                <div className="badge">Borrador</div>
                <div style={{fontWeight: 700, marginBottom: 12, color:'#df30a4'}}>🥪 Propuesta Almuerzo</div>
                {almuerzoWinners.map((winner, index) => (
                  <div className="winner-row" key={winner.id}>
                    <div className="name-info">
                      <b>{winner.nombre}</b>
                      <span>Último: {formatFecha(winner.ultimo_almuerzo)} ({winner.veces_almuerzo} veces)</span>
                    </div>
                    <button style={{background:'none', border:'none', cursor:'pointer', fontSize: 18}} onClick={() => {
                      const w = [...almuerzoWinners]; const p = [...almuerzoPool];
                      if (p.length > 0) {
                        const oldWinner = w[index];
                        w[index] = p.shift()!;
                        p.push(oldWinner);
                        setAlmuerzoWinners(w); setAlmuerzoPool(p);
                      }
                    }}>🎲</button>
                  </div>
                ))}
              </div>

              <div className="card" style={{borderColor: '#df30a4'}}>
                <div className="badge">Borrador</div>
                <div style={{fontWeight: 700, marginBottom: 12, color:'#df30a4'}}>🧹 Propuesta Limpieza</div>
                {limpiezaWinner && (
                  <div className="winner-row">
                    <div className="name-info">
                      <b>{limpiezaWinner.nombre}</b>
                      <span>Último: {formatFecha(limpiezaWinner.ultima_limpieza)} ({limpiezaWinner.veces_limpieza} veces)</span>
                    </div>
                    <button style={{background:'none', border:'none', cursor:'pointer', fontSize: 18}} onClick={() => {
                      const p = [...limpiezaPool];
                      if (p.length > 0) {
                        const oldWinner = limpiezaWinner;
                        setLimpiezaWinner(p.shift()!);
                        p.push(oldWinner);
                        setLimpiezaPool(p);
                      }
                    }}>🎲</button>
                  </div>
                )}
              </div>
            </div>
            {/* BLOQUE DE CONTEXTO: LISTA DE SUPLENTES */}
              <div style={{ marginTop: 24, padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #eee' }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#df30a4' }}>📊 Próximos en lista (Suplentes):</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: 5 }}>Sig. Almuerzo</p>
                    {almuerzoPool.slice(0, 3).map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', padding: '4px 0', borderBottom: '1px solid #f9f9f9' }}>
                        <span>{p.nombre}</span>
                        <span>{p.veces_almuerzo} veces</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: 5 }}>Sig. Limpieza</p>
                    {limpiezaPool.slice(0, 3).map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', padding: '4px 0', borderBottom: '1px solid #f9f9f9' }}>
                        <span>{p.nombre}</span>
                        <span>{p.veces_limpieza} veces</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            <div style={{textAlign:'center', marginTop:40}}>
              <button className="btn-large" onClick={confirmarResultados} disabled={guardando}>✓ Guardar Nuevos Turnos</button>
              <br />
              <button onClick={() => setSorteoActivo(false)} style={{marginTop:20, background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:14, textDecoration:'underline'}}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}