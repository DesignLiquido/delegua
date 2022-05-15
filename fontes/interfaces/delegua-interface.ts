import { RetornoImportador } from "../importador";
import { 
    AvaliadorSintaticoInterface,
    ImportadorInterface,
    InterpretadorInterface,
    LexadorInterface,
    ResolvedorInterface,
    RetornoExecucaoInterface,
    SimboloInterface,
} from "../interfaces";

export interface DeleguaInterface {
    nomeArquivo: string;
    teveErro: boolean;
    teveErroEmTempoDeExecucao: boolean;
    dialeto: string;
    arquivosAbertos: { [identificador: string]: string };

    interpretador: InterpretadorInterface;
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