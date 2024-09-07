import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('')
  getAllUser(): object {
    return this.userService.findAll();
  }

  @Get('/:id')
  getUser(@Param('id') id: number): object {
    return this.userService.findUser(id)
  }
}
