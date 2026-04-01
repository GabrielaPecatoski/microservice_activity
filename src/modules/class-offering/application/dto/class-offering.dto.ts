import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from "class-validator";
import {
  ClassOffering,
  ClassOfferingStatus,
} from "@class-offering/domain/models/class-offering.entity";

export class CreateClassOfferingDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({ enum: ClassOfferingStatus })
  @IsEnum(ClassOfferingStatus)
  @IsNotEmpty()
  status: ClassOfferingStatus;
}

export class UpdateClassOfferingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({ required: false, enum: ClassOfferingStatus })
  @IsOptional()
  @IsEnum(ClassOfferingStatus)
  status?: ClassOfferingStatus;
}

export class ClassOfferingDto {
  @ApiProperty({ nullable: true })
  public id: string | undefined;

  @ApiProperty()
  public subjectId: string;

  @ApiProperty()
  public teacherId: string;

  @ApiProperty()
  public startDate: Date;

  @ApiProperty()
  public endDate: Date;

  @ApiProperty({ enum: ClassOfferingStatus })
  public status: ClassOfferingStatus;

  private constructor(
    id: string | undefined,
    subjectId: string,
    teacherId: string,
    startDate: Date,
    endDate: Date,
    status: ClassOfferingStatus,
  ) {
    this.id = id;
    this.subjectId = subjectId;
    this.teacherId = teacherId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
  }

  public static from(
    classOffering: ClassOffering | null,
  ): ClassOfferingDto | null {
    if (!classOffering) return null;
    return new ClassOfferingDto(
      classOffering.id,
      classOffering.subjectId,
      classOffering.teacherId,
      classOffering.startDate,
      classOffering.endDate,
      classOffering.status,
    );
  }
}
