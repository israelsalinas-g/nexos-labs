import { CrystalType, CylinderType } from '../enums/urine-test.enums';

export interface CrystalResult {
  type: CrystalType;
  quantity: string;
}

export interface CylinderResult {
  type: CylinderType;
  quantity: string;
}