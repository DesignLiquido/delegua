import { RetornoImportador } from "../importador";
import { 
    AvaliadorSintaticoInterface,
    ImportadorInterface,
    InterpretadorComDepuracaoInterface,
    InterpretadorInterface,
    LexadorInterface,
    ResolvedorInterface,
    RetornoExecucaoInterface,
    SimboloInterface,
} from "../interfaces";

export interface DeleguaInterface {
    teveErro: boolean;
    teveErroEmTempoDeExecucao: boolean;
    dialeto: string;
    arquivosAbertos: { [identificador: string]: string };

    interpretador: InterpretadorInterface | InterpretadorComDepuracaoInterface;
    lexador: LexadorInterface;
    avaliadorSintatico: AvaliadorSintaticoInterface;
    resolvedor: ResolvedorInterface;
    importador: ImportadorInterface;

    versao(): string;
    carregarArquivo(caminhoRelativoArquivo: string): void;
    executar(retornoImportador: RetornoImportador): RetornoExecucaoInterface;
    reportar(linha: number, onde: any, mensagem: string): void;
    erro(simbolo: SimboloInterface, mensagemDeErro: string): void;
    erroEmTempoDeExecucao(erro: any): void;
}