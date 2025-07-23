import { checkSchema } from "express-validator";

export default checkSchema({
    name: {
        trim: true,
        errorMessage: "Tenant name is required",
        // nonEmpty: true,
    },
    address: {
        trim: true,
        errorMessage: "Tenant address is required",
        // nonEmpty: true,
    },
});
