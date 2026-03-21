import { Construto } from '../construtos';
import { Declaracao } from '../declaracoes';
import { EspacoMemoria } from '../interpretador/espaco-memoria';
import { ErroInterpretadorInterface } from './erros/erro-interpretador-interface';
import { PilhaEscoposExecucaoInterface } from './pilha-escopos-execucao-interface';

import { RetornoInterpretadorInterface } from './retornos/retorno-interpretador-interface';
import { VisitanteComumInterface } from './visitante-comum-interface';

export interface InterpretadorInterface extends VisitanteComumInterface {
    erros: ErroInterpretadorInterface[];
    diretorioBase: any;
    funcaoDeRetorno: Function;
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any;
    hashArquivoDeclaracaoAtual: number;
    linhaDeclaracaoAtual: number;
    /** Descritor da classe cujo método está sendo executado no momento. Nulo se fora de método de classe. */
    classeAtualEmExecucao: any;

    eVerdadeiro(objeto: any): boolean;
    avaliar(expressao: Construto | Declaracao): any;
    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoMemoria): Promise<any>;
    paraTexto(objeto: any): any;
    executar(declaracao: Declaracao, mostrarResultado?: boolean): any;
    resolverValor(objeto: any, referencia?: boolean): any;
    /**
     * Executa um objeto chamável de Delégua (função declarada, função padrão, etc.)
     * com os argumentos fornecidos como valores nativos já resolvidos.
     * Útil para invocar callbacks de Delégua a partir de código nativo,
     * como em bibliotecas de interface gráfica ou eventos externos.
     * @param chamavel O objeto chamável obtido do escopo de Delégua.
     * @param argumentos Valores nativos a serem passados como argumentos.
     */
    executarChamavel(chamavel: any, argumentos: any[]): Promise<any>;
    interpretar(
        declaracoes: Declaracao[],
        manterAmbiente?: boolean
    ): Promise<RetornoInterpretadorInterface>;
}
