"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
let UploadsService = UploadsService_1 = class UploadsService {
    configService;
    logger = new common_1.Logger(UploadsService_1.name);
    s3Client = null;
    bucketName;
    constructor(configService) {
        this.configService = configService;
        const accessKeyId = this.configService.get('aws.accessKeyId');
        const secretAccessKey = this.configService.get('aws.secretAccessKey');
        const region = this.configService.get('aws.region') || 'ap-northeast-1';
        this.bucketName = this.configService.get('aws.s3BucketName') || 'vmax-property-images';
        if (accessKeyId && secretAccessKey) {
            this.s3Client = new client_s3_1.S3Client({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
            this.logger.log(`☁️ AWS S3 Upload Service initialized for bucket: ${this.bucketName}`);
        }
        else {
            this.logger.warn(`⚠️ AWS credentials not set. Falling back to local file upload storage.`);
        }
    }
    async uploadFile(file, subfolder = 'uploads') {
        const fileExt = path.extname(file.originalname);
        const folder = this.configService.get('aws.folder') || 'development';
        const region = this.configService.get('aws.region') || 'ap-southeast-1';
        const s3Key = `${folder}/${subfolder}/${(0, uuid_1.v4)()}${fileExt}`;
        if (this.s3Client) {
            try {
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: s3Key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                });
                await this.s3Client.send(command);
                const s3Url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
                this.logger.log(`✅ File uploaded successfully to S3: ${s3Url}`);
                return s3Url;
            }
            catch (error) {
                this.logger.error(`❌ Failed to upload file to S3: ${error.message}`);
            }
        }
        const uploadDir = path.join(process.cwd(), subfolder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const localFileName = `${(0, uuid_1.v4)()}${fileExt}`;
        const filePath = path.join(uploadDir, localFileName);
        fs.writeFileSync(filePath, file.buffer || fs.readFileSync(file.path));
        return `/${subfolder}/${localFileName}`;
    }
    async uploadMultipleFiles(files, subfolder = 'uploads') {
        if (!files || files.length === 0)
            return [];
        return Promise.all(files.map((file) => this.uploadFile(file, subfolder)));
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = UploadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map