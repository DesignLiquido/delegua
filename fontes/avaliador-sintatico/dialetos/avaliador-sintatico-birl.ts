import { Construto, Funcao, Literal, Variavel } from '../../construtos';
import { Escreva, Declaracao, Enquanto, Para, Escolha, Fazer } from '../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import tiposDeSimbolos from '../../tipos-de-simbolos/birl';
import { SimboloInterface } from '../../interfaces';

export class AvaliadorSintaticoBirl extends AvaliadorSintaticoBase {
    primario(): Construto {
        // Creio q isso e para fazer a criação de variaveis
        // mais não ha nenhum prefixo para criar variavel
        // nessa linguagem
        // acho q terei que pegar essa verificação com base no '='
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            return new Variavel(-1, this.simbolos[this.atual - 1]);
        }

        // não tenho certeza mais isso deve ser pra tipar a variavel criada a cima.
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.FR,
                tiposDeSimbolos.M1,
                tiposDeSimbolos.M2,
                tiposDeSimbolos.M3,
                tiposDeSimbolos.T,
                tiposDeSimbolos.TD,
                tiposDeSimbolos.BF
            )
        ) {
            const simboloAnterior: SimboloInterface = this.simbolos[this.atual - 1];
            return new Literal(-1, Number(simboloAnterior.linha), simboloAnterior.literal);
        }
    }
    chamar(): Construto {
        throw new Error('Method not implemented.');
    }
    atribuir(): Construto {
        throw new Error('Method not implemented.');
    }
    declaracaoEscreva(): Escreva {
        throw new Error('Method not implemented.');
    }
    blocoEscopo(): Declaracao[] {
        throw new Error('Method not implemented.');
    }
    declaracaoEnquanto(): Enquanto {
        throw new Error('Method not implemented.');
    }
    declaracaoPara(): Para {
        throw new Error('Method not implemented.');
    }
    declaracaoEscolha(): Escolha {
        throw new Error('Method not implemented.');
    }
    declaracaoFazer(): Fazer {
        throw new Error('Method not implemented.');
    }
    corpoDaFuncao(tipo: string): Funcao {
        throw new Error('Method not implemented.');
    }
    declaracao(): Declaracao {
        throw new Error('Method not implemented.');
    }
    analisar(retornoLexador: RetornoLexador, hashArquivo?: number): RetornoAvaliadorSintatico {
        throw new Error('Method not implemented.');
    }
}
