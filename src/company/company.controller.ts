import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Allowed } from 'src/auth/decorators/allowed-decorator';
import { UserRole } from 'src/workspace/entities/user-workspace.entity';
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
  findAll() {
    return this.companyService.findAll();
  }

  @UseGuards(CompanyOwnerGuard)
  @Get(':companyId')
  findOne(@Param('companyId') companyId: string) {
    return this.companyService.findOne({ id: +companyId });
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
    return {
      message: result ? 'Company updated successfully' : 'Company not found',
      status: result ? 'success' : 'fail',
    };
  }

  @UseGuards(CompanyOwnerGuard)
  @Delete(':companyId')
  async remove(@Param('companyId') companyId: string) {
    const result = await this.companyService.remove(+companyId);
    return {
      message: result ? 'Company deleted successfully' : 'Company not found',
      status: result ? 'success' : 'fail',
    };
  }
}
