import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  
  @Injectable()
  export class GatewayGuard implements CanActivate {
    constructor(private configService: ConfigService) {}
  
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const secretHeader = request.headers['x-gateway-secret'];
      const validSecret = this.configService.get<string>('GATEWAY_SECRET');
  
      if (!secretHeader || secretHeader !== validSecret) {
        throw new UnauthorizedException('Only gateway requests are processed');
      }
  
      return true;
    }
  }
  