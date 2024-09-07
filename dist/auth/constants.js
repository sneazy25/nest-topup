"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtConstants = void 0;
class JwtConstants {
    constructor(configService) {
        this.configService = configService;
        JwtConstants.secret = this.configService.get('JWT_SECRET');
    }
}
exports.JwtConstants = JwtConstants;
;
//# sourceMappingURL=constants.js.map