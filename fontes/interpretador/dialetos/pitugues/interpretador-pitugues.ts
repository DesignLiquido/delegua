import { AcessoMetodo, AcessoMetodoOuPropriedade, AcessoPropriedade } from "../../../construtos";
import { ErroEmTempoDeExecucao } from "../../../excecoes";
import { inferirTipoVariavel } from "../../../inferenciador";
import { VariavelInterface, SimboloInterface } from "../../../interfaces";
import { RetornoQuebra } from "../../../quebras";
import { ObjetoDeleguaClasse, MetodoPrimitiva, DeleguaModulo } from "../../estruturas";
import { Interpretador } from "../../interpretador";

import primitivasDicionario from "../../../bibliotecas/primitivas-dicionario";
import primitivasNumero from "../../../bibliotecas/primitivas-numero";
import primitivasTexto from "../../../bibliotecas/primitivas-texto";
import primitivasVetor from "../../../bibliotecas/primitivas-vetor";

import tipoDeDadosPrimitivos from '../../../tipos-de-dados/primitivos';
import tipoDeDadosPitugues from '../../../tipos-de-dados/dialetos/pitugues';

export class InterpretadorPitugues extends Interpretador {
    override async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        const nomeObjeto = this.resolverNomeObjectoAcessado(expressao.objeto);

        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor && variavelObjeto.constructor === RetornoQuebra) {
            variavelObjeto = (variavelObjeto as RetornoQuebra).valor;
        }

        const objeto = this.resolverValor(variavelObjeto);

        if (objeto.constructor && objeto.constructor.name === 'ObjetoDeleguaClasse') {
            return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomeMetodo) || null;
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.nomeMetodo in primitivasDicionario) {
                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.nomeMetodo].implementacao;
                return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaDicionario);
            }

            return objeto[expressao.nomeMetodo] || null;
        }

        // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
        // Normalmente executam quando uma biblioteca é importada, e estamos tentando
        // obter alguma propriedade ou método desse objeto.

        // Caso 1: Função tradicional do JavaScript.
        if (typeof objeto[expressao.nomeMetodo] === tipoDeDadosPrimitivos.FUNCAO) {
            return objeto[expressao.nomeMetodo];
        }

        // Caso 2: Objeto tradicional do JavaScript.
        if (typeof objeto[expressao.nomeMetodo] === tipoDeDadosPrimitivos.OBJETO) {
            return objeto[expressao.nomeMetodo];
        }

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.nomeMetodo] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
        }

        // Como internamente um dicionário de Delégua é simplesmente um objeto de
        // JavaScript, as primitivas de dicionário, especificamente, são tratadas
        // mais acima.
        switch (tipoObjeto) {
            case tipoDeDadosPitugues.INTEIRO:
            case tipoDeDadosPitugues.NUMERO:
            case tipoDeDadosPitugues.NÚMERO:
                const metodoDePrimitivaNumero: Function =
                    primitivasNumero[expressao.nomeMetodo].implementacao;
                if (metodoDePrimitivaNumero) {
                    return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaNumero);
                }
                break;
            case tipoDeDadosPitugues.TEXTO:
                const metodoDePrimitivaTexto: Function =
                    primitivasTexto[expressao.nomeMetodo].implementacao;
                if (metodoDePrimitivaTexto) {
                    return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaTexto);
                }
                break;
            case tipoDeDadosPitugues.VETOR:
            case tipoDeDadosPitugues.VETOR_NUMERO:
            case tipoDeDadosPitugues.VETOR_NÚMERO:
            case tipoDeDadosPitugues.VETOR_TEXTO:
                const metodoDePrimitivaVetor: Function =
                    primitivasVetor[expressao.nomeMetodo].implementacao;
                if (metodoDePrimitivaVetor) {
                    return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaVetor);
                }
                break;
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: this.hashArquivoDeclaracaoAtual,
                    linha: this.linhaDeclaracaoAtual,
                } as SimboloInterface,
                `Método para objeto ou primitiva não encontrado: ${expressao.nomeMetodo}.`,
                expressao.linha
            )
        );
    }

    /**
     * Casos que ocorrem aqui:
     *
     * - Quando o método ou propriedade é ou 'qualquer', ou vetor
     *   de 'qualquer' ('qualquer[]'), e uma primitiva é usada.
     * - Quando o objeto é uma classe definida em código.
     * @param {AcessoMetodoOuPropriedade} expressao A expressão de acesso a método ou propriedade.
     * @returns A primitiva encontrada.
     */
    override async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> {
        const nomeObjeto = this.resolverNomeObjectoAcessado(expressao.objeto);
        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor === RetornoQuebra) {
            const retornoQuebra = variavelObjeto as RetornoQuebra;
            variavelObjeto = retornoQuebra.valor;
        }

        const objeto = this.resolverValor(variavelObjeto, true);

        if (objeto.constructor === ObjetoDeleguaClasse) {
            return (objeto as ObjetoDeleguaClasse).obter(expressao.simbolo);
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.simbolo.lexema in primitivasDicionario) {
                if (!(expressao.simbolo.lexema in primitivasNumero)) {
                    throw new ErroEmTempoDeExecucao(
                        expressao.simbolo,
                        `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo dicionário.`
                    );
                }

                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.simbolo.lexema].implementacao;
                return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaDicionario);
            }

            return objeto[expressao.simbolo.lexema];
        }

        // String do JavaScript, ou seja, primitiva de texto.
        if (objeto.constructor === String) {
            if (!(expressao.simbolo.lexema in primitivasTexto)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simbolo,
                    `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo texto.`
                );
            }

            const metodoDePrimitivaTexto: Function =
                primitivasTexto[expressao.simbolo.lexema].implementacao;
            return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaTexto);
        }

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.simbolo.lexema] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
        }

        // Como internamente um dicionário de Delégua é simplesmente um objeto de
        // JavaScript, as primitivas de dicionário, especificamente, são tratadas
        // mais acima.
        switch (tipoObjeto) {
            case tipoDeDadosPitugues.INTEIRO:
            case tipoDeDadosPitugues.NUMERO:
            case tipoDeDadosPitugues.NÚMERO:
                if (!(expressao.simbolo.lexema in primitivasNumero)) {
                    throw new ErroEmTempoDeExecucao(
                        expressao.simbolo,
                        `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo ${tipoObjeto}.`
                    );
                }

                const metodoDePrimitivaNumero: Function =
                    primitivasNumero[expressao.simbolo.lexema].implementacao;
                if (metodoDePrimitivaNumero) {
                    return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaNumero);
                }
                break;
            case tipoDeDadosPitugues.TEXTO:
                if (!(expressao.simbolo.lexema in primitivasTexto)) {
                    throw new ErroEmTempoDeExecucao(
                        expressao.simbolo,
                        `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo ${tipoObjeto}.`
                    );
                }

                const metodoDePrimitivaTexto: Function =
                    primitivasTexto[expressao.simbolo.lexema].implementacao;
                if (metodoDePrimitivaTexto) {
                    return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaTexto);
                }
                break;
            case tipoDeDadosPitugues.VETOR:
            case tipoDeDadosPitugues.VETOR_INTEIRO:
            case tipoDeDadosPitugues.VETOR_LOGICO:
            case tipoDeDadosPitugues.VETOR_LÓGICO:
            case tipoDeDadosPitugues.VETOR_NUMERO:
            case tipoDeDadosPitugues.VETOR_NÚMERO:
            case tipoDeDadosPitugues.VETOR_QUALQUER:
            case tipoDeDadosPitugues.VETOR_TEXTO:
                if (!(expressao.simbolo.lexema in primitivasVetor)) {
                    throw new ErroEmTempoDeExecucao(
                        expressao.simbolo,
                        `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo ${tipoObjeto}.`
                    );
                }

                const metodoDePrimitivaVetor: Function =
                    primitivasVetor[expressao.simbolo.lexema].implementacao;
                if (metodoDePrimitivaVetor) {
                    return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaVetor);
                }
                break;
        }

        // Objeto de uma classe JavaScript regular (ou seja, com construtor e propriedades)
        // que possua a propriedade.
        // Exemplos: classes de LinConEs, como `RetornoComando`, ou bibliotecas globais com objetos próprios.
        if (objeto.hasOwnProperty && objeto.hasOwnProperty(expressao.simbolo.lexema)) {
            return objeto[expressao.simbolo.lexema];
        }

        // Último caso: objeto simples, sem construtor, sem protótipo. Exemplo: {'a': 1, 'b': 2}
        if (typeof objeto[expressao.simbolo.lexema] !== 'undefined') {
            return objeto[expressao.simbolo.lexema];
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `Método ou propriedade para objeto ou primitiva não encontrado: ${expressao.simbolo.lexema}.`,
                expressao.linha
            )
        );
    }

    override async visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> {
        const nomeObjeto = this.resolverNomeObjectoAcessado(expressao.objeto);
        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor && variavelObjeto.constructor === RetornoQuebra) {
            variavelObjeto = (variavelObjeto as RetornoQuebra).valor;
        }

        const objeto = this.resolverValor(variavelObjeto);

        // Outro caso que `instanceof` simplesmente não funciona para casos em Liquido,
        // então testamos também o nome do construtor.
        if (
            objeto instanceof ObjetoDeleguaClasse ||
            (objeto.constructor && objeto.constructor.name === 'ObjetoDeleguaClasse')
        ) {
            return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomePropriedade) || null;
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.nomePropriedade in primitivasDicionario) {
                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.nomePropriedade].implementacao;
                return new MetodoPrimitiva(nomeObjeto, objeto, metodoDePrimitivaDicionario);
            }

            return objeto[expressao.nomePropriedade] || null;
        }

        // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
        // Normalmente executam quando uma biblioteca é importada, e estamos tentando
        // obter alguma propriedade ou método desse objeto.

        // Caso 1: Função tradicional do JavaScript.
        if (typeof objeto[expressao.nomePropriedade] === tipoDeDadosPrimitivos.FUNCAO) {
            return objeto[expressao.nomePropriedade];
        }

        // Caso 2: Objeto tradicional do JavaScript.
        if (typeof objeto[expressao.nomePropriedade] === tipoDeDadosPrimitivos.OBJETO) {
            return objeto[expressao.nomePropriedade];
        }

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.nomePropriedade] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `Propriedade para objeto ou primitiva não encontrado: ${expressao.nomePropriedade}.`,
                expressao.linha
            )
        );
    }
}