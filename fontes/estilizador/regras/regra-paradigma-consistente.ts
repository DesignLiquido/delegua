import { Declaracao } from '../../declaracoes';
import { Construto } from '../../construtos';
import { Leia } from '../../construtos/leia';
import { Escreva, EscrevaMesmaLinha } from '../../declaracoes';
import {
    OpcoesParadigmaConsistenteInterface,
    RegraEstilizacaoInterface,
} from '../../interfaces/estilizador';
import {
    obterFormaAlternativa,
    pertenceAoParadigma,
    obterMapaLexemaParaParadigma,
} from '../../lexador/mapeamento-paradigmas';

/**
 * Regra que enforça consistência de paradigma em palavras reservadas.
 *
 * Em português, instruções podem ser expressas no imperativo (escreva, leia)
 * ou no infinitivo (escrever, ler). Esta regra permite escolher um paradigma
 * único para manter a consistência do código.
 *
 * Exemplos:
 * - Modo imperativo: `escreva()`, `leia()`, `tente { } pegue { }`
 * - Modo infinitivo: `escrever()`, `ler()`, `tentar { } pegar { }`
 */
export class RegraParadigmaConsistente implements RegraEstilizacaoInterface {
    nome = 'paradigma-consistente';
    descricao = 'Enforça consistência de paradigma (imperativo/infinitivo) em palavras reservadas';

    private opcoes: OpcoesParadigmaConsistenteInterface;
    private mapaLexemaParaParadigma: Map<string, 'imperativo' | 'infinitivo' | 'neutro'>;

    constructor(opcoes: OpcoesParadigmaConsistenteInterface = {}) {
        this.opcoes = {
            paradigma: opcoes.paradigma || 'ambos',
        };
        this.mapaLexemaParaParadigma = obterMapaLexemaParaParadigma();
    }

    aplicarEmDeclaracao(declaracao: Declaracao): Declaracao {
        // Processa Escreva
        if (declaracao instanceof Escreva || declaracao instanceof EscrevaMesmaLinha) {
            return this.processarDeclaracaoComSimbolo(declaracao, 'simboloEscreva');
        }

        return declaracao;
    }

    aplicarEmConstruto(construto: Construto): Construto {
        // Processa Leia
        if (construto instanceof Leia) {
            return this.processarConstrutoComSimbolo(construto, 'simbolo');
        }

        return construto;
    }

    /**
     * Processa uma declaração que tem um símbolo específico.
     */
    private processarDeclaracaoComSimbolo(declaracao: any, nomeCampoSimbolo: string): Declaracao {
        const simbolo = declaracao[nomeCampoSimbolo];

        if (!simbolo) {
            return declaracao;
        }

        const lexemaAtual = simbolo.lexema.toLowerCase();
        const paradigmaLexema = this.mapaLexemaParaParadigma.get(lexemaAtual);

        // Se for neutro ou ambos, não faz nada
        if (paradigmaLexema === 'neutro' || this.opcoes.paradigma === 'ambos') {
            return declaracao;
        }

        // Se o lexema não pertence ao paradigma configurado, transforma
        if (!pertenceAoParadigma(lexemaAtual, this.opcoes.paradigma!)) {
            const formaAlternativa = obterFormaAlternativa(lexemaAtual, this.opcoes.paradigma!);
            if (formaAlternativa) {
                simbolo.lexema = formaAlternativa;
            }
        }

        return declaracao;
    }

    /**
     * Processa um construto que tem um símbolo específico.
     */
    private processarConstrutoComSimbolo(construto: any, nomeCampoSimbolo: string): Construto {
        const simbolo = construto[nomeCampoSimbolo];

        if (!simbolo) {
            return construto;
        }

        const lexemaAtual = simbolo.lexema.toLowerCase();
        const paradigmaLexema = this.mapaLexemaParaParadigma.get(lexemaAtual);

        // Se for neutro ou ambos, não faz nada
        if (paradigmaLexema === 'neutro' || this.opcoes.paradigma === 'ambos') {
            return construto;
        }

        // Se o lexema não pertence ao paradigma configurado, transforma
        if (!pertenceAoParadigma(lexemaAtual, this.opcoes.paradigma!)) {
            const formaAlternativa = obterFormaAlternativa(lexemaAtual, this.opcoes.paradigma!);
            if (formaAlternativa) {
                simbolo.lexema = formaAlternativa;
            }
        }

        return construto;
    }
}
