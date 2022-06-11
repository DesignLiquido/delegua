import { PontoParada } from "../depuracao";
import { InterpretadorInterface } from "./interpretador-interface";

export interface InterpretadorComDepuracaoInterface extends InterpretadorInterface {
    adentrarEscopoAtivo: boolean;
    pontoDeParadaAtivo: boolean;
    pontosParada: PontoParada[];

    interpretacaoApenasUmaInstrucao(): void;
    continuarInterpretacao(): void;
    interpretacaoApenasUmaInstrucao(): void;
    proximoESair(): void;
}
