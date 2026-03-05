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
exports.KategorieController = void 0;
const common_1 = require("@nestjs/common");
const kategorie_service_1 = require("./kategorie.service");
let KategorieController = class KategorieController {
    kategorieService;
    constructor(kategorieService) {
        this.kategorieService = kategorieService;
    }
    async findAll() {
        return this.kategorieService.findAll();
    }
    async create(name, emoji) {
        return this.kategorieService.create(name, emoji);
    }
};
exports.KategorieController = KategorieController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KategorieController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('emoji')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KategorieController.prototype, "create", null);
exports.KategorieController = KategorieController = __decorate([
    (0, common_1.Controller)('kategorien'),
    __metadata("design:paramtypes", [kategorie_service_1.KategorieService])
], KategorieController);
//# sourceMappingURL=kategorie.controller.js.map