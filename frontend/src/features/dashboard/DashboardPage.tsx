import { useQueries } from "@tanstack/react-query";
import { brandsApi, modelsApi, usersApi, vehiclesApi } from "../resources";
import { formatNumber } from "../../components/ui";
import type { ListParams } from "../../lib/resource";

const CARDS = [
  { key: "vehicles", label: "Veículos", hint: "Frota total", api: vehiclesApi },
  { key: "models", label: "Modelos", hint: "Catálogo", api: modelsApi },
  { key: "brands", label: "Marcas", hint: "Fabricantes", api: brandsApi },
  { key: "users", label: "Usuários", hint: "Com acesso", api: usersApi },
] as const;

const ONE: ListParams = { page: 1, limit: 1 };

export function DashboardPage() {
  const results = useQueries({
    queries: CARDS.map((card) => ({
      queryKey: [card.key, "total"],
      queryFn: () => card.api.list(ONE),
    })),
  });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Visão geral</div>
          <h1>Painel da frota</h1>
          <p>Totais atuais por recurso, lidos direto do contrato paginado da API.</p>
        </div>
      </div>

      <div className="stat-grid">
        {CARDS.map((card, index) => {
          const result = results[index];
          const total = result.data?.meta.total;
          return (
            <div className="stat" key={card.key}>
              <div className="label">{card.label}</div>
              <div className="value">
                {result.isLoading ? "…" : result.isError ? "—" : formatNumber(total ?? 0)}
              </div>
              <div className="hint">{card.hint}</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 16, marginBottom: 8 }}>Cadeia de cadastro</h3>
        <p style={{ color: "var(--muted)", margin: 0, maxWidth: "68ch" }}>
          A frota segue a hierarquia <b>Marca → Modelo → Veículo</b>. Cadastre uma marca,
          depois um modelo vinculado a ela e então os veículos. Toda alteração em veículos é
          auditada de forma assíncrona e aparece em <b>Auditoria</b>.
        </p>
      </div>
    </div>
  );
}
