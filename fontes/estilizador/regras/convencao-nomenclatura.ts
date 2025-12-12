import { Declaracao } from '../../declaracoes';
import { Var, Const, FuncaoDeclaracao } from '../../declaracoes';
import { RegraEstilizacao } from '../../interfaces/estilizador-comum-interface';

/**
 * Opções de convenção de nomenclatura.
 */
export interface OpcoesConvencaoNomenclatura {
    /**
     * Convenção para variáveis.
     * - 'caixaCamelo': primeiraPalavraMinuscula
     * - 'caixa_cobra': primeira_palavra_minuscula
     * - 'CaixaPascal': PrimeiraPalavraMaiuscula
     */
    variavel?: 'caixaCamelo' | 'caixa_cobra' | 'CaixaPascal';

    /**
     * Convenção para constantes.
     * - 'CAIXA_ALTA': TODAS_MAIUSCULAS
     * - 'caixaCamelo': primeiraPalavraMinuscula
     */
    constante?: 'CAIXA_ALTA' | 'caixaCamelo';

    /**
     * Convenção para funções.
     * - 'caixaCamelo': primeiraPalavraMinuscula
     * - 'caixa_cobra': primeira_palavra_minuscula
     * - 'CaixaPascal': PrimeiraPalavraMaiuscula
     */
    funcao?: 'caixaCamelo' | 'caixa_cobra' | 'CaixaPascal';
}

/**
 * Regra que enforça convenções de nomenclatura.
 *
 * Exemplos:
 * - Variáveis em caixaCamelo: `var meuNome` (não `var MeuNome` ou `var meu_nome`)
 * - Constantes em CAIXA_ALTA: `constante PI_VALOR` (não `constante piValor`)
 * - Funções em caixaCamelo: `função calcularTotal()` (não `função CalcularTotal()`)
 */
export class RegraConvencaoNomenclatura implements RegraEstilizacao {
    nome = 'convencao-nomenclatura';
    descricao = 'Enforça convenções de nomenclatura para variáveis, constantes e funções';

    private opcoes: OpcoesConvencaoNomenclatura;

    constructor(opcoes: OpcoesConvencaoNomenclatura = {}) {
        this.opcoes = {
            variavel: opcoes.variavel || 'caixaCamelo',
            constante: opcoes.constante || 'CAIXA_ALTA',
            funcao: opcoes.funcao || 'caixaCamelo',
        };
    }

    aplicarEmDeclaracao(declaracao: Declaracao): Declaracao {
        // Valida/transforma nomes de variáveis
        if (declaracao instanceof Var) {
            return this.aplicarConvencaoVar(declaracao);
        }

        // Valida/transforma nomes de constantes
        if (declaracao instanceof Const) {
            return this.aplicarConvencaoConst(declaracao);
        }

        // Valida/transforma nomes de funções
        if (declaracao instanceof FuncaoDeclaracao) {
            return this.aplicarConvencaoFuncao(declaracao);
        }

        return declaracao;
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
                // Adiciona underscore antes de letras maiúsculas
                .replace(/([A-Z])/g, '_$1')
                .toLowerCase()
                // Remove underscores duplicados
                .replace(/__+/g, '_')
                // Remove underscore inicial se houver
                .replace(/^_/, '')
        );
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
