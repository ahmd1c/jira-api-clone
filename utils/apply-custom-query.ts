import {
  AnyEntity,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { QueryDto } from './query-prepare';

export async function applyCustomQuery<Entity extends AnyEntity>(
  queryDto: QueryDto,
  repo: EntityRepository<Entity>,
  filter: FilterQuery<Entity> = {},
) {
  const { limit = 10, page = 1, fields } = queryDto;
  const [data, count] = await repo.findAndCount(filter, {
    limit,
    offset: limit * (page - 1),
    fields: fields || undefined,
  });
  const totalPages = Math.ceil(count / limit);
  const pagination = {
    currentPage: page,
    nextPage: page < totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
    totalPages,
    totalItems: count,
  };
  return { data, pagination };
}
