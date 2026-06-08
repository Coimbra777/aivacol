export type AuditEventName =
  | "vehicle.created"
  | "vehicle.updated"
  | "vehicle.deleted";

export type AuditEvent = {
  event: AuditEventName;
  entity: "vehicle";
  entityId: number;
  userId: number | null;
  payload: Record<string, unknown>;
  createdAt: Date;
};

export type AuditLogResponse = AuditEvent & {
  id: string;
};
