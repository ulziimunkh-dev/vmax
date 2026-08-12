"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT ?? '3001', 10),
    database: {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASS ?? 'postgres',
        name: process.env.DB_NAME ?? 'vmax',
    },
    jwt: {
        secret: process.env.JWT_SECRET ?? 'vmax-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        },
        facebook: {
            appId: process.env.FACEBOOK_APP_ID ?? '',
            appSecret: process.env.FACEBOOK_APP_SECRET ?? '',
        },
    },
    mail: {
        host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
    },
});
//# sourceMappingURL=configuration.js.map