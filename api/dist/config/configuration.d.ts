declare const _default: () => {
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
    redis: {
        host: string;
        port: number;
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
        apple: {
            clientId: string;
        };
    };
    mail: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        s3BucketName: string;
        folder: string;
    };
};
export default _default;
