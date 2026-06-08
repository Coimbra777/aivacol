import { AuditController } from "./audit.controller";
import { AuditService } from "./audit.service";

describe("AuditController", () => {
  let auditController: AuditController;
  let auditService: jest.Mocked<Pick<AuditService, "findAll" | "findOne">>;

  beforeEach(() => {
    auditService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    auditController = new AuditController(auditService as unknown as AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls findAll on AuditService", async () => {
    const logs = [{ id: "507f1f77bcf86cd799439011", event: "vehicle.created" }];

    auditService.findAll.mockResolvedValue(logs as never);

    const result = await auditController.findAll();

    expect(auditService.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(logs);
  });

  it("calls findOne on AuditService", async () => {
    const log = { id: "507f1f77bcf86cd799439011", event: "vehicle.created" };

    auditService.findOne.mockResolvedValue(log as never);

    const result = await auditController.findOne(log.id);

    expect(auditService.findOne).toHaveBeenCalledWith(log.id);
    expect(result).toEqual(log);
  });
});
