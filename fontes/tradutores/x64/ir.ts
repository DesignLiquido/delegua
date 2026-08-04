import { IRTipo } from './tipos-x64';

export type IRValor =
    | { classe: 'constante'; valor: number | bigint | boolean }
    | { classe: 'registrador'; nome: string }
    | { classe: 'rotulo'; nome: string }
    /** Só aparece como `src` da `copia` sintética no início do bloco de entrada: i-ésimo registrador de argumento da ABI. */
    | { classe: 'argumentoFisico'; indice: number };

export function valorConstante(valor: number | bigint | boolean): IRValor {
    return { classe: 'constante', valor };
}

export function valorRegistrador(nome: string): IRValor {
    return { classe: 'registrador', nome };
}

export function valorRotulo(nome: string): IRValor {
    return { classe: 'rotulo', nome };
}

export function valorArgumentoFisico(indice: number): IRValor {
    return { classe: 'argumentoFisico', indice };
}

export type OperadorBinario = '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=' | '==' | '!=';

/** Referência a um vetor de tamanho fixo: pode acabar em memória global ou na pilha da função dona. */
export interface IRArranjoInfo {
    id: string;
    tamanho: number;
    tipoElemento: IRTipo;
}

export type IRInstrucao =
    | { op: 'const'; dst: string; valor: number | bigint | boolean }
    | { op: 'copia'; dst: string; src: IRValor }
    | { op: 'bin'; dst: string; operador: OperadorBinario; esquerda: IRValor; direita: IRValor }
    | { op: 'neg'; dst: string; src: IRValor }
    | { op: 'nao'; dst: string; src: IRValor }
    | { op: 'enderecoRotulo'; dst: string; rotulo: string }
    | { op: 'carregarGlobal'; dst: string; rotulo: string }
    | { op: 'armazenarGlobal'; rotulo: string; valor: IRValor }
    | { op: 'indiceLer'; dst: string; arranjo: string; indice: IRValor }
    | { op: 'indiceEscrever'; arranjo: string; indice: IRValor; valor: IRValor }
    | { op: 'chamada'; dst: string | null; rotulo: string; argumentos: IRValor[] }
    | { op: 'imprimirNumero'; valor: IRValor }
    | { op: 'imprimirTexto'; rotulo: string }
    | { op: 'lerEntradaTexto'; arranjo: string };

/** Nó phi: vive conceitualmente no topo do bloco, uma opção por predecessor. */
export interface IRPhi {
    dst: string;
    /** Nome pré-SSA da variável que este phi resolve (para renomeação/depuração). */
    variavel: string;
    opcoes: Array<{ predecessor: string; valor: IRValor }>;
}

export type IRTerminador =
    | { op: 'salto'; alvo: string }
    | { op: 'saltoCondicional'; condicao: IRValor; verdadeiro: string; falso: string }
    | { op: 'retorno'; valor?: IRValor };

export interface IRBloco {
    id: string;
    phis: IRPhi[];
    instrucoes: IRInstrucao[];
    terminador: IRTerminador;
    predecessores: string[];
    sucessores: string[];
}

export interface IRParametro {
    nome: string;
    registrador: string;
    tipo: IRTipo;
}

export interface IRFuncao {
    nome: string;
    parametros: IRParametro[];
    tipoRetorno: IRTipo;
    blocos: Map<string, IRBloco>;
    ordemBlocos: string[];
    blocoEntrada: string;
    /** Nomes pré-SSA (variáveis-fonte + temporários do compilador) declarados nesta função. */
    variaveisLocais: Set<string>;
    /** Vetores de tamanho fixo cuja área de armazenamento pertence ao frame desta função. */
    arranjosLocais: Map<string, IRArranjoInfo>;
    ehImplicitaTopo: boolean;
}

export interface IRPrograma {
    funcoes: IRFuncao[];
    globaisEscalares: Map<string, IRTipo>;
    globaisArranjos: Map<string, IRArranjoInfo>;
    /** rótulo -> conteúdo de literal de texto. */
    literaisTexto: Map<string, string>;
}

export function novoBloco(id: string): IRBloco {
    return {
        id,
        phis: [],
        instrucoes: [],
        terminador: { op: 'retorno' },
        predecessores: [],
        sucessores: [],
    };
}

export function novaFuncao(nome: string, ehImplicitaTopo: boolean): IRFuncao {
    return {
        nome,
        parametros: [],
        tipoRetorno: 'vazio',
        blocos: new Map(),
        ordemBlocos: [],
        blocoEntrada: '',
        variaveisLocais: new Set(),
        arranjosLocais: new Map(),
        ehImplicitaTopo,
    };
}
