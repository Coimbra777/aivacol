import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuditController } from "./audit.controller";
import { AuditConsumer } from "./audit.consumer";
import { AuditPublisherService } from "./audit-publisher.service";
import { AuditService } from "./audit.service";

@Module({
  imports: [ConfigModule],
  controllers: [AuditController],
  providers: [AuditService, AuditConsumer, AuditPublisherService],
  exports: [AuditPublisherService],
})
export class AuditModule {}
