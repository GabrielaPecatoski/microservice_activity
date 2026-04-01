import {ClassOfferingDto,CreateClassOfferingDto,} from "@class-offering/application/dto/class-offering.dto";
import { ClassOfferingService } from "@class-offering/application/services/class-offering.service";
import { ClassOfferingStatus } from "@class-offering/domain/models/class-offering.entity";
import {Body,Controller,DefaultValuePipe,Get,HttpCode,HttpStatus,Param,Patch,ParseIntPipe,Post,Query,} from "@nestjs/common";
import {ApiBearerAuth,ApiCreatedResponse,ApiNoContentResponse,ApiNotFoundResponse,ApiOkResponse,ApiOperation,ApiQuery,ApiTags,ApiUnauthorizedResponse,} from "@nestjs/swagger";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("class-offerings")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Nao autenticado" })
@Controller("classOfferings")
export class ClassOfferingsController {
  constructor(private readonly classOfferingService: ClassOfferingService) {}

  @Get()
  @HateoasList<ClassOfferingDto>({
    basePath: "/v1/classOfferings",
    itemLinks: (item) => ({
      self: { href: `/v1/classOfferings/${item.id}`, method: "GET" },
      activate: {
        href: `/v1/classOfferings/${item.id}/activate`,
        method: "PATCH",
      },
      deactivate: {
        href: `/v1/classOfferings/${item.id}/deactivate`,
        method: "PATCH",
      },
    }),
  })
  @ApiOperation({ summary: "Listar turmas ofertadas" })
  @ApiOkResponse({
    description: "Lista paginada de turmas ofertadas com links HATEOAS",
  })
  @ApiQuery({ name: "_page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "_size", required: false, type: Number, example: 10 })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.classOfferingService.listPaginated({ page, limit });
  }

  @Get(":id")
  @HateoasItem<ClassOfferingDto>({
    basePath: "/v1/classOfferings",
    itemLinks: (item) => ({
      self: { href: `/v1/classOfferings/${item.id}`, method: "GET" },
      activate: {
        href: `/v1/classOfferings/${item.id}/activate`,
        method: "PATCH",
      },
      deactivate: {
        href: `/v1/classOfferings/${item.id}/deactivate`,
        method: "PATCH",
      },
      list: { href: "/v1/classOfferings", method: "GET" },
      create: { href: "/v1/classOfferings", method: "POST" },
    }),
  })
  @ApiOperation({ summary: "Buscar turma ofertada por ID" })
  @ApiOkResponse({ description: "Turma ofertada com links HATEOAS" })
  @ApiNotFoundResponse({ description: "Turma ofertada nao encontrada" })
  async findById(@Param("id") id: string) {
    return this.classOfferingService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Criar turma ofertada" })
  @ApiCreatedResponse({ description: "Turma ofertada criada com sucesso" })
  async create(@Body() body: CreateClassOfferingDto) {
    return this.classOfferingService.create(body);
  }

  @Patch(":id/activate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Ativar turma ofertada" })
  @ApiNoContentResponse({ description: "Turma ofertada ativada com sucesso" })
  @ApiNotFoundResponse({ description: "Turma ofertada nao encontrada" })
  async activate(@Param("id") id: string) {
    return this.classOfferingService.changeStatus(
      id,
      ClassOfferingStatus.ACTIVE,
    );
  }

  @Patch(":id/deactivate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desativar turma ofertada" })
  @ApiNoContentResponse({
    description: "Turma ofertada desativada com sucesso",
  })
  @ApiNotFoundResponse({ description: "Turma ofertada nao encontrada" })
  async deactivate(@Param("id") id: string) {
    return this.classOfferingService.changeStatus(
      id,
      ClassOfferingStatus.INACTIVE,
    );
  }
}
