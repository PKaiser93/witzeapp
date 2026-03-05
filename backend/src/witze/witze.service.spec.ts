import { Test, TestingModule } from '@nestjs/testing';
import { WitzeService } from './witze.service';

describe('WitzeService', () => {
  let service: WitzeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WitzeService],
    }).compile();

    service = module.get<WitzeService>(WitzeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
