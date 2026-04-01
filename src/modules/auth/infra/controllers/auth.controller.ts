import { LoginDto, LoginResponseDto } from "@auth/application/dto/auth.dto";
import { AuthService } from "@auth/application/services/auth.service";
import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Public } from "@shared/infra/decorators/public.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Public()
  @ApiOperation({ summary: "Autenticar usuario" })
  @ApiOkResponse({
    type: LoginResponseDto,
    description: "JWT gerado com sucesso",
  })
  @ApiBadRequestResponse({ description: "Payload invalido" })
  @ApiUnauthorizedResponse({ description: "Credenciais invalidas" })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
