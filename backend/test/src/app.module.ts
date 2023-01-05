import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [CatsModule, TypeOrmModule.forRoot({
	type: 'postgres',
	port: 5432,
	username: 'user',
	password: 'password',
	database: 'db',
	synchronize: false,
  }) ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware)
			.forRoutes({path: 'cats', method: RequestMethod.GET});
	}
}

