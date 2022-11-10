import { ErroEmTempoDeExecucao } from '../excecoes';
import { DeleguaFuncao } from '../estruturas/funcao';
import { ObjetoDeleguaClasse } from '../estruturas/objeto-delegua-classe';
import { FuncaoPadrao } from '../estruturas/funcao-padrao';
import { DeleguaClasse } from '../estruturas/delegua-classe';
import { InterpretadorInterface, VariavelInterface } from '../interfaces';
import { PilhaEscoposExecucaoInterface } from '../interfaces/pilha-escopos-execucao-interface';

export default function (
    interpretador: InterpretadorInterface,
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface
) {
    // Retorna um número aleatório entre 0 e 1.
    pilhaEscoposExecucao.definirVariavel(
        'aleatorio',
        new FuncaoPadrao(1, function () {
            return Math.random();
        })
    );

    // Retorna um número aleatório de acordo com o parâmetro passado.
    // Mínimo(inclusivo) - Máximo(exclusivo)
    pilhaEscoposExecucao.definirVariavel(
        'aleatorioEntre',
        new FuncaoPadrao(1, function (
            minimo: VariavelInterface | number,
            maximo: VariavelInterface | number
        ) {
            const valorMinimo = minimo.hasOwnProperty('valor')
                ? (minimo as VariavelInterface).valor
                : minimo;
            const valorMaximo = maximo.hasOwnProperty('valor')
                ? (maximo as VariavelInterface).valor
                : maximo;
            if (
                typeof valorMinimo !== 'number' ||
                typeof valorMaximo !== 'number'
            ) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Os dois parâmetros devem ser do tipo número.'
                );
            }

            return (
                Math.floor(Math.random() * (valorMaximo - valorMinimo)) +
                valorMinimo
            );
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'inteiro',
        new FuncaoPadrao(1, function (numero: VariavelInterface | any) {
            if (numero === null || numero === undefined) return 0;
            const valor = numero.hasOwnProperty('valor')
                ? numero.valor
                : numero;
            if (isNaN(valor)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Valor não parece ser um número. Somente números ou textos com números podem ser convertidos para inteiro.'
                );
            }

            if (!/^(-)?\d+(\.\d+)?$/.test(valor)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Valor não parece estar estruturado como um número (texto vazio, falso ou não definido). Somente números ou textos com números podem ser convertidos para inteiro.'
                );
            }

            return parseInt(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'mapear',
        new FuncaoPadrao(1, function (
            vetor: VariavelInterface | any,
            funcaoMapeamento: VariavelInterface | any
        ) {
            const valorVetor = vetor.hasOwnProperty('valor')
                ? vetor.valor
                : vetor;
            const valorFuncaoMapeamento = funcaoMapeamento.hasOwnProperty(
                'valor'
            )
                ? funcaoMapeamento.valor
                : funcaoMapeamento;
            if (!Array.isArray(valorVetor)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função mapear() deve ser um vetor.'
                );
            }

            if (valorFuncaoMapeamento.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função mapear() deve ser uma função.'
                );
            }

            const resultados = [];
            for (let indice = 0; indice < valorVetor.length; ++indice) {
                resultados.push(
                    valorFuncaoMapeamento.chamar(interpretador, [
                        valorVetor[indice],
                    ])
                );
            }

            return resultados;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'todosEmCondicao',
        new FuncaoPadrao(1, function (
            vetor: VariavelInterface | any,
            funcaoCondicional: VariavelInterface | any
        ) {
            const valorVetor = vetor.hasOwnProperty('valor')
                ? vetor.valor
                : vetor;
            const valorFuncaoCondicional = funcaoCondicional.hasOwnProperty(
                'valor'
            )
                ? funcaoCondicional.valor
                : funcaoCondicional;
            if (!Array.isArray(valorVetor)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função todosEmCondicao() deve ser um vetor.'
                );
            }

            if (valorFuncaoCondicional.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função todosEmCondicao() deve ser uma função.'
                );
            }

            for (let indice = 0; indice < valorVetor.length; ++indice) {
                if (
                    !valorFuncaoCondicional.chamar(interpretador, [
                        valorVetor[indice],
                    ])
                )
                    false;
            }
            return true;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'filtrarPor',
        new FuncaoPadrao(1, function (
            vetor: VariavelInterface | any,
            funcaoFiltragem: VariavelInterface | any
        ) {
            const valorVetor = vetor.hasOwnProperty('valor')
                ? vetor.valor
                : vetor;
            const valorFuncaoFiltragem = funcaoFiltragem.hasOwnProperty('valor')
                ? funcaoFiltragem.valor
                : funcaoFiltragem;
            if (!Array.isArray(valorVetor)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função filtrarPor() deve ser um vetor.'
                );
            }

            if (valorFuncaoFiltragem.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função filtrarPor() deve ser uma função.'
                );
            }

            const resultados = [];
            for (let indice = 0; indice < valorVetor.length; ++indice) {
                valorFuncaoFiltragem.chamar(interpretador, [
                    valorVetor[indice],
                ]) &&
                    resultados.push(
                        valorFuncaoFiltragem.chamar(interpretador, [
                            valorVetor[indice],
                        ])
                    );
            }

            return resultados;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'primeiroEmCondicao',
        new FuncaoPadrao(1, function (
            vetor: VariavelInterface | any,
            funcaoFiltragem: VariavelInterface | any
        ) {
            const valorVetor = vetor.hasOwnProperty('valor')
                ? vetor.valor
                : vetor;
            const valorFuncaoFiltragem = funcaoFiltragem.hasOwnProperty('valor')
                ? funcaoFiltragem.valor
                : funcaoFiltragem;
            if (!Array.isArray(valorVetor)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função primeiroEmCondicao() deve ser um vetor.'
                );
            }

            if (valorFuncaoFiltragem.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função primeiroEmCondicao() deve ser uma função.'
                );
            }

            const resultados = [];
            for (let indice = 0; indice < valorVetor.length; ++indice) {
                valorFuncaoFiltragem.chamar(interpretador, [
                    valorVetor[indice],
                ]) &&
                    resultados.push(
                        valorFuncaoFiltragem.chamar(interpretador, [
                            valorVetor[indice],
                        ])
                    );
            }

            return resultados[0];
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'paraCada',
        new FuncaoPadrao(1, function (
            vetor: VariavelInterface | any,
            funcaoFiltragem: VariavelInterface | any
        ) {
            const valorVetor = vetor.hasOwnProperty('valor')
                ? vetor.valor
                : vetor;
            const valorFuncaoFiltragem = funcaoFiltragem.hasOwnProperty('valor')
                ? funcaoFiltragem.valor
                : funcaoFiltragem;
            if (!Array.isArray(valorVetor)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O primeiro parâmetro da função paraCada() deve ser um vetor.'
                );
            }

            if (valorFuncaoFiltragem.constructor.name !== 'DeleguaFuncao') {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Parâmetro inválido. O segundo parâmetro da função paraCada() deve ser uma função.'
                );
            }

            for (let indice = 0; indice < valorVetor.length; ++indice) {
                valorFuncaoFiltragem.chamar(interpretador, [
                    valorVetor[indice],
                ]);
            }
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'ordenar',
        new FuncaoPadrao(1, function (vetor: VariavelInterface | Array<any>) {
            const objeto = vetor.hasOwnProperty('valor')
                ? (vetor as VariavelInterface).valor
                : vetor;
            if (!Array.isArray(objeto)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Valor inválido. Objeto inserido não é um vetor.'
                );
            }

            let trocado: boolean;
            const tamanho = objeto.length;
            do {
                trocado = false;
                for (let i = 0; i < tamanho - 1; i++) {
                    if (objeto[i] > objeto[i + 1]) {
                        [objeto[i], objeto[i + 1]] = [objeto[i + 1], objeto[i]];
                        trocado = true;
                    }
                }
            } while (trocado);
            return objeto;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'real',
        new FuncaoPadrao(1, function (numero: VariavelInterface | any) {
            const valor = numero.hasOwnProperty('valor')
                ? numero.valor
                : numero;
            if (!/^(-)?\d+(\.\d+)?$/.test(valor)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Valor não parece estar estruturado como um número (texto/valor vazio, falso ou não definido). Somente números ou textos com números podem ser convertidos para real.'
                );
            }
            return parseFloat(valor);
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'tamanho',
        new FuncaoPadrao(1, function (objeto: any) {
            const valorObjeto = objeto.hasOwnProperty('valor')
                ? objeto.valor
                : objeto;
            if (!isNaN(valorObjeto)) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Não é possível encontrar o tamanho de um número.'
                );
            }

            if (valorObjeto instanceof ObjetoDeleguaClasse) {
                throw new ErroEmTempoDeExecucao(
                    this.simbolo,
                    'Você não pode encontrar o tamanho de uma declaração.'
                );
            }

            if (valorObjeto instanceof DeleguaFuncao) {
                return valorObjeto.declaracao.parametros.length;
            }

            if (valorObjeto instanceof FuncaoPadrao) {
                return valorObjeto.valorAridade;
            }

            if (valorObjeto instanceof DeleguaClasse) {
                const metodos = valorObjeto.metodos;
                let tamanho = 0;

                if (
                    metodos.inicializacao &&
                    metodos.inicializacao.eInicializador
                ) {
                    tamanho =
                        metodos.inicializacao.declaracao.parametros.length;
                }

                return tamanho;
            }

            return valorObjeto.length;
        })
    );

    pilhaEscoposExecucao.definirVariavel(
        'texto',
        new FuncaoPadrao(1, function (
            valorOuVariavel: VariavelInterface | any
        ) {
            return `${
                valorOuVariavel.hasOwnProperty('valor')
                    ? valorOuVariavel.valor
                    : valorOuVariavel
            }`;
        })
    );

    return pilhaEscoposExecucao;
}
