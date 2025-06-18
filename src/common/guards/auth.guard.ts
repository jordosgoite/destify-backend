/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core'; // To read custom metadata

@Injectable()
export class AuthGuard implements CanActivate {
  // Hardcoded API secret for simplicity as per requirements
  private readonly API_SECRET: string;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector, // Inject Reflector
  ) {
    this.API_SECRET = this.configService.get<string>(
      'API_SECRET',
      'my-super-secret-key',
    ); // Default value for local testing
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiSecret = request.headers['x-api-secret'];

    // Allow unprotected routes
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    if (!apiSecret || apiSecret !== this.API_SECRET) {
      throw new UnauthorizedException('Invalid API secret');
    }
    return true;
  }
}
