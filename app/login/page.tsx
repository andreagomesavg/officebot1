"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <style>{`
        .login-screen {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          color: #1a1a1a;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        .login-box {
          width: 100%;
          max-width: 320px;
          text-align: center;
          padding: 20px;
        }

        .brand {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: 0.15em;
          margin-bottom: 40px;
          text-transform: uppercase;
          line-height: 1;
        }

        .brand span {
          display: block;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.4em;
          margin-top: 10px;
          color: #888;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .login-input {
          width: 100%;
          padding: 12px 0;
          font-size: 16px;
          border: none;
          border-bottom: 1px solid #e0e0e0;
          background: transparent;
          outline: none;
          text-align: center;
          transition: border-color 0.3s ease;
        }

        .login-input:focus {
          border-bottom-color: #df30a4;
        }

        .login-input::placeholder {
          color: #ccc;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.1em;
        }

        .login-button {
          width: 100%;
          background: #1a1a1a;
          color: #fff;
          border: none;
          padding: 14px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .login-button:hover {
          background: #df30a4;
        }

        .login-button:disabled {
          background: #eee;
          color: #999;
          cursor: not-allowed;
        }

        .error-txt {
          font-size: 11px;
          color: #ff4d4f;
          margin-top: 15px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Pequeña animación de entrada */
        .login-box {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-box">
        <h1 className="brand">
          THE-ARE
          <span>OfficeBot</span>
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="password" 
              className="login-input"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Cargando...' : 'Entrar'}
          </button>

          {error && <p className="error-txt">Acceso denegado</p>}
        </form>
      </div>
    </div>
  );
}