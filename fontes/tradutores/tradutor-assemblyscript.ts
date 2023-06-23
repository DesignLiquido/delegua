import { Literal } from '../construtos';
import {
    Classe, Declaracao, Escreva, Var
} from '../declaracoes';

export class TradutorAssemblyScript {
    indentacao: number = 0;
    declaracoesDeClasses: Classe[];

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): string {
        let resultado = 'console.log(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `'${literal.valor}'`;
        return literal.valor;
    }

    resolveTipoDeclaracaoVar(literal: Literal): string {
        switch(typeof literal.valor){
            case 'string':
                return ': string'
            case 'number':
                return ': f64'
            case 'boolean':
                return ': bool'
            case 'bigint':
                return ': i64'
            case 'function':
            case 'object':
            case 'undefined':
            default:
                return ''
        }
    }

    traduzirDeclaracaoVar(declaracaoVar: Var): string {
        let resultado = 'let ';
        resultado += declaracaoVar.simbolo.lexema;
        if (!declaracaoVar?.inicializador) resultado += ';';
        else {
            resultado += this.resolveTipoDeclaracaoVar(declaracaoVar.inicializador as Literal)
            resultado += ' = ';
            if (this.dicionarioConstrutos[declaracaoVar.inicializador.constructor.name]) {
                resultado += this.dicionarioConstrutos[declaracaoVar.inicializador.constructor.name](
                    declaracaoVar.inicializador
                );
            } else {
                resultado += this.dicionarioDeclaracoes[declaracaoVar.inicializador.constructor.name](
                    declaracaoVar.inicializador
                );
            }
            resultado += ';';
        }
        return resultado;
    }

    dicionarioConstrutos = {
        // AcessoIndiceVariavel: this.traduzirAcessoIndiceVariavel.bind(this),
        // AcessoMetodo: this.trazudirConstrutoAcessoMetodo.bind(this),
        // Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        // AtribuicaoPorIndice: this.traduzirConstrutoAtribuicaoPorIndice.bind(this),
        // Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        // Binario: this.traduzirConstrutoBinario.bind(this),
        // Chamada: this.traduzirConstrutoChamada.bind(this),
        // DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        // FuncaoConstruto: this.traduzirFuncaoConstruto.bind(this),
        Isto: () => 'this',
        Literal: this.traduzirConstrutoLiteral.bind(this),
        // Logico: this.traduzirConstrutoLogico.bind(this),
        // TipoDe: this.traduzirConstrutoTipoDe.bind(this),
        // Unario: this.traduzirConstrutoUnario.bind(this),
        // Variavel: this.traduzirConstrutoVariavel.bind(this),
        // Vetor: this.traduzirConstrutoVetor.bind(this),
    };

    dicionarioDeclaracoes = {
        // Bloco: this.traduzirDeclaracaoBloco.bind(this),
        // Classe: this.traduzirDeclaracaoClasse.bind(this),
        // Const : this.traduzirDeclaracaoConst.bind(this),
        Continua: () => 'continue',
        // Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        // Escolha: this.traduzirDeclaracaoEscolha.bind(this),
        // Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        // Fazer: this.traduzirDeclaracaoFazer.bind(this),
        // Falhar: this.traduzirDeclaracaoFalhar.bind(this),
        // FuncaoDeclaracao: this.traduzirDeclaracaoFuncao.bind(this),
        // Importar: this.traduzirDeclaracaoImportar.bind(this),
        // Leia: this.traduzirDeclaracaoLeia.bind(this),
        // Para: this.traduzirDeclaracaoPara.bind(this),
        // ParaCada: this.traduzirDeclaracaoParaCada.bind(this),
        // Retorna: this.traduzirDeclaracaoRetorna.bind(this),
        // Se: this.traduzirDeclaracaoSe.bind(this),
        // Sustar: () => 'break',
        // Tente: this.traduzirDeclaracaoTente.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
    };

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';

        this.declaracoesDeClasses = declaracoes.filter((declaracao) => declaracao instanceof Classe) as Classe[];

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}