import { RetornoImportador } from '../importador';
import {
    AvaliadorSintaticoInterface,
    ImportadorInterface,
    InterpretadorComDepuracaoInterface,
    InterpretadorInterface,
    LexadorInterface,
    RetornoExecucaoInterface,
    SimboloInterface,
} from '../interfaces';

export interface DeleguaInterface {
    dialeto: string;
    arquivosAbertos: { [identificador: string]: string };
    conteudoArquivosAbertos: { [identificador: string]: string[] };
    funcaoDeRetorno: Function;

    interpretador: InterpretadorInterface | InterpretadorComDepuracaoInterface;
    lexador: LexadorInterface;
    avaliadorSintatico: AvaliadorSintaticoInterface;
    importador: ImportadorInterface;

    versao(): string;
    carregarArquivo(caminhoRelativoArquivo: string): void;
    executar(retornoImportador: RetornoImportador): Promise<RetornoExecucaoInterface>;
    executarUmaLinha(linha: string): Promise<RetornoExecucaoInterface>;
    reportar(linha: number, onde: any, mensagem: string): void;
    erro(simbolo: SimboloInterface, mensagemDeErro: string): void;
    erroEmTempoDeExecucao(erro: any): void;
}
