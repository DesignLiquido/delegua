import { RetornoImportador } from '../importador';

export interface ImportadorInterface {
    diretorioBase: string;
    importar(caminhoRelativoArquivo: string, importacaoInicial: boolean): RetornoImportador;
}
