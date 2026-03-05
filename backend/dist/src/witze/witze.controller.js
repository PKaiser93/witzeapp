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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WitzeController = void 0;
const common_1 = require("@nestjs/common");
const witze_service_1 = require("./witze.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WitzeController = class WitzeController {
    witzeService;
    constructor(witzeService) {
        this.witzeService = witzeService;
    }
    async findAll(req) {
        return this.witzeService.findAll(req.user?.id);
    }
    async findRandom() {
        return this.witzeService.findRandom();
    }
    create(text, kategorieId, req) {
        return this.witzeService.create(text, req.user.id, kategorieId);
    }
    findMine(req) {
        return this.witzeService.findByUser(req.user.id);
    }
    async findOne(id, req) {
        return this.witzeService.findOne(id, req.user.id);
    }
    remove(id, req) {
        return this.witzeService.remove(id, req.user.id);
    }
    async like(id, req) {
        return this.witzeService.like(id, req.user.id);
    }
    async getProfileWitze(req) {
        const userId = req.user.sub;
        return this.witzeService.findUserWitze(userId);
    }
    async getKategorien() {
        return this.witzeService.findAllKategorien();
    }
};
exports.WitzeController = WitzeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WitzeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('random'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WitzeController.prototype, "findRandom", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('text')),
    __param(1, (0, common_1.Body)('kategorieId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", void 0)
], WitzeController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WitzeController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WitzeController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WitzeController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/like'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WitzeController.prototype, "like", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WitzeController.prototype, "getProfileWitze", null);
__decorate([
    (0, common_1.Get)('kategorien'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WitzeController.prototype, "getKategorien", null);
exports.WitzeController = WitzeController = __decorate([
    (0, common_1.Controller)('witze'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [witze_service_1.WitzeService])
], WitzeController);
//# sourceMappingURL=witze.controller.js.map