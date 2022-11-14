import { Construto, FuncaoConstruto, Literal, Variavel } from '../../construtos';
import { Escreva, Declaracao, Enquanto, Para, Escolha, Fazer } from '../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import tiposDeSimbolos from '../../tipos-de-simbolos/birl';
import { SimboloInterface } from '../../interfaces';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';

export class AvaliadorSintaticoBirl extends AvaliadorSintaticoBase {
    validarSegmentoHoraDoShow(): void {
        this.consumir(tiposDeSimbolos.HORA_DO_SHOW, 'Esperado expressão `HORA DO SHOW` para iniciar o programa');
        this.blocos += 1;
    }

    validarSegmentoBirlFinal(): void {
        this.consumir(tiposDeSimbolos.BIRL, 'Esperado expressão `BIRL` para fechamento do programa');
        this.blocos -= 1;
    }

    primario(): Construto {
        // Creio q isso e para fazer a criação de variaveis
        // mais não ha nenhum prefixo para criar variavel
        // nessa linguagem
        // acho q terei que pegar essa verificação com base no '='
        // Em tese considerando que seja [ FRANGO FR = 'a'; ]
        // new Variavel receberia no simbolo o valor de FR
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
