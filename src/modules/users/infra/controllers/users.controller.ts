import {Body,Controller,DefaultValuePipe,Delete,Get,HttpCode,HttpStatus,Param,ParseIntPipe,Post,Put,Query,} from "@nestjs/common";
import {ApiBearerAuth,ApiConflictResponse,ApiCreatedResponse,ApiNoContentResponse,ApiNotFoundResponse,ApiOkResponse,ApiOperation,ApiQuery,ApiTags,ApiUnauthorizedResponse,} from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from "@users/application/dto/user.dto";
import { UserService } from "@users/application/services/user.service";

@ApiTags("users")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Nao autenticado" })
@Controller("users")
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequirePermissions(Permission.USERS_READ)
  @HateoasList<UserResponseDto>({
    basePath: "/v1/users",
    itemLinks: (item) => ({
      self: { href: `/v1/users/${item.id}`, method: "GET" },
      update: { href: `/v1/users/${item.id}`, method: "PUT" },
      delete: { href: `/v1/users/${item.id}`, method: "DELETE" },
    }),
  })
  @ApiOperation({ summary: "Listar usuarios" })
  @ApiOkResponse({
    description: "Lista paginada de usuarios com links HATEOAS",
  })
  @ApiQuery({ name: "_page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "_size", required: false, type: Number, example: 10 })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.userService.listPaginated({ page, limit });
  }

  @Get(":id")
  @RequirePermissions(Permission.USERS_READ)
  @HateoasItem<UserResponseDto>({
    basePath: "/v1/users",
    itemLinks: (item) => ({
      self: { href: `/v1/users/${item.id}`, method: "GET" },
      update: { href: `/v1/users/${item.id}`, method: "PUT" },
      delete: { href: `/v1/users/${item.id}`, method: "DELETE" },
      list: { href: "/v1/users", method: "GET" },
      create: { href: "/v1/users", method: "POST" },
    }),
  })
  @ApiOperation({ summary: "Buscar usuario por ID" })
  @ApiOkResponse({ description: "Usuario com links HATEOAS" })
  @ApiNotFoundResponse({ description: "Usuario nao encontrado" })
  async findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.USERS_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Criar usuario" })
  @ApiCreatedResponse({ description: "Usuario criado com sucesso" })
  @ApiConflictResponse({ description: "Email ja cadastrado" })
  async create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Put(":id")
  @RequirePermissions(Permission.USERS_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Atualizar usuario" })
  @ApiNoContentResponse({ description: "Usuario atualizado" })
  @ApiNotFoundResponse({ description: "Usuario nao encontrado" })
  @ApiConflictResponse({ description: "Email ja cadastrado" })
  async update(@Param("id") id: string, @Body() body: UpdateUserDto) {
    return this.userService.edit(id, body);
  }

  @Delete(":id")
  @RequirePermissions(Permission.USERS_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover usuario" })
  @ApiNoContentResponse({ description: "Usuario removido" })
  async remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
