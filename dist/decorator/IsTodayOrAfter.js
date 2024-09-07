"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsTodayOrAfter = IsTodayOrAfter;
const class_validator_1 = require("class-validator");
function IsTodayOrAfter(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isTodayOrAfter',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value, args) {
                    const parseDate = new Date(value);
                    if (isNaN(parseDate.getTime()))
                        return false;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    parseDate.setHours(0, 0, 0, 0);
                    return parseDate.getTime() >= today.getTime();
                },
                defaultMessage(args) {
                    return `${args.property} must be date of today or later`;
                },
            },
        });
    };
}
//# sourceMappingURL=IsTodayOrAfter.js.map