import { Test, TestingModule } from '@nestjs/testing';
import { WitzeController } from './witze.controller';

describe('WitzeController', () => {
  let controller: WitzeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WitzeController],
    }).compile();

    controller = module.get<WitzeController>(WitzeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
