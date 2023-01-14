import { Construto, FuncaoConstruto } from '../../construtos';
import { Escreva, Declaracao, Enquanto, Para, Escolha, Fazer, Se } from '../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';

import tiposDeSimbolos from '../../tipos-de-simbolos/birl';

export class AvaliadorSintaticoBirl extends AvaliadorSintaticoBase {
    validarSegmentoHoraDoShow(): void {
        this.consumir(tiposDeSimbolos.HORA, 'Esperado expressão `HORA DO SHOW` para iniciar o programa');
        this.consumir(tiposDeSimbolos.DO, 'Esperado expressão `HORA DO SHOW` para iniciar o programa');
        this.consumir(tiposDeSimbolos.SHOW, 'Esperado expressão `HORA DO SHOW` para iniciar o programa');
        this.blocos += 1;
    }

    validarSegmentoBirlFinal(): void {
        this.consumir(tiposDeSimbolos.BIRL, 'Esperado expressão `BIRL` para fechamento do programa');
        this.blocos -= 1;
    }

    primario(): Construto {
        throw new Error('Method not implemented');
    }

    chamar(): Construto {
        return this.primario();
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

    declaracaoSe(): Se {
        throw new Error('Method not implemented.');
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        throw new Error('Method not implemented.');
    }

    declaracao(): Declaracao {
        throw new Error('Method not implemented.');
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo?: number): RetornoAvaliadorSintatico {
        this.blocos = 0;

        // 1 validação
        if (this.blocos > 0) {
            throw new ErroAvaliadorSintatico(
                null,
                'Quantidade de blocos abertos não corresponde com a quantidade de blocos fechados'
            );
        }

        const declaracoes = [];

        this.validarSegmentoHoraDoShow();
        this.validarSegmentoBirlFinal();

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}
