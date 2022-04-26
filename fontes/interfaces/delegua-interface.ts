import { RetornoImportador } from "../importador";

export interface DeleguaInterface {
    executar(retornoImportador: RetornoImportador): void;
}