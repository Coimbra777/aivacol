import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { apiErrorMessage } from "../../lib/api";
import { ErrorBanner, Plate } from "../../components/ui";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("aivacol@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Credenciais inválidas."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <section className="login-side">
        <div className="kicker">Aivacol · Fleet Console</div>
        <div>
          <h1>Sua frota sob controle.</h1>
          <p className="lede">
            Cadastro, auditoria e telemetria de veículos em escala — marcas, modelos e
            placas em um só painel.
          </p>
          <div className="login-plate-demo">
            <Plate>ABC1D23</Plate>
            <Plate>RIO2A18</Plate>
            <Plate>BRA0S17</Plate>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#7d8b95" }}>
          desafio-info · API + console
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-card">
          <h2>Entrar</h2>
          <p className="sub">Acesse o console com suas credenciais.</p>
          {error && <ErrorBanner message={error} />}
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                autoComplete="username"
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
              disabled={loading}
            >
              {loading ? "Entrando…" : "Entrar no console"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
