import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../roles/entities/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }) { // Esta función se llama automáticamente cuando un token JWT válido es recibido. El payload contiene la información del usuario (sub y email) que fue codificada en el token. La función busca al usuario en la base de datos usando el ID (sub) y, si lo encuentra, retorna el usuario sin el hash de la contraseña. Si no encuentra al usuario, lanza una excepción de Unauthorized.
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token inválido o usuario no encontrado');
    }
    // Retornamos el usuario sin el hash de contraseña
    const { passwordHash: _passwordHash, ...result } = user;
    return result;
  }
}
// La relación entre jwt.strategy.ts y auth.service.ts es que ambos trabajan juntos
// para manejar la autenticación basada en JWT en la aplicación. auth.service.ts se encarga de
// generar los tokens y jwt.strategy.ts valida los que llegan en las solicitudes protegidas.
// valida un token JWT entrante para autenticar a un usuario en las solicitudes protegidas. En conjunto, aseguran que solo los usuarios autenticados puedan acceder a ciertos recursos o rutas dentro de la aplicación.
