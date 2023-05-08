import { EspacoVariaveis } from '../espaco-variaveis';
import { Construto } from '../construtos';
import {
    Declaracao
} from '../declaracoes';
import { PilhaEscoposExecucaoInterface } from './pilha-escopos-execucao-interface';

import { RetornoInterpretador } from './retornos/retorno-interpretador';
import { VisitanteComumInterface } from './visitante-comum-interface';

export interface InterpretadorInterface extends VisitanteComumInterface {
    diretorioBase: any;
    funcaoDeRetorno: Function;
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any;

    avaliar(expressao: Construto | Declaracao): any;
    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoVariaveis): Promise<any>;
    paraTexto(objeto: any): any;
    executar(declaracao: Declaracao, mostrarResultado: boolean): any;
    interpretar(declaracoes: Declaracao[], manterAmbiente?: boolean): Promise<RetornoInterpretador>;
}
