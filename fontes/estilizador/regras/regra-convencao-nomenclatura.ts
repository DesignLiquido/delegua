import { Declaracao } from '../../declaracoes';
import { Var, Const, FuncaoDeclaracao } from '../../declaracoes';
import { Construto } from '../../construtos';
import {
    OpcoesConvencaoNomenclaturaInterface,
    RegraEstilizacaoInterface,
} from '../../interfaces/estilizador';

/**
 * Regra que enforça convenções de nomenclatura.
 *
 * Exemplos:
 * - Variáveis em caixaCamelo: `var meuNome` (não `var MeuNome` ou `var meu_nome`)
 * - Constantes em CAIXA_ALTA: `constante PI_VALOR` (não `constante piValor`)
 * - Funções em caixaCamelo: `função calcularTotal()` (não `função CalcularTotal()`)
 */
export class RegraConvencaoNomenclatura implements RegraEstilizacaoInterface {
    nome = 'convencao-nomenclatura';
    descricao = 'Enforça convenções de nomenclatura para variáveis, constantes e funções';

    private opcoes: OpcoesConvencaoNomenclaturaInterface;

    constructor(opcoes: OpcoesConvencaoNomenclaturaInterface = {}) {
        this.opcoes = {
            variavel: opcoes.variavel || 'caixaCamelo',
            constante: opcoes.constante || 'CAIXA_ALTA',
            funcao: opcoes.funcao || 'caixaCamelo',
        };
    }

    aplicarEmDeclaracao(declaracao: Declaracao): Declaracao {
        this.visitarObjeto(declaracao, new Set<any>());
        return declaracao;
    }

    aplicarEmConstruto(construto: Construto): Construto {
        this.visitarObjeto(construto, new Set<any>());
        return construto;
    }

    /**
     * Aplica convenção em declaração Var.
     */
    private aplicarConvencaoVar(declaracao: Var): Var {
        if (!this.opcoes.variavel) return declaracao;

        const nomeAtual = declaracao.simbolo.lexema;
        const nomeConvertido = this.converterNome(nomeAtual, this.opcoes.variavel);

        if (nomeAtual !== nomeConvertido) {
            declaracao.simbolo.lexema = nomeConvertido;
        }

        return declaracao;
    }

    /**
     * Aplica convenção em declaração Const.
     */
    private aplicarConvencaoConst(declaracao: Const): Const {
        if (!this.opcoes.constante) return declaracao;

        const nomeAtual = declaracao.simbolo.lexema;
        const nomeConvertido = this.converterNome(nomeAtual, this.opcoes.constante);

        if (nomeAtual !== nomeConvertido) {
            declaracao.simbolo.lexema = nomeConvertido;
        }

        return declaracao;
    }

    /**
     * Aplica convenção em declaração de Função.
     */
    private aplicarConvencaoFuncao(declaracao: FuncaoDeclaracao): FuncaoDeclaracao {
        if (!this.opcoes.funcao) return declaracao;

        const nomeAtual = declaracao.simbolo.lexema;
        const nomeConvertido = this.converterNome(nomeAtual, this.opcoes.funcao);

        if (nomeAtual !== nomeConvertido) {
            declaracao.simbolo.lexema = nomeConvertido;
        }

        return declaracao;
    }

    /**
     * Converte um nome para a convenção especificada.
     */
    private converterNome(nome: string, convencao: string): string {
        switch (convencao) {
            case 'caixaCamelo':
                return this.paraCamelCase(nome);
            case 'caixa_cobra':
                return this.paraSnakeCase(nome);
            case 'CaixaPascal':
                return this.paraPascalCase(nome);
            case 'CAIXA_ALTA':
                return this.paraUpperCase(nome);
            default:
                return nome;
        }
    }

    /**
     * Converte nome para camelCase.
     */
    private paraCamelCase(nome: string): string {
        // Se tem underscores, divide por eles
        if (nome.includes('_')) {
            const palavras = nome.split(/[_\s]+/);
            return (
                palavras[0].toLowerCase() +
                palavras
                    .slice(1)
                    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
                    .join('')
            );
        }

        // Se está em PascalCase, converte para camelCase
        if (nome.charAt(0) === nome.charAt(0).toUpperCase()) {
            return nome.charAt(0).toLowerCase() + nome.slice(1);
        }

        // Já está em camelCase
        return nome;
    }

    /**
     * Converte nome para snake_case.
     */
    private paraSnakeCase(nome: string): string {
        return (
            nome
                // Separa limites entre minúsculas/dígitos e maiúsculas.
                .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
                // Separa blocos maiúsculos quando o último inicia uma palavra normal.
                .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                .replace(/[\s-]+/g, '_')
                .toLowerCase()
                // Remove underscores duplicados
                .replace(/__+/g, '_')
                // Remove underscore inicial se houver
                .replace(/^_/, '')
        );
    }

    private visitarObjeto(objeto: unknown, visitados: Set<any>): void {
        if (!objeto || typeof objeto !== 'object' || visitados.has(objeto)) {
            return;
        }

        visitados.add(objeto);

        if (objeto instanceof Var) {
            this.aplicarConvencaoVar(objeto);
        } else if (objeto instanceof Const) {
            this.aplicarConvencaoConst(objeto);
        } else if (objeto instanceof FuncaoDeclaracao) {
            this.aplicarConvencaoFuncao(objeto);
        }

        if (Array.isArray(objeto)) {
            for (const item of objeto) {
                this.visitarObjeto(item, visitados);
            }
            return;
        }

        for (const valor of Object.values(objeto as Record<string, unknown>)) {
            this.visitarObjeto(valor, visitados);
        }
    }

    /**
     * Converte nome para PascalCase.
     */
    private paraPascalCase(nome: string): string {
        const palavras = nome.split(/[_\s]+/);
        return palavras.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
    }

    /**
     * Converte nome para UPPER_CASE.
     */
    private paraUpperCase(nome: string): string {
        return this.paraSnakeCase(nome).toUpperCase();
    }

    /**
     * Valida se um nome está na convenção especificada.
     */
    validarNome(nome: string, convencao: string): boolean {
        return nome === this.converterNome(nome, convencao);
    }
}
