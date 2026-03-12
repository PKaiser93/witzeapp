import { Expose } from 'class-transformer';

@Expose()
export class ConfigResponseDto {
  @Expose()
  key!: string;

  @Expose()
  value!: string;

  constructor(partial: Partial<ConfigResponseDto>) {
    Object.assign(this, partial);
  }
}
