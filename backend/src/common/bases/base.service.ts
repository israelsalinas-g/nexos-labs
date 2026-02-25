import { Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, FindManyOptions, FindOneOptions, SelectQueryBuilder } from 'typeorm';
import { PaginationResult } from '../interfaces/pagination.interface';

export abstract class BaseService<T> {
    protected abstract readonly logger: Logger;

    constructor(protected readonly repository: Repository<T>) { }

    async create(data: any): Promise<T> {
        try {
            const entity = this.repository.create(data as any);
            return await this.repository.save(entity);
        } catch (error) {
            this.logger.error(`Error creating entity: ${error.message}`);
            throw error;
        }
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
        options?: FindManyOptions<T>,
    ): Promise<PaginationResult<T>> {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await this.repository.findAndCount({
                ...options,
                skip,
                take: limit,
            });

            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            this.logger.error(`Error finding all entities: ${error.message}`);
            throw error;
        }
    }

    async findOne(id: string, options?: FindOneOptions<T>): Promise<T> {
        try {
            const entity = await this.repository.findOne({
                where: { id } as any,
                ...options,
            });

            if (!entity) {
                throw new NotFoundException(`Entity with ID ${id} not found`);
            }

            return entity;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Error finding entity: ${error.message}`);
            throw new BadRequestException('Error finding record');
        }
    }

    async update(id: string, data: any): Promise<T> {
        try {
            await this.findOne(id);
            await this.repository.update(id, data as any);
            return await this.findOne(id);
        } catch (error) {
            this.logger.error(`Error updating entity: ${error.message}`);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const entity = await this.findOne(id);
            await this.repository.remove(entity);
        } catch (error) {
            this.logger.error(`Error removing entity: ${error.message}`);
            throw error;
        }
    }

    protected async paginateQueryBuilder(
        queryBuilder: SelectQueryBuilder<T>,
        page: number = 1,
        limit: number = 10,
    ): Promise<PaginationResult<T>> {
        const skip = (page - 1) * limit;
        const [data, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
