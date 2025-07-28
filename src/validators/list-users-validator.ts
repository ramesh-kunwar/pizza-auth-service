import { checkSchema } from "express-validator";

export default checkSchema(
    {
        q: {
            trim: true,
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : "";
                },
            },
        },

        role: {
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : "";
                },
            },
        },
        currentPage: {
            customSanitizer: {
                options: (value) => {
                    // Number(undefined), Number('sfasfa') => NaN
                    const pararsedValue = Number(value);
                    return Number.isNaN(pararsedValue) ? 1 : pararsedValue;
                },
            },
        },

        perPage: {
            customSanitizer: {
                options: (value) => {
                    // Number(undefined), Number('sfasfa') => NaN
                    const pararsedValue = Number(value);
                    return Number.isNaN(pararsedValue) ? 6 : pararsedValue;
                },
            },
        },
    },
    ["query"],
);
