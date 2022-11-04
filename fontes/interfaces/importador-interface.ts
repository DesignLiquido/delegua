import { RetornoImportador } from '../importador';

export interface ImportadorInterface {
    importar(caminhoRelativoArquivo: string): RetornoImportador;
}
