import { InterpretadorInterface } from "./interpretador-interface";

export interface InterpretadorComDepuracaoInterface extends InterpretadorInterface {
    adentrarEscopoAtivo: boolean;
    pontoDeParadaAtivo: boolean;

    interpretacaoApenasUmaInstrucao(): void;
    continuarInterpretacao(): void;
    interpretacaoApenasUmaInstrucao(): void;
    proximoESair(): void;
}
