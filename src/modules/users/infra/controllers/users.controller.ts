import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { Permission } from "@shared/domain/enums/permission.enum";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { CreateUserDto, UpdateUserDto } from "@users/application/dto/user.dto";
import { UserService } from "@users/application/services/user.service";

@Controller("users")
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequirePermissions(Permission.USERS_READ)
  async findAll() {
    return this.userService.list();
  }

  @Get(":id")
  @RequirePermissions(Permission.USERS_READ)
  async findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.USERS_WRITE)
  async create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Put(":id")
  @RequirePermissions(Permission.USERS_WRITE)
  async update(@Param("id") id: string, @Body() body: UpdateUserDto) {
    return this.userService.edit(id, body);
  }

  @Delete(":id")
  @RequirePermissions(Permission.USERS_DELETE)
  async remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
