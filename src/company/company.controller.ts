import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Allowed } from 'src/auth/decorators/allowed-decorator';
import { UserRole } from 'src/constants';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { CompanyOwnerGuard } from 'src/auth/guards/company-owner-guard';

@Controller('companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Allowed(UserRole.ADMIN)
  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    const company = await this.companyService.create(createCompanyDto);
    this.workspaceService.create(
      {
        name: 'default',
        company: company,
      },
      company.owner,
    );
    return await this.companyService.save(company);
  }

  @Allowed(UserRole.ADMIN)
  @Get()
 async findAll() {
    const companies =await this.companyService.findAll();
    if (!companies) throw new NotFoundException('Companies not found');
    return companies;
  }

  @UseGuards(CompanyOwnerGuard)
  @Get(':companyId')
 async findOne(@Param('companyId') companyId: string) {
    const company = await this.companyService.findOne({ id: +companyId });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  @UseGuards(CompanyOwnerGuard)
  @Patch(':companyId')
  async update(
    @Param('companyId') companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const result = await this.companyService.update(
      +companyId,
      updateCompanyDto,
    );
    
    if(!result) throw new NotFoundException('Company not found');
    return {
      message: result ? 'Company updated successfully' : 'Company not found',
      status: result ? 'success' : 'fail',
    };
  }

  @UseGuards(CompanyOwnerGuard)
  @Delete(':companyId')
  async remove(@Param('companyId') companyId: string) {
    const result = await this.companyService.remove(+companyId);

    if(!result) throw new NotFoundException('Company not found');
    return {
      message: result ? 'Company deleted successfully' : 'Company not found',
      status: result ? 'success' : 'fail',
    };
  }
}
