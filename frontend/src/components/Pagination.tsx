import type { PaginationMeta } from "../types/api";
import { formatNumber } from "./ui";

const LIMIT_OPTIONS = [10, 20, 50, 100];

export function Pagination({
  meta,
  onPage,
  onLimit,
}: {
  meta: PaginationMeta;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
}) {
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="pager">
      <div className="info">
        <b>{formatNumber(from)}</b>–<b>{formatNumber(to)}</b> de{" "}
        <b>{formatNumber(meta.total)}</b>
      </div>
      <div className="controls">
        <select
          value={meta.limit}
          onChange={(event) => onLimit(Number(event.target.value))}
          aria-label="Itens por página"
        >
          {LIMIT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} / página
            </option>
          ))}
        </select>
        <button
          className="btn-icon"
          onClick={() => onPage(meta.page - 1)}
          disabled={!meta.hasPreviousPage}
        >
          ← Anterior
        </button>
        <span className="page-now">
          {meta.page} / {Math.max(meta.totalPages, 1)}
        </span>
        <button
          className="btn-icon"
          onClick={() => onPage(meta.page + 1)}
          disabled={!meta.hasNextPage}
        >
          Próxima →
        </button>
      </div>
    </div>
  );
}
