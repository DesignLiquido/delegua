import { RetornoImportador } from "../importador";
import { 
    AvaliadorSintaticoInterface,
    ImportadorInterface,
    InterpretadorInterface,
    LexadorInterface,
    ResolvedorInterface,
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

    executar(retornoImportador: RetornoImportador): void;
}