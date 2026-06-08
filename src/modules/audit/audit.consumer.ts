import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Channel, ChannelModel, ConsumeMessage, connect } from "amqplib";
import { AuditEvent } from "./audit-event.type";
import { AuditService } from "./audit.service";

@Injectable()
export class AuditConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditConsumer.name);
  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async onModuleInit(): Promise<void> {
    const rabbitmqUrl = this.configService.get<string>("RABBITMQ_URL");
    const queueName = this.configService.get<string>("RABBITMQ_AUDIT_QUEUE");

    if (!rabbitmqUrl || !queueName) {
      this.logger.warn(
        "RabbitMQ is not configured. Audit consumer will not start.",
      );
      return;
    }

    try {
      this.connection = await connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.consume(queueName, (message) => {
        if (!message) {
          return;
        }

        void this.handleMessage(message);
      });
    } catch (error) {
      const message =
        error instanceof Error ? (error.stack ?? error.message) : String(error);
      this.logger.error("Failed to start audit consumer", message);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.channel) {
      await this.channel.close().catch(() => undefined);
    }

    if (this.connection) {
      await this.connection.close().catch(() => undefined);
    }
  }

  private async handleMessage(message: ConsumeMessage): Promise<void> {
    try {
      const parsedMessage = JSON.parse(message.content.toString("utf-8")) as {
        event?: AuditEvent["event"];
        entity?: AuditEvent["entity"];
        entityId?: number;
        userId?: number | null;
        payload?: Record<string, unknown>;
        createdAt?: string | Date;
      };

      if (
        !parsedMessage.event ||
        parsedMessage.entity !== "vehicle" ||
        typeof parsedMessage.entityId !== "number"
      ) {
        this.logger.warn(
          "Invalid audit event received. Message will be ignored.",
        );
        return;
      }

      await this.auditService.saveLog({
        event: parsedMessage.event,
        entity: "vehicle",
        entityId: parsedMessage.entityId,
        userId:
          typeof parsedMessage.userId === "number"
            ? parsedMessage.userId
            : null,
        payload:
          parsedMessage.payload && typeof parsedMessage.payload === "object"
            ? parsedMessage.payload
            : {},
        createdAt: parsedMessage.createdAt
          ? new Date(parsedMessage.createdAt)
          : new Date(),
      });
    } catch (error) {
      const messageText =
        error instanceof Error ? (error.stack ?? error.message) : String(error);
      this.logger.error("Failed to process audit event", messageText);
    } finally {
      this.channel?.ack(message);
    }
  }
}
