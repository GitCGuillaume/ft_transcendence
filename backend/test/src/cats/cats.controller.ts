import {
	Controller, Body, Get,
	Post, Req, Redirect, Param,
	HttpStatus, HttpException,
	ParseIntPipe
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';
//npm i --save class-validator class-transformer
import { IsString, IsInt } from 'class-validator';

//Data transfert Object, define how data will be sent to network, typescript
class CreateCatDto {
	@IsString()
	name: string;
	@IsInt()
	age: number;
	@IsString()
	breed: string;
}

@Controller()
export class CatsController {
	constructor(private catsService: CatsService) { }
	//Add a cat to constructor CatsService
	//curl -d "name=valName&age=10&breed=testBreed" -X POST localhost:8080/cats
	@Post('cats')
	async create(@Body() createCatDto: CreateCatDto) {
		this.catsService.create(createCatDto);
		return `post, ${createCatDto.name}\n`;
	}
	@Get('cats')
	async findAll(): Promise<Cat[]> {
		return this.catsService.findAll();
	}

	@Get('cats/:id')
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<Cat> {
		console.log(id);
		return this.catsService.findOne(id);
	}
	@Get('redirect')
	@Redirect('/', 301)
	redirect() { }
	@Get('throw')
	async except() {
		throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}

