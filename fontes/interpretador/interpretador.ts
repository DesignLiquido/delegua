import { AcessoMetodo, AcessoPropriedade } from "../construtos";
import { DeleguaModulo, MetodoPrimitiva, ObjetoDeleguaClasse } from "../estruturas";
import { VariavelInterface } from "../interfaces";
import { InterpretadorBase } from "./interpretador-base";

import primitivasDicionario from '../bibliotecas/primitivas-dicionario';
import primitivasNumero from '../bibliotecas/primitivas-numero';
import primitivasTexto from '../bibliotecas/primitivas-texto';
import primitivasVetor from '../bibliotecas/primitivas-vetor';

import tipoDeDadosPrimitivos from '../tipos-de-dados/primitivos';
import tipoDeDadosDelegua from '../tipos-de-dados/delegua';
import { inferirTipoVariavel } from "../inferenciador";
import { ErroEmTempoDeExecucao } from "../excecoes";

/**
 * O interpretador de Delégua.
 */
export class Interpretador extends InterpretadorBase {
    async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);
        
        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor.name === 'RetornoQuebra') {
            variavelObjeto = variavelObjeto.valor;
        }
        
        const objeto = variavelObjeto.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;
        
        // Outro caso que `instanceof` simplesmente não funciona para casos em Liquido,
        // então testamos também o nome do construtor.
        if (objeto instanceof ObjetoDeleguaClasse || objeto.constructor.name === 'ObjetoDeleguaClasse') {
            return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomeMetodo) || null;
        }
        
        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            const metodoDePrimitivaDicionario: Function = primitivasDicionario[expressao.nomeMetodo].implementacao;
            if (metodoDePrimitivaDicionario) {
                return new MetodoPrimitiva(objeto, metodoDePrimitivaDicionario);
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
            case tipoDeDadosDelegua.INTEIRO:
            case tipoDeDadosDelegua.NUMERO:
            case tipoDeDadosDelegua.NÚMERO:
                const metodoDePrimitivaNumero: Function = primitivasNumero[expressao.nomeMetodo].implementacao;
                if (metodoDePrimitivaNumero) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaNumero);
                }
                break;
            case tipoDeDadosDelegua.TEXTO:
                const metodoDePrimitivaTexto: Function = primitivasTexto[expressao.nomeMetodo].implementacao;
                if (metodoDePrimitivaTexto) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaTexto);
                }
                break;
            case tipoDeDadosDelegua.VETOR:
            case tipoDeDadosDelegua.VETOR_NUMERO:
            case tipoDeDadosDelegua.VETOR_NÚMERO:
            case tipoDeDadosDelegua.VETOR_TEXTO:
                const metodoDePrimitivaVetor: Function = primitivasVetor[expressao.nomeMetodo].implementacao;
                if (metodoDePrimitivaVetor) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaVetor);
                }
                break;
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `Método para objeto ou primitiva não encontrado: ${expressao.nomeMetodo}.`,
                expressao.linha
            )
        );
    }

    async visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> {
        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);
        
        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor.name === 'RetornoQuebra') {
            variavelObjeto = variavelObjeto.valor;
        }
        
        const objeto = variavelObjeto.hasOwnProperty('valor') ? variavelObjeto.valor : variavelObjeto;
        
        // Outro caso que `instanceof` simplesmente não funciona para casos em Liquido,
        // então testamos também o nome do construtor.
        if (objeto instanceof ObjetoDeleguaClasse || objeto.constructor.name === 'ObjetoDeleguaClasse') {
            return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomePropriedade) || null;
        }
        
        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            const metodoDePrimitivaDicionario: Function = primitivasDicionario[expressao.nomePropriedade].implementacao;
            if (metodoDePrimitivaDicionario) {
                return new MetodoPrimitiva(objeto, metodoDePrimitivaDicionario);
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

        // Como internamente um dicionário de Delégua é simplesmente um objeto de
        // JavaScript, as primitivas de dicionário, especificamente, são tratadas
        // mais acima.
        switch (tipoObjeto) {
            case tipoDeDadosDelegua.INTEIRO:
            case tipoDeDadosDelegua.NUMERO:
            case tipoDeDadosDelegua.NÚMERO:
                const metodoDePrimitivaNumero: Function = primitivasNumero[expressao.nomePropriedade].implementacao;
                if (metodoDePrimitivaNumero) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaNumero);
                }
                break;
            case tipoDeDadosDelegua.TEXTO:
                const metodoDePrimitivaTexto: Function = primitivasTexto[expressao.nomePropriedade].implementacao;
                if (metodoDePrimitivaTexto) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaTexto);
                }
                break;
            case tipoDeDadosDelegua.VETOR:
            case tipoDeDadosDelegua.VETOR_NUMERO:
            case tipoDeDadosDelegua.VETOR_NÚMERO:
            case tipoDeDadosDelegua.VETOR_TEXTO:
                const metodoDePrimitivaVetor: Function = primitivasVetor[expressao.nomePropriedade].implementacao;
                if (metodoDePrimitivaVetor) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaVetor);
                }
                break;
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `Método para objeto ou primitiva não encontrado: ${expressao.nomePropriedade}.`,
                expressao.linha
            )
        );
    }
}
