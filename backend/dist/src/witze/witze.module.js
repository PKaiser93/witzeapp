"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WitzeModule = void 0;
const common_1 = require("@nestjs/common");
const witze_controller_1 = require("./witze.controller");
const witze_service_1 = require("./witze.service");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
let WitzeModule = class WitzeModule {
};
exports.WitzeModule = WitzeModule;
exports.WitzeModule = WitzeModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        controllers: [witze_controller_1.WitzeController],
        providers: [witze_service_1.WitzeService],
        exports: [witze_service_1.WitzeService],
    })
], WitzeModule);
//# sourceMappingURL=witze.module.js.map