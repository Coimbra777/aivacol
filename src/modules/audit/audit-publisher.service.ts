import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Channel, ChannelModel, connect } from "amqplib";
import { AuditEvent, AuditEventName } from "./audit-event.type";

@Injectable()
export class AuditPublisherService {
  private readonly logger = new Logger(AuditPublisherService.name);

  constructor(private readonly configService: ConfigService) {}

  async publishVehicleEvent(
    event: AuditEventName,
    entityId: number,
    userId: number | null,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const rabbitmqUrl = this.configService.get<string>("RABBITMQ_URL");
    const queueName = this.configService.get<string>("RABBITMQ_AUDIT_QUEUE");

    if (!rabbitmqUrl || !queueName) {
      this.logger.warn(
        "RabbitMQ is not configured. Skipping audit event publish.",
      );
      return;
    }

    let connection: ChannelModel | undefined;
    let channel: Channel | undefined;

    try {
      connection = await connect(rabbitmqUrl);
      channel = await connection.createChannel();

      await channel.assertQueue(queueName, { durable: true });

      const auditEvent: AuditEvent = {
        event,
        entity: "vehicle",
        entityId,
        userId,
        payload,
        createdAt: new Date(),
      };

      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(auditEvent)), {
        persistent: true,
        contentType: "application/json",
      });
    } catch (error) {
      const message =
        error instanceof Error ? (error.stack ?? error.message) : String(error);
      this.logger.error("Failed to publish audit event to RabbitMQ", message);
    } finally {
      if (channel) {
        await channel.close().catch(() => undefined);
      }

      if (connection) {
        await connection.close().catch(() => undefined);
      }
    }
  }
}
