import { TiposDadosInterface } from "./tipos-dados-interface";

export interface VariavelHipoteticaInterface {
    tipo: TiposDadosInterface;
    subtipo?: 'texto' | 'número' | 'inteiro' | 'longo' | 'lógico';
    imutavel: boolean;
    valor?: any
}
