import { ConflictException, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let usersService: UsersService;
  let usersRepository: jest.Mocked<
    Pick<
      Repository<User>,
      "create" | "findAndCount" | "findOne" | "save" | "remove"
    >
  >;

  beforeEach(() => {
    usersRepository = {
      create: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    usersService = new UsersService(
      usersRepository as unknown as Repository<User>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // RF1.1
  it("hashes the password and never exposes passwordHash on create", async () => {
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockImplementation((data) => data as User);
    usersRepository.save.mockImplementation(async (user) => ({
      ...(user as User),
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await usersService.create({
      name: "João da Silva",
      email: "joao@example.com",
      password: "ChangeMe123!",
    });

    const savedUser = usersRepository.save.mock.calls[0][0] as User;
    expect(savedUser.passwordHash).not.toBe("ChangeMe123!");
    await expect(
      bcrypt.compare("ChangeMe123!", savedUser.passwordHash),
    ).resolves.toBe(true);
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).toMatchObject({ id: 1, email: "joao@example.com" });
  });

  // RF1.2
  it("throws ConflictException on create when email already exists", async () => {
    usersRepository.findOne.mockResolvedValue({ id: 9 } as User);

    await expect(
      usersService.create({
        name: "Maria",
        email: "maria@example.com",
        password: "ChangeMe123!",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // RF1.3
  it("throws ConflictException on create when nickname already exists", async () => {
    usersRepository.findOne.mockResolvedValueOnce({ id: 9 } as User);

    await expect(
      usersService.create({
        nickname: "maria",
        name: "Maria",
        email: "maria@example.com",
        password: "ChangeMe123!",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // RF1.4
  it("creates without nickname and does not check nickname uniqueness", async () => {
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockImplementation((data) => data as User);
    usersRepository.save.mockImplementation(async (user) => ({
      ...(user as User),
      id: 2,
    }));

    await usersService.create({
      name: "Sem Nick",
      email: "semnick@example.com",
      password: "ChangeMe123!",
    });

    // Só a checagem de email deve ter consultado o repositório.
    expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: "semnick@example.com" },
    });
  });

  // RF1.5
  it("returns a paginated envelope without passwordHash on findAll", async () => {
    const users = [buildUser({ id: 1 }), buildUser({ id: 2 })];
    usersRepository.findAndCount.mockResolvedValue([users, 2]);

    const result = await usersService.findAll(1, 20);

    expect(usersRepository.findAndCount).toHaveBeenCalledWith({
      order: { createdAt: "ASC", id: "ASC" },
      skip: 0,
      take: 20,
    });
    expect(result.meta).toMatchObject({ page: 1, limit: 20, total: 2 });
    expect(result.data).toHaveLength(2);
    result.data.forEach((user) => expect(user).not.toHaveProperty("passwordHash"));
  });

  // RF1.6
  it("returns a user on findOne and throws NotFoundException when missing", async () => {
    usersRepository.findOne.mockResolvedValueOnce(buildUser({ id: 5 }));
    const found = await usersService.findOne(5);
    expect(found).toMatchObject({ id: 5 });
    expect(found).not.toHaveProperty("passwordHash");

    usersRepository.findOne.mockResolvedValueOnce(null);
    await expect(usersService.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // RF1.7
  it("updates only the provided fields and re-hashes the password", async () => {
    const user = buildUser({ id: 3, name: "Old", passwordHash: "old-hash" });
    usersRepository.findOne.mockResolvedValueOnce(user);
    usersRepository.save.mockImplementation(async (u) => u as User);

    const result = await usersService.update(3, {
      name: "New Name",
      password: "NewPassw0rd!",
    });

    const saved = usersRepository.save.mock.calls[0][0] as User;
    expect(saved.name).toBe("New Name");
    expect(saved.passwordHash).not.toBe("old-hash");
    await expect(
      bcrypt.compare("NewPassw0rd!", saved.passwordHash),
    ).resolves.toBe(true);
    expect(result).not.toHaveProperty("passwordHash");
  });

  // RF1.7
  it("throws NotFoundException on update when the user does not exist", async () => {
    usersRepository.findOne.mockResolvedValueOnce(null);

    await expect(
      usersService.update(999, { name: "X" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // RF1.7
  it("throws ConflictException on update when the new email is taken", async () => {
    const user = buildUser({ id: 3, email: "current@example.com" });
    usersRepository.findOne
      .mockResolvedValueOnce(user) // findById
      .mockResolvedValueOnce({ id: 8 } as User); // ensureEmailAvailable

    await expect(
      usersService.update(3, { email: "taken@example.com" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // RF1.7
  it("does not check uniqueness when email is unchanged", async () => {
    const user = buildUser({ id: 3, email: "same@example.com" });
    usersRepository.findOne.mockResolvedValueOnce(user);
    usersRepository.save.mockImplementation(async (u) => u as User);

    await usersService.update(3, { email: "same@example.com" });

    // Apenas o findById inicial; nenhuma segunda consulta de unicidade.
    expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
  });

  // RF1.8
  it("removes a user and throws NotFoundException when missing", async () => {
    const user = buildUser({ id: 4 });
    usersRepository.findOne.mockResolvedValueOnce(user);
    usersRepository.remove.mockResolvedValue(user);

    await usersService.remove(4);
    expect(usersRepository.remove).toHaveBeenCalledWith(user);

    usersRepository.findOne.mockResolvedValueOnce(null);
    await expect(usersService.remove(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

function buildUser(overrides: Partial<User>): User {
  return {
    id: 1,
    nickname: "nick",
    name: "Name",
    email: "user@example.com",
    passwordHash: "hash",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
