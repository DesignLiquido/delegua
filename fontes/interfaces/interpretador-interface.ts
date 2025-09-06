import { Construto } from '../construtos';
import { Declaracao } from '../declaracoes';
import { EspacoMemoria } from '../interpretador/espaco-memoria';
import { ErroInterpretador } from './erros/erro-interpretador';
import { PilhaEscoposExecucaoInterface } from './pilha-escopos-execucao-interface';

import { RetornoInterpretadorInterface } from './retornos/retorno-interpretador-interface';
import { VisitanteComumInterface } from './visitante-comum-interface';

export interface InterpretadorInterface extends VisitanteComumInterface {
    erros: ErroInterpretador[];
    diretorioBase: any;
    funcaoDeRetorno: Function;
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any;
    hashArquivoDeclaracaoAtual: number;
    linhaDeclaracaoAtual: number;

    eVerdadeiro(objeto: any): boolean;
    avaliar(expressao: Construto | Declaracao): any;
    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoMemoria): Promise<any>;
    paraTexto(objeto: any): any;
    executar(declaracao: Declaracao, mostrarResultado?: boolean): any;
    resolverValor(objeto: any): any;
    interpretar(declaracoes: Declaracao[], manterAmbiente?: boolean): Promise<RetornoInterpretadorInterface>;
}
