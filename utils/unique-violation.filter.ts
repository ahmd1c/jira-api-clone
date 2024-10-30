import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { UniqueConstraintViolationException } from '@mikro-orm/core';

@Catch(UniqueConstraintViolationException)
export class UniqueConstraintExceptionFilter implements ExceptionFilter {
  catch(exception: UniqueConstraintViolationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(409).json({
      message: 'entity already exists',
      status: 'fail',
    });
  }
}
