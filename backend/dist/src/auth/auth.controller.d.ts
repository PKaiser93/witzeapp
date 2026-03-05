import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: {
        email: string;
        password: string;
        username: string;
    }): Promise<{
        id: number;
        email: string;
        username: string;
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
    }>;
    checkUsername(username: string): Promise<{
        available: boolean;
    }>;
    suggestUsername(base: string): Promise<string>;
}
