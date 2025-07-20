import { NextFunction, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
export class TenantController {
    constructor(
        private tenantService: TenantService,
        private Logger: Logger,
    ) {}
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;

        this.Logger.debug("Request for creating a tenant ", { name, address });

        try {
            const tenant = await this.tenantService.create({ name, address });
            this.Logger.info("Tenant has been created", { id: tenant.id });
            res.status(201).json({
                id: tenant.id,
            });
        } catch (error) {
            next(error);
        }
    }
}
