import { RetornoImportador } from '../importador';

export interface ImportadorInterface {
    diretorioBase: string;
    conteudoArquivosAbertos: { [identificador: string]: string[] };

    importar(
        caminhoRelativoArquivo: string,
        importacaoInicial: boolean,
        traduzirJavaScriptParaDelegua: boolean
    ): RetornoImportador;
}
