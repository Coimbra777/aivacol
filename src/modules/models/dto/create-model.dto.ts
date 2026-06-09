import { Transform, Type } from "class-transformer";
import { IsDefined, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateModelDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Type(() => Number)
  @IsDefined({ message: "brandId is required" })
  @IsInt()
  @Min(1)
  brandId!: number;
}
