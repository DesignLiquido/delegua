import { Construto } from '../construtos';
import { Declaracao } from '../declaracoes';
import { EspacoVariaveis } from '../espaco-variaveis';
import { PilhaEscoposExecucaoInterface } from './pilha-escopos-execucao-interface';

import { ErroInterpretador } from '../interpretador';
import { RetornoInterpretador } from './retornos/retorno-interpretador';
import { VisitanteComumInterface } from './visitante-comum-interface';

export interface InterpretadorInterfaceBirl extends VisitanteComumInterface {
    erros: ErroInterpretador[];
    diretorioBase: any;
    funcaoDeRetorno: Function;
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any;
    resultadoInterpretador?: Array<string>;
    executarUltimoEscopo(manterAmbiente?: boolean): Promise<any>;

    eVerdadeiro(objeto: any): boolean;
    avaliar(expressao: Construto | Declaracao): any;
    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoVariaveis): Promise<any>;
    paraTexto(objeto: any): any;
    executar(declaracao: Declaracao, mostrarResultado: boolean): any;
    interpretar(declaracoes: Declaracao[], manterAmbiente?: boolean): Promise<RetornoInterpretador>;
}
