import type { ClassOffering } from "@class-offering/domain/models/class-offering.entity";

export class ClassOfferingEventDto {
  id: string;
  subjectId: string;
  teacherId: string;
  startDate: Date;
  endDate: Date;
  status: string;

  static from(classOffering: ClassOffering): ClassOfferingEventDto {
    const dto = new ClassOfferingEventDto();
    dto.id = classOffering.id!;
    dto.subjectId = classOffering.subjectId;
    dto.teacherId = classOffering.teacherId;
    dto.startDate = classOffering.startDate;
    dto.endDate = classOffering.endDate;
    dto.status = classOffering.status;
    return dto;
  }
}
