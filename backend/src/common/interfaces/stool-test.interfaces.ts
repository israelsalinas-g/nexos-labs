import { ParasiteType, ProtozooType } from '../enums/stool-test.enums';

export interface ParasiteResult {
  type: ParasiteType;
  quantity: string;
}

export interface ProtozooResult {
  type: ProtozooType;
  quantity: string;
}