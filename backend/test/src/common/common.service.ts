import { Module, Injectable, Inject, forwardRef } from '@nestjs/common';
import { CatsService } from '../cats/cats.service';
import { CatsModule } from '../cats/cats.module';

@Module({
	providers: [CatsService],
	imports: [forwardRef(() => CatsModule)],
})

@Injectable()
export class CommonService {
	constructor(
		@Inject(forwardRef(() => CatsService))
		private catsService: CatsService,
	) {}
}
