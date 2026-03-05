"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WitzeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WitzeService = class WitzeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.witz.findMany({
            include: {
                author: { select: { username: true } },
                kategorie: { select: { name: true, emoji: true } },
                _count: { select: { likeLikes: true } },
                likeLikes: userId
                    ? { where: { userId }, select: { id: true } }
                    : false
            },
            orderBy: { createdAt: 'desc' },
        }).then(witze => witze.map(w => ({
            ...w,
            likes: w._count.likeLikes,
            userLiked: userId && w.likeLikes.length > 0
        })));
    }
    async findRandom() {
        return this.prisma.witz.findFirst({
            orderBy: { id: 'desc' },
        });
    }
    async create(text, authorId, kategorieId) {
        return this.prisma.witz.create({
            data: { text, authorId, kategorieId },
            include: { kategorie: true, author: true },
        });
    }
    async findByUser(userId) {
        return this.prisma.witz.findMany({
            where: { authorId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(id, userId) {
        const witz = await this.prisma.witz.findUnique({ where: { id } });
        if (!witz)
            throw new common_1.NotFoundException('Witz nicht gefunden');
        if (witz.authorId !== Number(userId))
            throw new common_1.ForbiddenException('Nicht dein Witz');
        await this.prisma.like.deleteMany({ where: { witzId: id } });
        return this.prisma.witz.delete({ where: { id } });
    }
    async like(id, userId) {
        const existingLike = await this.prisma.like.findUnique({
            where: { userId_witzId: { userId, witzId: id } },
        });
        if (existingLike) {
            await this.prisma.like.delete({ where: { id: existingLike.id } });
            await this.prisma.witz.update({
                where: { id },
                data: { likes: { decrement: 1 } },
            });
            return {
                liked: false,
                likes: (await this.prisma.witz.findUnique({ where: { id } })).likes,
            };
        }
        else {
            await this.prisma.like.create({ data: { userId, witzId: id } });
            await this.prisma.witz.update({
                where: { id },
                data: { likes: { increment: 1 } },
            });
            return {
                liked: true,
                likes: (await this.prisma.witz.findUnique({ where: { id } })).likes,
            };
        }
    }
    async getProfile(userId) {
        const [witze, likesReceived, user] = await Promise.all([
            this.findByUser(userId),
            this.prisma.like.count({ where: { witz: { authorId: userId } } }),
            this.prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, email: true }
            })
        ]);
        const rang = this.getRang(likesReceived);
        return {
            witze,
            likesReceived,
            rang,
            username: user?.username || 'Unbekannt',
            email: user?.email || ''
        };
    }
    getRang(likes) {
        if (likes >= 100)
            return '👑 Legende';
        if (likes >= 50)
            return '🥇 Gold';
        if (likes >= 10)
            return '🥈 Silber';
        return '🥉 Neuling';
    }
    async findOne(id, userId) {
        const witz = await this.prisma.witz.findUnique({
            where: { id },
            include: {
                author: { select: { username: true, email: true } },
                kategorie: true,
                _count: { select: { likeLikes: true } },
                likeLikes: userId ? { where: { userId }, select: { id: true } } : false
            }
        });
        if (!witz)
            throw new common_1.NotFoundException('Witz nicht gefunden');
        return {
            ...witz,
            likes: witz._count.likeLikes,
            userLiked: userId && witz.likeLikes.length > 0
        };
    }
    async findAllKategorien() {
        return this.prisma.kategorie.findMany({
            select: { id: true, name: true, emoji: true }
        });
    }
    async findUserWitze(userId) {
        return this.prisma.witz.findMany({
            where: { authorId: userId },
            include: { kategorie: true, author: { select: { username: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.WitzeService = WitzeService;
exports.WitzeService = WitzeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WitzeService);
//# sourceMappingURL=witze.service.js.map