import { Module } from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { MedicationsController } from './medications.controller';
import { CabinetController } from './cabinet/cabinet.controller';
import { CabinetService } from './cabinet/cabinet.service';

@Module({
  controllers: [MedicationsController, CabinetController],
  providers: [MedicationsService, CabinetService],
  exports: [MedicationsService, CabinetService],
})
export class MedicationsModule {}
