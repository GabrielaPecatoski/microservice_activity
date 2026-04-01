import { ApiProperty } from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import type { User } from "@users/domain/models/user.entity";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "user@schoolcontrol.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "123456", minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    required: false,
    format: "uuid",
    nullable: true,
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  teacherId?: string;

  @ApiProperty({ enum: Permission, isArray: true })
  @IsNotEmpty()
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];
}

export class UpdateUserDto {
  @ApiProperty({ required: false, example: "user@schoolcontrol.com" })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: "123456", minLength: 6 })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    required: false,
    format: "uuid",
    nullable: true,
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  teacherId?: string;

  @ApiProperty({ required: false, enum: Permission, isArray: true })
  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions?: Permission[];
}

export class UserResponseDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public email: string;

  @ApiProperty({ nullable: true })
  public teacherId: string | undefined;

  @ApiProperty({ isArray: true, type: String })
  public permissions: string[];

  @ApiProperty()
  public createdAt: Date | undefined;

  @ApiProperty()
  public updatedAt: Date | undefined;

  private constructor(
    id: string,
    email: string,
    teacherId: string | undefined,
    permissions: string[],
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
  ) {
    this.id = id;
    this.email = email;
    this.teacherId = teacherId;
    this.permissions = permissions;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(user: User | null): UserResponseDto | null {
    if (!user) return null;
    return new UserResponseDto(
      user.id!,
      user.email,
      user.teacherId,
      user.permissions,
      user.createdAt,
      user.updatedAt,
    );
  }
}

export interface UserPayload {
  id: string;
  email: string;
  permissions: string[];
}
