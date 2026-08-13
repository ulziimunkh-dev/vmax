export default () => ({
  port: parseInt(process.env.PORT ?? '5000', 10),
  database: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: parseInt(process.env.DB_PORT ?? '5434', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? 'postgres',
    name: process.env.DB_NAME ?? 'vmax',
  },
  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT ?? '6380', 10),
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
    apple: {
      clientId: process.env.APPLE_CLIENT_ID ?? 'mn.vmax.web',
    },

  },
  mail: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    region: process.env.AWS_REGION ?? 'ap-southeast-1',
    s3BucketName: process.env.AWS_S3_BUCKET_NAME ?? 'vmax-property-images',
    folder: process.env.AWS_S3_FOLDER ?? (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
  },
});


