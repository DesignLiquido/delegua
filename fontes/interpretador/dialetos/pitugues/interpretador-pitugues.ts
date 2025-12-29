import {
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    AcessoIntervaloVariavel,
    TuplaN,
    Atribuir,
    Literal,
    AtribuicaoPorIndice,
    AcessoIndiceVariavel,
    Unario,
    Chamada
} from "../../../construtos";
import { Interpretador } from "../../interpretador";
import { ErroEmTempoDeExecucao } from '../../../excecoes';
import tiposDeSimbolos from '../../../tipos-de-simbolos/pitugues';

import * as comum from './comum';

export class InterpretadorPitugues extends Interpretador {
    override async visitarExpressaoUnaria(expressao: Unario): Promise<any> {
        // Tratamento especial para expressões unárias aplicadas a chamadas de método em literais numéricos.
        // Por exemplo: -5.absoluto() deve ser avaliado como (-5).absoluto(), não como -(5.absoluto())
        // Isso garante que o operador unário seja aplicado ao literal antes de chamar o método.
        if ((expressao.operador.tipo === tiposDeSimbolos.SUBTRACAO || expressao.operador.tipo === tiposDeSimbolos.ADICAO) &&
            expressao.operando instanceof Chamada) {

            const entidadeChamada = expressao.operando.entidadeChamada;

            // Verifica se é AcessoMetodo ou AcessoMetodoOuPropriedade
            if (entidadeChamada instanceof AcessoMetodo || entidadeChamada instanceof AcessoMetodoOuPropriedade) {
                const objetoAcesso = entidadeChamada.objeto;

                // Verifica se o objeto do método é um literal numérico
                if (objetoAcesso instanceof Literal && typeof objetoAcesso.valor === 'number') {
                    // Cria um novo literal com o sinal aplicado
                    const novoLiteral = new Literal(
                        objetoAcesso.hashArquivo,
                        objetoAcesso.linha,
                        expressao.operador.tipo === tiposDeSimbolos.SUBTRACAO ?
                            -objetoAcesso.valor :
                            +objetoAcesso.valor
                    );

                    // Cria um novo acesso com o literal modificado
                    let novoAcesso: AcessoMetodo | AcessoMetodoOuPropriedade;
                    if (entidadeChamada instanceof AcessoMetodo) {
                        novoAcesso = new AcessoMetodo(
                            entidadeChamada.hashArquivo,
                            novoLiteral,
                            entidadeChamada.nomeMetodo,
                            entidadeChamada.tipoRetornoMetodo
                        );
                    } else {
                        novoAcesso = new AcessoMetodoOuPropriedade(
                            entidadeChamada.hashArquivo,
                            novoLiteral,
                            entidadeChamada.simbolo
                        );
                    }

                    // Cria uma nova Chamada com o acesso modificado
                    const novaChamada = new Chamada(
                        expressao.operando.hashArquivo,
                        novoAcesso,
                        expressao.operando.argumentos
                    );

                    // Avalia a nova chamada
                    return await this.avaliar(novaChamada);
                }
            }
        }

        // Para outros casos, usa o comportamento padrão
        return await super.visitarExpressaoUnaria(expressao);
    }

    override async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        return comum.visitarExpressaoAcessoMetodo(this, expressao);
    }

    override async visitarExpressaoAcessoMetodoOuPropriedade(expressao: AcessoMetodoOuPropriedade): Promise<any> {
        return comum.visitarExpressaoAcessoMetodoOuPropriedade(this, expressao);
    }

    override async visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> {
        return comum.visitarExpressaoAcessoPropriedade(this, expressao);
    }

    override async visitarExpressaoAcessoIntervaloVariavel(expressao: AcessoIntervaloVariavel): Promise<any> {
        return comum.visitarExpressaoAcessoIntervaloVariavel(this, expressao);
    }

    async visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> {
        return comum.visitarExpressaoTuplaN(this, expressao);
    }

    override async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        const valor = await this.avaliar(expressao.valor);
        const valorResolvido = this.resolverValor(valor);
        let indice: any = null;

        if (expressao.indice) {
            indice = await this.avaliar(expressao.indice);
        }

        // Comportamento específico do Pituguês (LEGB - como Python):
        // Quando se faz uma atribuição dentro de uma função, SEMPRE tem que ser criada
        // uma variável local, a menos que a variável já exista no escopo atual.
        // Isso evita que atribuições dentro de funções modifiquem variáveis globais.
        if (expressao.alvo.constructor.name === 'Variavel') {
            const alvoVariavel = expressao.alvo as any;
            const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
            const nomeVariavel = alvoVariavel.simbolo.lexema;


            const variavelNoEscopoAtual = escopoAtual.espacoMemoria.valores[nomeVariavel];

            if (variavelNoEscopoAtual !== undefined) {
                this.pilhaEscoposExecucao.atribuirVariavel(
                    alvoVariavel.simbolo,
                    valorResolvido,
                    indice
                );
            } else {
                this.pilhaEscoposExecucao.definirVariavel(
                    nomeVariavel,
                    valorResolvido
                );
            }

            return valorResolvido;
        }

        // Para outros tipos de atribuição (propriedades, índices, etc.),
        // usa o comportamento padrão
        return super.visitarExpressaoDeAtribuicao(expressao);
    }

    override async visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> {
        const objeto = await this.avaliar(expressao.objeto);
        const objetoResolvido = this.resolverValor(objeto);

        if (objetoResolvido instanceof TuplaN || (objetoResolvido.tipo === 'tupla')) {
            throw new ErroEmTempoDeExecucao(
                (expressao.objeto as any).simbolo,
                'Não é possível modificar uma tupla. As tuplas são estruturas de dados imutáveis.',
                expressao.linha
            );
        }

        return super.visitarExpressaoAtribuicaoPorIndice(expressao);
    }

    override async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> {
        const objeto = await this.avaliar(expressao.entidadeChamada);
        const indice = await this.avaliar(expressao.indice);
        let valorIndice = this.resolverValor(indice);
        const objetoResolvido = this.resolverValor(objeto);

        if (objetoResolvido instanceof TuplaN) {
            if (!Number.isInteger(valorIndice)) {
                throw new ErroEmTempoDeExecucao(expressao.simboloFechamento, 'Índice deve ser inteiro.', expressao.linha);
            }

            if (valorIndice < 0 && objetoResolvido.elementos.length !== 0) {
                valorIndice += objetoResolvido.elementos.length;
            }

            if (valorIndice < 0 || valorIndice >= objetoResolvido.elementos.length) {
                throw new ErroEmTempoDeExecucao(expressao.simboloFechamento, 'Índice fora do intervalo.', expressao.linha);
            }

            const elemento = objetoResolvido.elementos[valorIndice];
            if (elemento instanceof Literal) return elemento.valor;
            return this.avaliar(elemento);
        }

        return super.visitarExpressaoAcessoIndiceVariavel(expressao);
    }
}
