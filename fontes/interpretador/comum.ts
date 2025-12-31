import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';

import { FuncaoPadrao } from './estruturas/funcao-padrao';

import * as bibliotecaGlobal from '../bibliotecas/biblioteca-global';
import { Leia } from '../construtos';

export function carregarBibliotecasGlobais(pilhaEscoposExecucao: PilhaEscoposExecucaoInterface) {
    pilhaEscoposExecucao.definirVariavel(
        'aleatorio',
        new FuncaoPadrao(1, bibliotecaGlobal.aleatorio)
    );

    pilhaEscoposExecucao.definirVariavel(
        'aleatorioEntre',
        new FuncaoPadrao(2, bibliotecaGlobal.aleatorioEntre)
    );

    pilhaEscoposExecucao.definirVariavel('algum', new FuncaoPadrao(2, bibliotecaGlobal.algum));

    pilhaEscoposExecucao.definirVariavel('clonar', new FuncaoPadrao(1, bibliotecaGlobal.clonar));

    pilhaEscoposExecucao.definirVariavel(
        'encontrar',
        new FuncaoPadrao(2, bibliotecaGlobal.encontrar)
    );

    pilhaEscoposExecucao.definirVariavel(
        'encontrarIndice',
        new FuncaoPadrao(2, bibliotecaGlobal.encontrarIndice)
    );

    pilhaEscoposExecucao.definirVariavel(
        'encontrarUltimo',
        new FuncaoPadrao(2, bibliotecaGlobal.encontrarUltimo)
    );

    pilhaEscoposExecucao.definirVariavel(
        'encontrarUltimoIndice',
        new FuncaoPadrao(2, bibliotecaGlobal.encontrarUltimoIndice)
    );

    pilhaEscoposExecucao.definirVariavel(
        'filtrarPor',
        new FuncaoPadrao(2, bibliotecaGlobal.filtrarPor)
    );

    pilhaEscoposExecucao.definirVariavel(
        'incluido',
        new FuncaoPadrao(2, bibliotecaGlobal.incluido)
    );

    pilhaEscoposExecucao.definirVariavel('inteiro', new FuncaoPadrao(1, bibliotecaGlobal.inteiro));

    pilhaEscoposExecucao.definirVariavel('intervalo', new FuncaoPadrao(2, bibliotecaGlobal.intervalo));

    pilhaEscoposExecucao.definirVariavel('mapear', new FuncaoPadrao(2, bibliotecaGlobal.mapear));

    pilhaEscoposExecucao.definirVariavel('maximo', new FuncaoPadrao(1, bibliotecaGlobal.maximo));

    pilhaEscoposExecucao.definirVariavel('minimo', new FuncaoPadrao(1, bibliotecaGlobal.minimo));

    pilhaEscoposExecucao.definirVariavel('numero', new FuncaoPadrao(1, bibliotecaGlobal.numero));
    pilhaEscoposExecucao.definirVariavel('número', new FuncaoPadrao(1, bibliotecaGlobal.numero));

    pilhaEscoposExecucao.definirVariavel('ordenar', new FuncaoPadrao(1, bibliotecaGlobal.ordenar));

    pilhaEscoposExecucao.definirVariavel(
        'paraCada',
        new FuncaoPadrao(2, bibliotecaGlobal.paraCada)
    );

    pilhaEscoposExecucao.definirVariavel(
        'primeiroEmCondicao',
        new FuncaoPadrao(2, bibliotecaGlobal.primeiroEmCondicao)
    );

    pilhaEscoposExecucao.definirVariavel('real', new FuncaoPadrao(1, bibliotecaGlobal.real));

    pilhaEscoposExecucao.definirVariavel('reduzir', new FuncaoPadrao(3, bibliotecaGlobal.reduzir));

    pilhaEscoposExecucao.definirVariavel('somar', new FuncaoPadrao(1, bibliotecaGlobal.somar));

    pilhaEscoposExecucao.definirVariavel('tamanho', new FuncaoPadrao(1, bibliotecaGlobal.tamanho));

    pilhaEscoposExecucao.definirVariavel('texto', new FuncaoPadrao(1, bibliotecaGlobal.texto));

    pilhaEscoposExecucao.definirVariavel(
        'todos',
        new FuncaoPadrao(2, bibliotecaGlobal.todosEmCondicao)
    );

    pilhaEscoposExecucao.definirVariavel(
        'todosEmCondicao',
        new FuncaoPadrao(2, bibliotecaGlobal.todosEmCondicao)
    );

    pilhaEscoposExecucao.definirVariavel('tupla', new FuncaoPadrao(1, bibliotecaGlobal.tupla));

    pilhaEscoposExecucao.definirVariavel('vetor', new FuncaoPadrao(1, bibliotecaGlobal.vetor));
}

export function pontoEntradaAjuda(funcao: boolean, topico: any) {
    if (!funcao) {
        return "Para usar a ajuda, use como uma função: ajuda(objeto).";
    }

    if (!topico) {
        return "Te damos as boas-vindas ao utilitário de ajuda de Delégua!\n\n" +
            "Use ajuda(objeto) para obter informações sobre um objeto, função, classe ou módulo.\n" +
            "Use ajuda('tópico') para obter informações sobre um tópico específico.\n\n";
    }

    return obterTopicoAjuda(topico);
}

export function obterTopicoAjuda(topico: any): string {
    switch (topico.constructor) {
        case Leia:
            return `A instrução 'leia' permite capturar a entrada do usuário durante a execução do programa. ` +
                `Você pode usar 'leia()' para ler uma linha de entrada do usuário e armazená-la em uma variável. ` +
                `Exemplo de uso:\n\n` +
                `\tvar minhaVariavel = leia()\n\n` +
                `Isto irá ler a entrada do usuário e atribuí-la à variável 'minhaVariavel'.`;

        case FuncaoPadrao:
            return obterAjudaFuncaoPadrao(topico);

        default:
            console.log(topico);
            return `Desculpe, não há documentação disponível para o tópico solicitado no momento.`;
    }
}

function obterAjudaFuncaoPadrao(funcaoPadrao: FuncaoPadrao): string {
    // Tentamos identificar a função pela aridade e pela implementação
    const aridade = funcaoPadrao.valorAridade;
    const implementacao = funcaoPadrao.funcao;

    // Mapeamento de funções por nome
    const nomeFuncao = Object.keys(bibliotecaGlobal).find(
        key => bibliotecaGlobal[key] === implementacao
    );

    if (!nomeFuncao) {
        return 'Função não identificada. Não há documentação disponível.';
    }

    switch (nomeFuncao) {
        case 'aleatorio':
            return `# aleatorio()\n\n` +
                `Retorna um número aleatório entre 0 e 1.\n\n` +
                `**Sintaxe:** aleatorio()\n\n` +
                `**Retorno:** Número real entre 0 (inclusivo) e 1 (exclusivo).\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeroSorteado = aleatorio()\n` +
                `\tescreva(numeroSorteado) // Pode retornar algo como 0.4829374657\n`;

        case 'aleatorioEntre':
            return `# aleatorioEntre(minimo, maximo)\n\n` +
                `Retorna um número aleatório inteiro de acordo com os parâmetros passados.\n` +
                `Mínimo (inclusivo) - Máximo (exclusivo).\n\n` +
                `**Sintaxe:** aleatorioEntre(minimo: número, maximo: número)\n\n` +
                `**Parâmetros:**\n` +
                `  - minimo: O valor mínimo (inclusivo)\n` +
                `  - maximo: O valor máximo (exclusivo)\n\n` +
                `**Retorno:** Número inteiro entre minimo e maximo-1.\n\n` +
                `**Exemplo:**\n` +
                `\tvar dado = aleatorioEntre(1, 7)\n` +
                `\tescreva(dado) // Retorna um número entre 1 e 6\n`;

        case 'algum':
            return `# algum(vetor, funcaoPesquisa)\n\n` +
                `Verifica se algum dos elementos do vetor satisfaz a condição definida pela função de pesquisa.\n\n` +
                `**Sintaxe:** algum(vetor: qualquer[], funcaoPesquisa: função)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcaoPesquisa: Função que recebe um elemento e retorna verdadeiro ou falso\n\n` +
                `**Retorno:** Verdadeiro se pelo menos um elemento satisfaz a condição, falso caso contrário.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = [1, 2, 3, 4, 5]\n` +
                `\tvar temPar = algum(numeros, funcao(n) { retorna n % 2 == 0 })\n` +
                `\tescreva(temPar) // verdadeiro\n`;

        case 'clonar':
            return `# clonar(valor)\n\n` +
                `Clona profundamente uma variável ou constante em Delégua, criando uma cópia independente.\n\n` +
                `**Sintaxe:** clonar(valor: qualquer)\n\n` +
                `**Parâmetros:**\n` +
                `  - valor: O valor a ser clonado (vetor, dicionário, objeto, tupla, etc.)\n\n` +
                `**Retorno:** Uma cópia profunda do valor fornecido.\n\n` +
                `**Exemplo:**\n` +
                `\tvar original = [1, 2, [3, 4]]\n` +
                `\tvar copia = clonar(original)\n` +
                `\tcopia[2][0] = 99\n` +
                `\tescreva(original[2][0]) // 3 (não foi modificado)\n` +
                `\tescreva(copia[2][0]) // 99\n`;

        case 'encontrar':
            return `# encontrar(vetor, funcaoPesquisa)\n\n` +
                `Encontra o primeiro elemento de um vetor cuja função de pesquisa retorne verdadeiro.\n\n` +
                `**Sintaxe:** encontrar(vetor: qualquer[], funcaoPesquisa: função)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcaoPesquisa: Função que recebe um elemento e retorna verdadeiro ou falso\n\n` +
                `**Retorno:** O primeiro elemento que satisfaz a condição, ou nulo se nenhum elemento for encontrado.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = [1, 3, 5, 8, 10]\n` +
                `\tvar primeiroPar = encontrar(numeros, funcao(n) { retorna n % 2 == 0 })\n` +
                `\tescreva(primeiroPar) // 8\n`;

        case 'encontrarIndice':
            return `# encontrarIndice(vetor, funcaoPesquisa)\n\n` +
                `Encontra o índice do primeiro elemento de um vetor cuja função de pesquisa retorne verdadeiro.\n\n` +
                `**Sintaxe:** encontrarIndice(vetor: qualquer[], funcaoPesquisa: função)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcaoPesquisa: Função que recebe um elemento e retorna verdadeiro ou falso\n\n` +
                `**Retorno:** O índice do primeiro elemento que satisfaz a condição, ou -1 se nenhum elemento for encontrado.\n\n` +
                `**Exemplo:**\n` +
                `\tvar frutas = ["maçã", "banana", "laranja"]\n` +
                `\tvar indice = encontrarIndice(frutas, funcao(f) { retorna f == "banana" })\n` +
                `\tescreva(indice) // 1\n`;

        case 'encontrarUltimo':
            return `# encontrarUltimo(vetor, funcaoPesquisa)\n\n` +
                `Encontra o último elemento de um vetor cuja função de pesquisa retorne verdadeiro.\n\n` +
                `**Sintaxe:** encontrarUltimo(vetor: qualquer[], funcaoPesquisa: função)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcaoPesquisa: Função que recebe um elemento e retorna verdadeiro ou falso\n\n` +
                `**Retorno:** O último elemento que satisfaz a condição, ou nulo se nenhum elemento for encontrado.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = [2, 4, 6, 7, 9]\n` +
                `\tvar ultimoPar = encontrarUltimo(numeros, funcao(n) { retorna n % 2 == 0 })\n` +
                `\tescreva(ultimoPar) // 6\n`;

        case 'encontrarUltimoIndice':
            return `# encontrarUltimoIndice(vetor, funcaoPesquisa)\n\n` +
                `Encontra o índice do último elemento de um vetor cuja função de pesquisa retorne verdadeiro.\n\n` +
                `**Sintaxe:** encontrarUltimoIndice(vetor: qualquer[], funcaoPesquisa: função)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcaoPesquisa: Função que recebe um elemento e retorna verdadeiro ou falso\n\n` +
                `**Retorno:** O índice do último elemento que satisfaz a condição, ou nulo se nenhum elemento for encontrado.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = [2, 4, 6, 7, 9]\n` +
                `\tvar indiceUltimoPar = encontrarUltimoIndice(numeros, funcao(n) { retorna n % 2 == 0 })\n` +
                `\tescreva(indiceUltimoPar) // 2\n`;

        case 'filtrarPor':
            return `# filtrarPor(vetor, funcaoFiltragem)\n\n` +
                `Cria um novo vetor com todos os elementos que passam no teste implementado pela função de filtragem.\n\n` +
                `**Sintaxe:** filtrarPor(vetor: qualquer[], funcaoFiltragem: função)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcaoFiltragem: Função que recebe um elemento e retorna verdadeiro ou falso\n\n` +
                `**Retorno:** Novo vetor contendo apenas os elementos que satisfazem a condição.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = [1, 2, 3, 4, 5, 6]\n` +
                `\tvar pares = filtrarPor(numeros, funcao(n) { retorna n % 2 == 0 })\n` +
                `\tescreva(pares) // [2, 4, 6]\n`;

        case 'incluido':
            return `# incluido(vetor, valor)\n\n` +
                `Verifica se um valor está incluído em um vetor.\n\n` +
                `**Sintaxe:** incluido(vetor: qualquer[], valor: qualquer)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - valor: O valor a ser procurado\n\n` +
                `**Retorno:** Verdadeiro se o valor estiver no vetor, falso caso contrário.\n\n` +
                `**Exemplo:**\n` +
                `\tvar frutas = ["maçã", "banana", "laranja"]\n` +
                `\tescreva(incluido(frutas, "banana")) // verdadeiro\n` +
                `\tescreva(incluido(frutas, "uva")) // falso\n`;

        case 'inteiro':
            return `# inteiro(valor)\n\n` +
                `Converte um valor em um número inteiro.\n\n` +
                `**Sintaxe:** inteiro(valor: número | texto)\n\n` +
                `**Parâmetros:**\n` +
                `  - valor: O valor a ser convertido (número ou texto)\n\n` +
                `**Retorno:** Número inteiro correspondente ao valor fornecido.\n\n` +
                `**Exemplo:**\n` +
                `\tescreva(inteiro(3.14)) // 3\n` +
                `\tescreva(inteiro("42")) // 42\n` +
                `\tescreva(inteiro("3.99")) // 3\n`;

        case 'intervalo':
            return `# intervalo(valorInicial, valorFinal)\n\n` +
                `Cria um vetor com números inteiros no intervalo especificado.\n` +
                `O valor inicial é inclusivo e o valor final é exclusivo.\n\n` +
                `**Sintaxe:** intervalo(valorInicial: número, valorFinal: número)\n\n` +
                `**Parâmetros:**\n` +
                `  - valorInicial: O valor inicial (inclusivo)\n` +
                `  - valorFinal: O valor final (exclusivo)\n\n` +
                `**Retorno:** Vetor com os números no intervalo especificado.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = intervalo(1, 6)\n` +
                `\tescreva(numeros) // [1, 2, 3, 4, 5]\n`;

        case 'mapear':
            return `# mapear(vetor, funcaoMapeamento)\n\n` +
                `Cria um novo vetor com os resultados da aplicação de uma função a cada elemento do vetor original.\n\n` +
                `**Sintaxe:** mapear(vetor: qualquer[], funcaoMapeamento: função)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcaoMapeamento: Função que recebe um elemento e retorna um novo valor\n\n` +
                `**Retorno:** Novo vetor com os valores transformados.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = [1, 2, 3, 4]\n` +
                `\tvar quadrados = mapear(numeros, funcao(n) { retorna n * n })\n` +
                `\tescreva(quadrados) // [1, 4, 9, 16]\n`;

        case 'maximo':
            return `# maximo(vetor)\n\nRetorna o maior valor encontrado em um vetor de números.`;

        case 'minimo':
            return `# minimo(vetor)\n\nRetorna o menor valor encontrado em um vetor de números.`;

        case 'numero':
            return `# numero(valor)\n\n` +
                `Converte um valor em um número (pode ter parte decimal).\n\n` +
                `**Sintaxe:** numero(valor: número | texto)\n\n` +
                `**Parâmetros:**\n` +
                `  - valor: O valor a ser convertido\n\n` +
                `**Retorno:** Número correspondente ao valor fornecido.\n\n` +
                `**Exemplo:**\n` +
                `\tescreva(numero("3.14")) // 3.14\n` +
                `\tescreva(numero("42")) // 42\n` +
                `\tescreva(numero(5)) // 5\n`;

        case 'ordenar':
            return `# ordenar(vetor)\n\n` +
                `Ordena os elementos de um vetor em ordem crescente (números) ou alfabética (textos).\n\n` +
                `**Sintaxe:** ordenar(vetor: qualquer[])\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n\n` +
                `**Retorno:** O mesmo vetor, agora ordenado.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = [5, 2, 8, 1, 9]\n` +
                `\tordenar(numeros)\n` +
                `\tescreva(numeros) // [1, 2, 5, 8, 9]\n`;

        case 'paraCada':
            return `# paraCada(vetor, funcao)\n\n` +
                `Executa uma função para cada elemento do vetor.\n\n` +
                `**Sintaxe:** paraCada(vetor: qualquer[], funcao: função)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcao: Função a ser executada para cada elemento\n\n` +
                `**Retorno:** Nenhum (undefined).\n\n` +
                `**Exemplo:**\n` +
                `\tvar nomes = ["Ana", "Bruno", "Carlos"]\n` +
                `\tparaCada(nomes, funcao(nome) {\n` +
                `\t\tescreva("Olá, " + nome)\n` +
                `\t})\n`;

        case 'primeiroEmCondicao':
            return `# primeiroEmCondicao(vetor, funcaoFiltragem)\n\n` +
                `Retorna o primeiro elemento que satisfaz a condição especificada pela função de filtragem.\n\n` +
                `**Sintaxe:** primeiroEmCondicao(vetor: qualquer[], funcaoFiltragem: função)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcaoFiltragem: Função que recebe um elemento e retorna verdadeiro ou falso\n\n` +
                `**Retorno:** O primeiro elemento que satisfaz a condição, ou undefined se nenhum for encontrado.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = [1, 3, 5, 8, 10]\n` +
                `\tvar resultado = primeiroEmCondicao(numeros, funcao(n) { retorna n > 5 })\n` +
                `\tescreva(resultado) // 8\n`;

        case 'real':
            return `# real(valor)\n\n` +
                `Converte um valor em um número real (ponto flutuante).\n\n` +
                `**Sintaxe:** real(valor: número | texto)\n\n` +
                `**Parâmetros:**\n` +
                `  - valor: O valor a ser convertido\n\n` +
                `**Retorno:** Número real correspondente ao valor fornecido.\n\n` +
                `**Exemplo:**\n` +
                `\tescreva(real("3.14")) // 3.14\n` +
                `\tescreva(real(42)) // 42.0\n`;

        case 'reduzir':
            return `# reduzir(vetor, funcaoReducao, valorInicial)\n\n` +
                `Aplica uma função a um acumulador e cada elemento do vetor para reduzi-lo a um único valor.\n\n` +
                `**Sintaxe:** reduzir(vetor: qualquer[], funcaoReducao: função, valorInicial?: qualquer)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcaoReducao: Função que recebe (acumulador, elemento) e retorna novo valor do acumulador\n` +
                `  - valorInicial: (Opcional) Valor inicial do acumulador\n\n` +
                `**Retorno:** Valor final do acumulador.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = [1, 2, 3, 4]\n` +
                `\tvar soma = reduzir(numeros, funcao(acc, n) { retorna acc + n }, 0)\n` +
                `\tescreva(soma) // 10\n`;

        case 'somar':
            return `# somar(vetor)\n\nRetorna a soma de todos os elementos de um vetor numérico.`;

        case 'tamanho':
            return `# tamanho(objeto)\n\n` +
                `Retorna o tamanho de um objeto (vetor, texto, função, etc.).\n\n` +
                `**Sintaxe:** tamanho(objeto: qualquer)\n\n` +
                `**Parâmetros:**\n` +
                `  - objeto: O objeto cujo tamanho será medido\n\n` +
                `**Retorno:** Para vetores e textos, retorna o número de elementos/caracteres. ` +
                `Para funções, retorna o número de parâmetros.\n\n` +
                `**Exemplo:**\n` +
                `\tescreva(tamanho([1, 2, 3])) // 3\n` +
                `\tescreva(tamanho("Delégua")) // 7\n`;

        case 'texto':
            return `# texto(valor)\n\n` +
                `Transforma o valor ou variável em texto.\n\n` +
                `**Sintaxe:** texto(valor: qualquer)\n\n` +
                `**Parâmetros:**\n` +
                `  - valor: O valor a ser convertido em texto\n\n` +
                `**Retorno:** Representação em texto do valor fornecido.\n\n` +
                `**Exemplo:**\n` +
                `\tescreva(texto(42)) // "42"\n` +
                `\tescreva(texto(verdadeiro)) // "verdadeiro"\n` +
                `\tescreva(texto([1, 2, 3])) // "[1, 2, 3]"\n`;

        case 'todosEmCondicao':
            return `# todosEmCondicao(vetor, funcaoCondicional)\n\n` +
                `Retorna verdadeiro se todos os elementos do vetor satisfazem a condição especificada pela função.\n\n` +
                `**Sintaxe:** todosEmCondicao(vetor: qualquer[], funcaoCondicional: função)\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor de elementos\n` +
                `  - funcaoCondicional: Função que recebe um elemento e retorna verdadeiro ou falso\n\n` +
                `**Retorno:** Verdadeiro se todos os elementos satisfazem a condição, falso caso contrário.\n\n` +
                `**Exemplo:**\n` +
                `\tvar numeros = [2, 4, 6, 8]\n` +
                `\tvar todosPares = todosEmCondicao(numeros, funcao(n) { retorna n % 2 == 0 })\n` +
                `\tescreva(todosPares) // verdadeiro\n`;

        case 'tupla':
            return `# tupla(vetor)\n\n` +
                `Transforma um vetor de elementos em uma tupla de N elementos, sendo N a largura do vetor.\n` +
                `Tuplas são estruturas imutáveis de tamanho fixo.\n\n` +
                `**Sintaxe:** tupla(vetor: qualquer[])\n\n` +
                `**Parâmetros:**\n` +
                `  - vetor: Um vetor com 2 a 10 elementos\n\n` +
                `**Retorno:** Uma tupla (Dupla, Trio, Quarteto, etc.) correspondente ao vetor.\n\n` +
                `**Exemplo:**\n` +
                `\tvar coordenadas = tupla([10, 20])\n` +
                `\tescreva(coordenadas.primeiro) // 10\n` +
                `\tescreva(coordenadas.segundo) // 20\n`;

        default:
            return `Função global identificada, mas documentação específica não disponível.\n` +
                `Aridade: ${aridade} parâmetro(s).`;
    }
}