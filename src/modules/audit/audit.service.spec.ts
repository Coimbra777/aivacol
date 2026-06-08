import { NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ObjectId } from "mongodb";
import { AuditService } from "./audit.service";

describe("AuditService", () => {
  let auditService: AuditService;
  let configService: jest.Mocked<Pick<ConfigService, "get">>;
  let collection: {
    find: jest.Mock;
    findOne: jest.Mock;
  };
  let findCursor: {
    sort: jest.Mock;
    limit: jest.Mock;
    toArray: jest.Mock;
  };

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    };

    findCursor = {
      sort: jest.fn(),
      limit: jest.fn(),
      toArray: jest.fn(),
    };

    findCursor.sort.mockReturnValue(findCursor);
    findCursor.limit.mockReturnValue(findCursor);

    collection = {
      find: jest.fn().mockReturnValue(findCursor),
      findOne: jest.fn(),
    };

    auditService = new AuditService(configService as unknown as ConfigService);
    (auditService as unknown as { collection: typeof collection }).collection =
      collection;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("findAll returns up to 50 logs ordered by createdAt desc", async () => {
    const logs = [createAuditLog("vehicle.updated"), createAuditLog("vehicle.created")];

    findCursor.toArray.mockResolvedValue(logs);

    const result = await auditService.findAll();

    expect(collection.find).toHaveBeenCalledWith({});
    expect(findCursor.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(findCursor.limit).toHaveBeenCalledWith(50);
    expect(result).toEqual([
      expect.objectContaining({
        id: logs[0]._id.toString(),
        event: "vehicle.updated",
      }),
      expect.objectContaining({
        id: logs[1]._id.toString(),
        event: "vehicle.created",
      }),
    ]);
  });

  it("findOne returns a log by id", async () => {
    const log = createAuditLog();

    collection.findOne.mockResolvedValue(log);

    const result = await auditService.findOne(log._id.toString());

    expect(collection.findOne).toHaveBeenCalledWith({
      _id: new ObjectId(log._id.toString()),
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: log._id.toString(),
        event: log.event,
        entity: log.entity,
      }),
    );
  });

  it("findOne throws NotFoundException when log does not exist", async () => {
    collection.findOne.mockResolvedValue(null);

    await expect(
      auditService.findOne(new ObjectId().toString()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function createAuditLog(event = "vehicle.created") {
  return {
    _id: new ObjectId(),
    event,
    entity: "vehicle",
    entityId: 1,
    userId: 1,
    payload: {
      licensePlate: "ABC1234",
    },
    createdAt: new Date(),
  };
}
