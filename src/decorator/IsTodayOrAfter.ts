import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsTodayOrAfter(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isTodayOrAfter',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: string, args: ValidationArguments) {
                    const parseDate = new Date(value);
                    if (isNaN(parseDate.getTime())) return false;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    parseDate.setHours(0, 0, 0, 0);
                    return parseDate.getTime() >= today.getTime();
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be date of today or later`;
                },
            },
        });
    };
}