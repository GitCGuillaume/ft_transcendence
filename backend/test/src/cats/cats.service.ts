import { HttpException, Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
	private readonly cats: Cat[] = [];
	create(cat: Cat) {
		this.cats.push(cat);
	}
	findAll(): Cat[] {
		return this.cats;
	}
	findOne(id: number): Cat
	{
		console.log("number: " + id);
		console.log("length: " + this.cats.length);
		if (id >= this.cats.length)
		{
			console.log("throw\n");
			throw new HttpException('HttpException', 403) ;
		}
		return this.cats[id];
	}
}
