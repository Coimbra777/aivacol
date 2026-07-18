import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, apiErrorMessage } from "../../lib/api";
import { Modal } from "../../components/Modal";
import { Pagination } from "../../components/Pagination";
import { EmptyState, ErrorBanner, LoadingState, Plate, Tag, formatDate } from "../../components/ui";
import type { AuditLog, Paginated } from "../../types/api";

const EVENT_TONE: Record<string, "teal" | "amber" | "red"> = {
  "vehicle.created": "teal",
  "vehicle.updated": "amber",
  "vehicle.deleted": "red",
};

function eventLabel(event: string): string {
  return { "vehicle.created": "Criado", "vehicle.updated": "Atualizado", "vehicle.deleted": "Excluído" }[event] ?? event;
}

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const query = useQuery({
    queryKey: ["audit", "list", page, limit],
    queryFn: async () => {
      const { data } = await api.get<Paginated<AuditLog>>("/audit", {
        params: { page, limit },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Trilha</div>
          <h1>Auditoria</h1>
          <p>Eventos de negócio dos veículos, persistidos no MongoDB via RabbitMQ.</p>
        </div>
      </div>

      {query.isError && <ErrorBanner message={apiErrorMessage(query.error)} />}

      {query.isLoading ? (
        <LoadingState />
      ) : query.data && query.data.data.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Veículo</th>
                  <th>Placa</th>
                  <th>Usuário</th>
                  <th>Data</th>
                  <th style={{ textAlign: "right" }}>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {query.data.data.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <Tag tone={EVENT_TONE[log.event]}>{eventLabel(log.event)}</Tag>
                    </td>
                    <td className="cell-id">#{log.entityId}</td>
                    <td>
                      {typeof log.payload.licensePlate === "string" ? (
                        <Plate>{log.payload.licensePlate as string}</Plate>
                      ) : (
                        <span style={{ color: "var(--muted-soft)" }}>—</span>
                      )}
                    </td>
                    <td className="cell-id">{log.userId ? `#${log.userId}` : "—"}</td>
                    <td>{formatDate(log.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-icon" onClick={() => setSelected(log)}>
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            meta={query.data.meta}
            onPage={setPage}
            onLimit={(next) => {
              setLimit(next);
              setPage(1);
            }}
          />
        </>
      ) : (
        <div className="table-wrap">
          <EmptyState
            title="Nenhum evento ainda"
            hint="Crie, edite ou exclua um veículo para gerar auditoria."
          />
        </div>
      )}

      {selected && (
        <Modal title={`Evento ${eventLabel(selected.event)}`} onClose={() => setSelected(null)}>
          <div style={{ display: "grid", gap: 10 }}>
            <Row label="Evento">
              <Tag tone={EVENT_TONE[selected.event]}>{selected.event}</Tag>
            </Row>
            <Row label="Veículo">#{selected.entityId}</Row>
            <Row label="Usuário">{selected.userId ? `#${selected.userId}` : "—"}</Row>
            <Row label="Data">{formatDate(selected.createdAt)}</Row>
            <Row label="Payload">
              <pre
                className="mono"
                style={{
                  background: "#0e1c28",
                  color: "#dbe6ee",
                  padding: 14,
                  borderRadius: 8,
                  overflow: "auto",
                  fontSize: 12.5,
                  margin: 0,
                }}
              >
                {JSON.stringify(selected.payload, null, 2)}
              </pre>
            </Row>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, alignItems: "start" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", paddingTop: 3 }}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}
