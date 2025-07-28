import { checkSchema } from "express-validator";

export default checkSchema(
    {
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
