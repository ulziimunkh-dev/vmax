import { AuthProvider } from '../common/enums/auth-provider.enum';
import { Listing } from '../listings/listing.entity';
export declare class User {
    id: string;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    avatarUrl?: string;
    authProvider: AuthProvider;
    providerId?: string;
    listings: Listing[];
    createdAt: Date;
}
