import {ClassOfferingDto,type CreateClassOfferingDto,} from "@class-offering/application/dto/class-offering.dto";
import {ClassOffering,ClassOfferingStatus,} from "@class-offering/domain/models/class-offering.entity";
import {
  CLASS_OFFERING_REPOSITORY,type ClassOfferingRepository,} from "@class-offering/domain/repositories/class-offering-repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class ClassOfferingService {
  constructor(
    @Inject(CLASS_OFFERING_REPOSITORY)
    private readonly classOfferingRepository: ClassOfferingRepository,
  ) {}

  async create(dto: CreateClassOfferingDto): Promise<void> {
    const classOffering = ClassOffering.restore({
      subjectId: dto.subjectId,
      teacherId: dto.teacherId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: dto.status,
    });

    await this.classOfferingRepository.create(classOffering!);
  }

  async list(): Promise<ClassOfferingDto[]> {
    const response = await this.classOfferingRepository.findAll();
    return response.map((row) => ClassOfferingDto.from(row)!);
  }

  async listPaginated({
    page,
    limit,
  }: PaginationParams): Promise<PaginatedResult<ClassOfferingDto>> {
    const classOfferings = await this.list();
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: classOfferings.slice(start, end),
      total: classOfferings.length,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<ClassOfferingDto> {
    const response = await this.classOfferingRepository.findById(id);
    if (!response) throw new NotFoundException("ClassOffering not found");

    return ClassOfferingDto.from(response)!;
  }

  async changeStatus(id: string, status: ClassOfferingStatus): Promise<void> {
    const classOffering = await this.classOfferingRepository.findById(id);

    if (!classOffering) {
      throw new NotFoundException("ClassOffering not found");
    }

    await this.classOfferingRepository.updateStatus(id, status);
  }
}
