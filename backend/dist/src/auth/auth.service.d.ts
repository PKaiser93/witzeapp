import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(data: {
        email: string;
        password: string;
        username: string;
    }): Promise<{
        id: number;
        email: string;
        username: string;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
    checkUsernameAvailable(username: string): Promise<boolean>;
    suggestUsername(base: string): Promise<string>;
}
