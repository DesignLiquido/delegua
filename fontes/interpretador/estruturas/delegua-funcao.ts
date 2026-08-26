import { Chamavel } from './chamavel';
import { EspacoMemoria } from '../espaco-memoria';
import { DescritorTipoClasse } from './descritor-tipo-classe';

import { InterpretadorInterface, ParametroInterface } from '../../interfaces';
import { RetornoQuebra } from '../../quebras';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';
import { ComentarioComoConstruto, FuncaoConstruto } from '../../construtos';
import { ArgumentoInterface } from '../argumento-interface';
import { PilhaEscoposExecucaoInterface } from '../../interfaces/pilha-escopos-execucao-interface';
import { Retorna } from '../../declaracoes';
import { inferirTipoVariavel } from '../../inferenciador';
import { ReferenciaMontao } from './referencia-montao';

/**
 * Converte um valor para `BigInt`, seguindo a mesma lógica usada por `longo()`
 * e pela conversão de variáveis com tipo explícito `longo` (ver `converterValor`
 * em `PilhaEscoposExecucao`). Não lança `ErroEmTempoDeExecucao` em caso de
 * texto inválido, apenas deixa `BigInt` lançar seu próprio erro nativo.
 * @param {any} valor O valor a ser convertido.
 * @returns {bigint} O valor convertido para `BigInt`.
 */
function converterParaLongo(valor: any): bigint {
    if (typeof valor === 'bigint') return valor;
    if (typeof valor === 'number') return globalThis.BigInt(Math.floor(valor));

    const strValue = String(valor).trim();
    if (!strValue) return globalThis.BigInt(0);

    return globalThis.BigInt(strValue.split('.')[0]);
}

/**
 * Qualquer função declarada em código é uma DeleguaFuncao.
 */
export class DeleguaFuncao extends Chamavel {
    nome: string | null;
    declaracao: FuncaoConstruto;
    eInicializador: boolean;
    instancia: any;
    documentacao?: ComentarioComoConstruto;
    /** Classe que declarou este método; usado para calcular a posição no OReM em chamadas a `super()`. */
    classeDefinidora: DescritorTipoClasse | null = null;

    constructor(
        nome: string | null,
        declaracao: FuncaoConstruto,
        instancia: any = undefined,
        eInicializador = false
    ) {
        super();
        this.nome = nome;
        this.declaracao = declaracao;
        this.instancia = instancia;
        this.eInicializador = eInicializador;
    }

    aridade(): number {
        return this.declaracao?.parametros?.filter((p) => p.abrangencia !== 'multiplo').length || 0;
    }

    /**
     * Método utilizado por Delégua para representar esta função quando impressa.
     * @returns {string} A representação da função como texto.
     */
    paraTexto(): string {
        if (!this.nome) return '<função />';
        let resultado = `<função nome=${this.nome}`;
        let parametros = '';
        let retorno = '';

        for (let parametro of this.declaracao.parametros) {
            parametros += `${parametro.nome.lexema}: ${parametro.tipoDado || 'qualquer'}, `;
        }

        if (this.declaracao.parametros.length > 0) {
            parametros = `argumentos=<${parametros.slice(0, -2)}>`;
        }

        const retorna = this.declaracao.corpo.filter((c) => c instanceof Retorna)[0];
        if (retorna instanceof Retorna) {
            const valor = retorna?.valor?.valor;
            retorno = `retorna=<${typeof valor === 'number' ? valor : `'${valor}'`}>`;
        }

        if (parametros) {
            resultado += ` ${parametros}`;
        }

        if (retorno) {
            resultado += ` ${retorno}`;
        }

        resultado += ' />';
        return resultado;
    }

    /**
     * Método utilizado pelo VSCode para inspecionar esta função em depuração.
     * @returns {string} A representação da função como texto.
     */
    toString(): string {
        return this.paraTexto();
    }

    private resolverParametrosEspalhados(
        argumentos: Array<ArgumentoInterface>,
        indiceArgumentoAtual: number
    ) {
        const argumentosResolvidos = [];
        for (let i = indiceArgumentoAtual; i < argumentos.length; i++) {
            const argumentoAtual = argumentos[i];
            argumentosResolvidos.push(
                argumentoAtual && argumentoAtual.hasOwnProperty('valor')
                    ? argumentoAtual.valor
                    : argumentoAtual
            );
        }

        return argumentosResolvidos;
    }

    protected async resolverAmbiente(
        visitante: InterpretadorInterface,
        argumentos: Array<ArgumentoInterface>
    ): Promise<EspacoMemoria> {
        const ambiente = new EspacoMemoria();
        const parametros = this.declaracao.parametros || [];

        for (let i = 0; i < parametros.length; i++) {
            const parametro = parametros[i];
            const nome = parametro['nome'].lexema;

            if (parametro.abrangencia === 'multiplo') {
                const argumentosResolvidos = this.resolverParametrosEspalhados(
                    argumentos,
                    i
                );

                // TODO: Verificar se `imutavel` é `true` aqui mesmo.
                ambiente.valores[nome] = {
                    tipo: 'vetor',
                    valor: argumentosResolvidos,
                    imutavel: true,
                };
            } else {
                let valorFinal: any;
                const argumento = argumentos[i];

                const valorExtraido = (argumento && argumento.hasOwnProperty('valor'))
                    ? argumento.valor
                    : argumento;

                if (
                    i < argumentos.length &&
                    valorExtraido !== undefined &&
                    valorExtraido !== null
                ) {
                    valorFinal = valorExtraido;
                } else if (parametro.valorPadrao) {
                    valorFinal = await visitante.avaliar(parametro.valorPadrao);
                } else {
                    valorFinal = null;
                }

                // Parâmetro anotado como `longo` deve receber o argumento como
                // `BigInt`, senão a anotação de tipo é apenas decorativa e a
                // aritmética dentro da função perde precisão (issue #1429).
                if (parametro.tipoDado === 'longo' && valorFinal !== null) {
                    valorFinal = converterParaLongo(valorFinal);
                }

                if (parametro.fixo) {
                    // Vetores e dicionários vivem no montão; `valorFinal` é apenas
                    // o ponteiro (`ReferenciaMontao`). É preciso congelar o valor
                    // real armazenado no montão, não o ponteiro em si.
                    if (valorFinal instanceof ReferenciaMontao) {
                        congelarProfundamente(visitante.resolverValor(valorFinal));
                    } else {
                        valorFinal = congelarProfundamente(valorFinal);
                    }
                }

                if (parametro.imutavel || parametro.fixo) {
                    ambiente.valores[nome] = {
                        valor: valorFinal,
                        tipo: inferirTipoVariavel(valorFinal),
                        imutavel: true,
                    };
                } else {
                    ambiente.valores[nome] = valorFinal;
                }

                // Se o argumento é `DeleguaFuncao`, para habilitar o recurso de _currying_,
                // copiamos seu valor para o escopo atual. Nem sempre podemos contar com a tipagem explícita aqui.
                if (
                    valorFinal &&
                    typeof valorFinal === 'object' &&
                    ['funcao', 'função'].includes(valorFinal.tipo)
                ) {
                    parametro.referencia = true;
                }
            }
        }

        return ambiente;
    }

    async chamar(
        visitante: InterpretadorInterface,
        argumentos: Array<ArgumentoInterface>
    ): Promise<any> {
        const ambiente = await this.resolverAmbiente(visitante, argumentos);

        if (this.instancia !== undefined) {
            ambiente.valores['isto'] = {
                valor: this.instancia,
                tipo:
                    this.instancia instanceof ObjetoDeleguaClasse
                        ? 'objeto'
                        : tipoDeDados(this.instancia),
                imutavel: false,
            };

            if (this.classeDefinidora) {
                ambiente.valores['classeExecutora'] = {
                    valor: this.classeDefinidora,
                    tipo: 'classe',
                    imutavel: true,
                };
            }
        }

        const interpretador = visitante as any;
        interpretador.proximoEscopo = 'funcao';

        // Rastrear a classe atual em execução para verificação de acesso.
        const classeAnteriorEmExecucao = interpretador.classeAtualEmExecucao;
        if (this.instancia instanceof ObjetoDeleguaClasse) {
            interpretador.classeAtualEmExecucao = this.instancia.classe;
        }

        let retornoBloco: any;
        try {
            retornoBloco = await interpretador.executarBloco(this.declaracao.corpo, ambiente);
        } finally {
            interpretador.classeAtualEmExecucao = classeAnteriorEmExecucao;
        }

        const referencias: { indice: number; parametro: ParametroInterface }[] =
            this.declaracao.parametros
                .map((p, indice) => {
                    if (p.referencia) {
                        return {
                            indice: indice,
                            parametro: p,
                        };
                    }
                })
                .filter((r) => r) as { indice: number; parametro: ParametroInterface }[];

        const pilha = interpretador.pilhaEscoposExecucao as PilhaEscoposExecucaoInterface;

        for (let referencia of referencias) {
            let argumentoReferencia = ambiente.valores[referencia.parametro.nome.lexema];

            pilha.definirVariavel(referencia.parametro.nome.lexema, argumentoReferencia.valor);
        }

        if (retornoBloco instanceof RetornoQuebra) {
            // Tipo de retorno `longo` também deve coagir o valor devolvido,
            // pelo mesmo motivo do parâmetro (issue #1429).
            if (this.declaracao.tipo === 'longo' && retornoBloco.valor !== null) {
                return converterParaLongo(retornoBloco.valor);
            }
            return retornoBloco.valor;
        }

        if (this.eInicializador) {
            return this.instancia;
        }

        return retornoBloco;
    }

    funcaoPorMetodoDeClasse(instancia: ObjetoDeleguaClasse): DeleguaFuncao {
        const funcao = new DeleguaFuncao(
            this.nome,
            this.declaracao,
            instancia,
            this.eInicializador
        );
        funcao.documentacao = this.documentacao;
        funcao.classeDefinidora = this.classeDefinidora;
        return funcao;
    }

    funcaoPorExtensao(valor: any): DeleguaFuncao {
        const funcao = new DeleguaFuncao(this.nome, this.declaracao, valor, false);
        funcao.documentacao = this.documentacao;
        return funcao;
    }
}

/**
 * Congela recursivamente vetores e objetos (dicionários), usados para
 * implementar parâmetros `fixo`: qualquer tentativa de mutação do valor,
 * mesmo através de um alias, deve resultar em erro em tempo de execução.
 * Não congela instâncias de classe, funções ou outras estruturas de Delégua,
 * pois isso quebraria comportamento esperado (ex.: métodos, `isto`).
 */
function congelarProfundamente<T>(valor: T): T {
    if (valor === null || typeof valor !== 'object') {
        return valor;
    }

    if (!Array.isArray(valor) && valor.constructor !== Object) {
        return valor;
    }

    if (Object.isFrozen(valor)) {
        return valor;
    }

    Object.freeze(valor);

    const valores: any[] = Array.isArray(valor) ? (valor as any) : Object.values(valor as any);
    for (const item of valores) {
        congelarProfundamente(item);
    }

    return valor;
}

/**
 * Mapeia o tipo JS de um valor primitivo para o nome de tipo de Delégua.
 */
function tipoDeDados(valor: any): string {
    if (Array.isArray(valor)) return 'vetor';
    switch (typeof valor) {
        case 'number':
        case 'bigint':
            return 'número';
        case 'string':
            return 'texto';
        case 'boolean':
            return 'lógico';
        default:
            return 'objeto';
    }
}
