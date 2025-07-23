import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { ITenant } from "../types";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        //
        return this.tenantRepository.save(tenantData);
    }

    async getAll() {
        return this.tenantRepository.find();
    }

    async getById(tenantId: number) {
        return this.tenantRepository.findOne({
            where: {
                id: tenantId,
            },
        });
    }
}
