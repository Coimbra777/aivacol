import "dotenv/config";
import * as bcrypt from "bcrypt";
import { Like } from "typeorm";
import dataSource from "../data-source";
import { Brand } from "../../modules/brands/entities/brand.entity";
import { Model } from "../../modules/models/entities/model.entity";
import { User } from "../../modules/users/entities/user.entity";
import { Vehicle } from "../../modules/vehicles/entities/vehicle.entity";

const PERFORMANCE_BRAND_NAME = "Performance Brand";
const PERFORMANCE_MODEL_NAME = "Performance Model";
const USER_NICKNAME_PREFIX = "perf-user-";
const USER_EMAIL_PREFIX = "perf-email-";
const VEHICLE_PLATE_PREFIX = "PERF-PLATE-";
const VEHICLE_CHASSIS_PREFIX = "PERF-CHASSIS-";
const VEHICLE_RENAVAM_BASE = 80000000000;
const USER_BATCH_SIZE = 200;
const VEHICLE_BATCH_SIZE = 250;

function parseQuantity(value: string | undefined, label: string): number {
  const parsedValue = Number.parseInt(value ?? "", 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error(`Invalid ${label}. Use a non-negative integer.`);
  }

  return parsedValue;
}

async function getCreatedByUserId(): Promise<number> {
  const userRepository = dataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: {
      nickname: "aivacol",
    },
  });

  if (!user) {
    throw new Error('User "aivacol" not found. Run the initial seed first.');
  }

  return user.id;
}

async function ensurePerformanceBrand(createdBy: number): Promise<Brand> {
  const brandRepository = dataSource.getRepository(Brand);
  const existingBrand = await brandRepository.findOne({
    where: {
      name: PERFORMANCE_BRAND_NAME,
    },
  });

  if (existingBrand) {
    return existingBrand;
  }

  const brand = brandRepository.create({
    name: PERFORMANCE_BRAND_NAME,
    createdBy,
  });

  return brandRepository.save(brand);
}

async function ensurePerformanceModel(
  brandId: number,
  createdBy: number,
): Promise<Model> {
  const modelRepository = dataSource.getRepository(Model);
  const existingModel = await modelRepository.findOne({
    where: {
      name: PERFORMANCE_MODEL_NAME,
      brandId,
    },
  });

  if (existingModel) {
    return existingModel;
  }

  const model = modelRepository.create({
    name: PERFORMANCE_MODEL_NAME,
    brandId,
    createdBy,
  });

  return modelRepository.save(model);
}

async function seedPerformanceUsers(quantity: number): Promise<number> {
  if (quantity === 0) {
    return 0;
  }

  const userRepository = dataSource.getRepository(User);
  const existingUsers = await userRepository.count({
    where: {
      nickname: Like(`${USER_NICKNAME_PREFIX}%`),
    },
  });

  if (existingUsers >= quantity) {
    return 0;
  }

  const passwordHash = await bcrypt.hash("123456", 4);
  let createdUsers = 0;
  let batch: Array<Pick<User, "nickname" | "name" | "email" | "passwordHash">> =
    [];

  for (let index = existingUsers + 1; index <= quantity; index++) {
    batch.push({
      nickname: `${USER_NICKNAME_PREFIX}${index}`,
      name: `Performance User ${index}`,
      email: `${USER_EMAIL_PREFIX}${index}@example.com`,
      passwordHash,
    });

    if (batch.length === USER_BATCH_SIZE) {
      await userRepository.insert(batch);
      createdUsers += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    await userRepository.insert(batch);
    createdUsers += batch.length;
  }

  return createdUsers;
}

async function seedPerformanceVehicles(
  quantity: number,
  modelId: number,
  createdBy: number,
): Promise<number> {
  if (quantity === 0) {
    return 0;
  }

  const vehicleRepository = dataSource.getRepository(Vehicle);
  const existingVehicles = await vehicleRepository.count({
    where: {
      licensePlate: Like(`${VEHICLE_PLATE_PREFIX}%`),
    },
  });

  if (existingVehicles >= quantity) {
    return 0;
  }

  let createdVehicles = 0;
  let batch: Array<
    Pick<
      Vehicle,
      "licensePlate" | "chassis" | "renavam" | "year" | "modelId" | "createdBy"
    >
  > = [];

  for (let index = existingVehicles + 1; index <= quantity; index++) {
    batch.push({
      licensePlate: `${VEHICLE_PLATE_PREFIX}${index}`,
      chassis: `${VEHICLE_CHASSIS_PREFIX}${String(index).padStart(10, "0")}`,
      renavam: String(VEHICLE_RENAVAM_BASE + index),
      year: 2020 + ((index - 1) % 5),
      modelId,
      createdBy,
    });

    if (batch.length === VEHICLE_BATCH_SIZE) {
      await vehicleRepository.insert(batch);
      createdVehicles += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    await vehicleRepository.insert(batch);
    createdVehicles += batch.length;
  }

  return createdVehicles;
}

async function runPerformanceSeed(): Promise<void> {
  const usersQuantity = parseQuantity(process.argv[2], "users quantity");
  const vehiclesQuantity = parseQuantity(process.argv[3], "vehicles quantity");

  await dataSource.initialize();

  try {
    const createdBy = await getCreatedByUserId();
    const brand = await ensurePerformanceBrand(createdBy);
    const model = await ensurePerformanceModel(brand.id, createdBy);
    const createdUsers = await seedPerformanceUsers(usersQuantity);
    const createdVehicles = await seedPerformanceVehicles(
      vehiclesQuantity,
      model.id,
      createdBy,
    );

    process.stdout.write(
      [
        `Performance users created in this run: ${createdUsers}.`,
        `Performance vehicles created in this run: ${createdVehicles}.`,
        `Brand in use: ${brand.name}.`,
        `Model in use: ${model.name}.`,
      ].join("\n") + "\n",
    );
  } finally {
    await dataSource.destroy();
  }
}

void runPerformanceSeed();
