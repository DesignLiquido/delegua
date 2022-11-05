import { Construto, Funcao } from '../../construtos';
import { Escreva, Declaracao, Enquanto, Para, Escolha, Fazer } from '../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

export class AvaliadorSintaticoBirl extends AvaliadorSintaticoBase {
    primario(): Construto {
        throw new Error('Method not implemented.');
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
