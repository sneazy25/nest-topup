import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ResponseInterface } from './response.interface';
import { TopupService } from './topup.service';

@Controller('topup')
export class TopupController {
    constructor(private readonly topupService: TopupService) { }

    @Post('update')
    update(@Headers('X-Apigames-Authorization') auth: string, @Body() data: ResponseInterface): object {
        if (!auth) throw new BadRequestException({ status: 'error', message: 'Authorization header is required' });
        return this.topupService.updateTopup(auth, data);
    }
}
