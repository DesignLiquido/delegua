import { Classe, Declaracao } from '../declaracoes';

export class TradutorAssemblyX64 {
    indentacao: number = 0;
    declaracoesDeClasses: Classe[];

    dicionarioConstrutos = {
        AcessoIndiceVariavel: this.traduzirAcessoIndiceVariavel.bind(this),
        AcessoMetodo: this.trazudirConstrutoAcessoMetodo.bind(this),
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        AtribuicaoPorIndice: this.traduzirConstrutoAtribuicaoPorIndice.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        FuncaoConstruto: this.traduzirFuncaoConstruto.bind(this),
        Isto: () => 'this',
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Logico: this.traduzirConstrutoLogico.bind(this),
        TipoDe: this.traduzirConstrutoTipoDe.bind(this),
        Unario: this.traduzirConstrutoUnario.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this),
    };

    dicionarioDeclaracoes = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        Continua: () => 'continue',
        Escolha: this.traduzirDeclaracaoEscolha.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        Fazer: this.traduzirDeclaracaoFazer.bind(this),
        Falhar: this.traduzirDeclaracaoFalhar.bind(this),
        FuncaoDeclaracao: this.traduzirDeclaracaoFuncao.bind(this),
        Importar: this.traduzirDeclaracaoImportar.bind(this),
        Leia: this.traduzirDeclaracaoLeia.bind(this),
        Para: this.traduzirDeclaracaoPara.bind(this),
        ParaCada: this.traduzirDeclaracaoParaCada.bind(this),
        Retorna: this.traduzirDeclaracaoRetorna.bind(this),
        Se: this.traduzirDeclaracaoSe.bind(this),
        Sustar: () => 'break',
        Classe: this.traduzirDeclaracaoClasse.bind(this),
        Tente: this.traduzirDeclaracaoTente.bind(this),
        Const: this.traduzirDeclaracaoConst.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
    };
    traduzirAcessoIndiceVariavel(): string {
        return '';
    }
    trazudirConstrutoAcessoMetodo(): string {
        return '';
    }
    traduzirConstrutoAgrupamento(): string {
        return '';
    }
    traduzirConstrutoAtribuicaoPorIndice(): string {
        return '';
    }
    traduzirConstrutoAtribuir(): string {
        return '';
    }
    traduzirConstrutoBinario(): string {
        return '';
    }
    traduzirConstrutoChamada(): string {
        return '';
    }
    traduzirConstrutoDefinirValor(): string {
        return '';
    }
    traduzirFuncaoConstruto(): string {
        return '';
    }
    traduzirConstrutoLiteral(): string {
        return '';
    }
    traduzirConstrutoLogico(): string {
        return '';
    }
    traduzirConstrutoTipoDe(): string {
        return '';
    }
    traduzirConstrutoUnario(): string {
        return '';
    }
    traduzirConstrutoVariavel(): string {
        return '';
    }
    traduzirConstrutoVetor(): string {
        return '';
    }
    traduzirDeclaracaoBloco(): string {
        return '';
    }
    traduzirDeclaracaoEnquanto(): string {
        return '';
    }
    traduzirDeclaracaoEscolha(): string {
        return '';
    }
    traduzirDeclaracaoExpressao(): string {
        return '';
    }
    traduzirDeclaracaoFazer(): string {
        return '';
    }
    traduzirDeclaracaoFalhar(): string {
        return '';
    }
    traduzirDeclaracaoFuncao(): string {
        return '';
    }
    traduzirDeclaracaoImportar(): string {
        return '';
    }
    traduzirDeclaracaoLeia(): string {
        return '';
    }
    traduzirDeclaracaoPara(): string {
        return '';
    }
    traduzirDeclaracaoParaCada(): string {
        return '';
    }
    traduzirDeclaracaoRetorna(): string {
        return '';
    }
    traduzirDeclaracaoSe(): string {
        return '';
    }
    traduzirDeclaracaoClasse(): string {
        return '';
    }
    traduzirDeclaracaoTente(): string {
        return '';
    }
    traduzirDeclaracaoConst(): string {
        return '';
    }
    traduzirDeclaracaoVar(): string {
        return '';
    }
    traduzirDeclaracaoEscreva(): string {
        return '';
    }

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';
        this.declaracoesDeClasses = declaracoes.filter((declaracao) => declaracao instanceof Classe) as Classe[];

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}
