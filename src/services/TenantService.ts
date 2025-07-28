import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { ITenant, TenantQueryParams } from "../types";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        //
        return this.tenantRepository.save(tenantData);
    }

    async getAll(validatedQuery: TenantQueryParams) {
        const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");

        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy("tenant.id", "DESC")
            .getManyAndCount();
        return result;
    }

    async getById(tenantId: number) {
        return this.tenantRepository.findOne({
            where: {
                id: tenantId,
            },
        });
    }

    async deleteById(tenantId: number) {
        return this.tenantRepository.delete(tenantId);
    }
}
