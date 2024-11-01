import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  EntityRepository,
  UniqueConstraintViolationException,
} from '@mikro-orm/postgresql';
import { Company } from './entities/company.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: EntityRepository<Company>,
    private readonly userService: UserService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto & { user?: Partial<User> }) {
    const { name, ownerId, user } = createCompanyDto;
    const company = await this.findOne({ name: createCompanyDto.name }, ['id']);
    if (company) {
      throw new ConflictException('Company already exists');
    }

    // this to handle 2 possible cases either creating the company in registration(user)
    // or from the admin panel(ownerId)
    let owner = user;
    if (ownerId) {
      const userExist = await this.userService.findOne({ id: ownerId }, [
        'id',
        'company',
      ]);
      console.log(userExist);

      if (!userExist) throw new NotFoundException('User does not exist');

      if (userExist.company?.id) {
        throw new ConflictException('User already has a company');
      }
      owner = userExist;
    }
    return this.companyRepo.create({
      name,
      owner,
    });
  }

  async save(company) {
    await this.companyRepo.getEntityManager().persistAndFlush(company);
    return company;
  }

  findAll() {
    return this.companyRepo.findAll();
  }

  findOne(where: Partial<Company>, fields?: (keyof Company)[]) {
    return this.companyRepo.findOne(where, { fields });
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return await this.companyRepo.nativeUpdate(id, updateCompanyDto);
  }

  remove(id: number) {
    return this.companyRepo.nativeDelete(id);
  }
}
