import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';

import { FuncaoPadrao } from '../estruturas/funcao-padrao';

import * as bibliotecaGlobal from '../bibliotecas/biblioteca-global';

export function carregarBibliotecasGlobais(pilhaEscoposExecucao: PilhaEscoposExecucaoInterface) {
    pilhaEscoposExecucao.definirVariavel('aleatorio', new FuncaoPadrao(1, bibliotecaGlobal.aleatorio));

    pilhaEscoposExecucao.definirVariavel('aleatorioEntre', new FuncaoPadrao(2, bibliotecaGlobal.aleatorioEntre));

    pilhaEscoposExecucao.definirVariavel('algum', new FuncaoPadrao(2, bibliotecaGlobal.algum));

    pilhaEscoposExecucao.definirVariavel('encontrar', new FuncaoPadrao(2, bibliotecaGlobal.encontrar));

    pilhaEscoposExecucao.definirVariavel('encontrarIndice', new FuncaoPadrao(2, bibliotecaGlobal.encontrarIndice));

    pilhaEscoposExecucao.definirVariavel('encontrarUltimo', new FuncaoPadrao(2, bibliotecaGlobal.encontrarUltimo));

    pilhaEscoposExecucao.definirVariavel(
        'encontrarUltimoIndice',
        new FuncaoPadrao(2, bibliotecaGlobal.encontrarUltimoIndice)
    );

    pilhaEscoposExecucao.definirVariavel('filtrarPor', new FuncaoPadrao(2, bibliotecaGlobal.filtrarPor));

    pilhaEscoposExecucao.definirVariavel('incluido', new FuncaoPadrao(2, bibliotecaGlobal.incluido));

    pilhaEscoposExecucao.definirVariavel('inteiro', new FuncaoPadrao(1, bibliotecaGlobal.inteiro));

    pilhaEscoposExecucao.definirVariavel('mapear', new FuncaoPadrao(2, bibliotecaGlobal.mapear));

    pilhaEscoposExecucao.definirVariavel('ordenar', new FuncaoPadrao(1, bibliotecaGlobal.ordenar));

    pilhaEscoposExecucao.definirVariavel('paraCada', new FuncaoPadrao(2, bibliotecaGlobal.paraCada));

    pilhaEscoposExecucao.definirVariavel(
        'primeiroEmCondicao',
        new FuncaoPadrao(2, bibliotecaGlobal.primeiroEmCondicao)
    );

    pilhaEscoposExecucao.definirVariavel('real', new FuncaoPadrao(1, bibliotecaGlobal.real));

    pilhaEscoposExecucao.definirVariavel('reduzir', new FuncaoPadrao(3, bibliotecaGlobal.reduzir));

    pilhaEscoposExecucao.definirVariavel('tamanho', new FuncaoPadrao(1, bibliotecaGlobal.tamanho));

    pilhaEscoposExecucao.definirVariavel('texto', new FuncaoPadrao(1, bibliotecaGlobal.texto));

    pilhaEscoposExecucao.definirVariavel('todos', new FuncaoPadrao(2, bibliotecaGlobal.todosEmCondicao));

    pilhaEscoposExecucao.definirVariavel('todosEmCondicao', new FuncaoPadrao(2, bibliotecaGlobal.todosEmCondicao));

    pilhaEscoposExecucao.definirVariavel('tupla', new FuncaoPadrao(1, bibliotecaGlobal.tupla));
}
