import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuditController } from "./audit.controller";
import { AuditConsumer } from "./audit.consumer";
import { AuditService } from "./audit.service";

@Module({
  imports: [ConfigModule],
  controllers: [AuditController],
  providers: [AuditService, AuditConsumer],
})
export class AuditModule {}
