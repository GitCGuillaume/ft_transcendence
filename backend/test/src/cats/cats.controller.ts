import { Controller, Body, Get, Post, Req, Redirect, Param } from '@nestjs/common';
import { Request } from 'express';

//Data transfert Object, define how data will be sent to network, typescript
class CreateCatDto {
	name: string;
	age: number;
	breed: string;
}

@Controller()
export class CatsController {
	//curl -d "name=val" -X POST localhost:8080/cats
	@Post('cats')
	async create(@Body() createCatDto: CreateCatDto) {
		return `post, ${createCatDto.name}\n`;
	}
	@Get('cats')
	findAll(@Req() request: Request): string {
		return "This action return all cats.";
	}

	@Get('cats/:id')
	findOne(@Param() params: any): string {
		console.log(params.id);
		return `This action return cat id: ${params.id}.`;
	}
	@Get('redirect')
	@Redirect('/', 301)
	redirect() {}
}
