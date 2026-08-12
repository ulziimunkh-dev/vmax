declare const _default: () => {
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    oauth: {
        google: {
            clientId: string;
        };
        facebook: {
            appId: string;
            appSecret: string;
        };
    };
    mail: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
};
export default _default;
