import { NextFunction, Response, Request } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import createHttpError from "http-errors";
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

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getAll();

            this.Logger.info("All tenant have been fetched");
            res.json(tenants);
        } catch (err) {
            next(err);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.params.id;
            if (isNaN(Number(tenantId))) {
                next(createHttpError(400, "Invalid tenant id"));
                return;
            }
            const tenant = await this.tenantService.getById(Number(tenantId));

            if (!tenant) {
                next(createHttpError(404, "Tenant Id Doesn't Exist"));
                return;
            }

            this.Logger.info("Tenant has been fetched", { id: tenant.id });
            res.json(tenant);
        } catch (error) {
            next(error);
        }
    }
}
