import { Expose } from 'class-transformer';

@Expose()
export class ReportResponseDto {
  @Expose()
  id!: number;

  @Expose()
  witzId!: number;

  @Expose()
  reporterId!: number;

  @Expose()
  reportedUserId?: number | null;

  @Expose()
  reason!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  resolved!: boolean;

  constructor(partial: Partial<ReportResponseDto>) {
    Object.assign(this, partial);
  }
}
