import hrtime from 'browser-process-hrtime';

import { SimboloInterface } from '../interfaces';
import { ErroLexador } from './erro-lexador';
import { RetornoLexadorInterface } from '../interfaces/retornos/retorno-lexador-interface';
import { Simbolo } from './simbolo';
import { LexadorBase } from './lexador-base';

import { palavrasReservadasDelegua } from './palavras-reservadas';
import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

const tokensSimples: Record<string, string> = {
    '@': tiposDeSimbolos.ARROBA,
    '[': tiposDeSimbolos.COLCHETE_ESQUERDO,
    ']': tiposDeSimbolos.COLCHETE_DIREITO,
    '(': tiposDeSimbolos.PARENTESE_ESQUERDO,
    ')': tiposDeSimbolos.PARENTESE_DIREITO,
    '{': tiposDeSimbolos.CHAVE_ESQUERDA,
    '}': tiposDeSimbolos.CHAVE_DIREITA,
    ',': tiposDeSimbolos.VIRGULA,
    ':': tiposDeSimbolos.DOIS_PONTOS,
    ';': tiposDeSimbolos.PONTO_E_VIRGULA,
    '^': tiposDeSimbolos.CIRCUMFLEXO,
    '~': tiposDeSimbolos.BIT_NOT,
    '&': tiposDeSimbolos.BIT_AND
};

export class Lexador extends LexadorBase {
    performance: boolean;

    private readonly regexAlfabeto = /[a-zA-Z_áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/;
    private readonly regexEmoji = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/u;

    constructor(performance = false) {
        super();
        this.performance = performance;
    }

    override eAlfabeto(c: string): boolean {
        return this.regexAlfabeto.test(c);
    }

    eEmoji(c: string): boolean {
        return this.regexEmoji.test(c);
    }

    override avancar(): void {
        const codePoint = this.codigo[this.linha].codePointAt(this.atual);

        this.atual += codePoint && codePoint > 0xffff ? 2 : 1;

        if (this.eFinalDaLinha() && !this.eUltimaLinha()) {
            this.linha++;
            this.atual = 0;
        }
    }

    override simboloAtual(): string {
        if (this.eFinalDaLinha()) return '\0';

        const codePoint = this.codigo[this.linha].codePointAt(this.atual);

        return codePoint === undefined ? '\0' : String.fromCodePoint(codePoint);
    }

    override proximoSimbolo(): string {
        const atualStr = this.simboloAtual();
        const codePoint = this.codigo[this.linha].codePointAt(
            this.atual + atualStr.length
        );

        return codePoint === undefined ? '\0' : String.fromCodePoint(codePoint);
    }

    override simboloAnterior(): string {
        const linha = this.codigo[this.linha];
        const indiceAnterior = this.atual - (linha.codePointAt(this.atual - 2)! > 0xffff ? 2 : 1);
        const codePoint = linha.codePointAt(indiceAnterior);

        return codePoint === undefined ? '\0' : String.fromCodePoint(codePoint);
    }

    override adicionarSimbolo(tipo: string, literal: any = null): void {
        const texto = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        );
        const lexema = literal !== null ? literal : texto;
        const comprimento = Math.max(
            typeof lexema === 'string' ? lexema.length : 0, texto.length
        ) || 1;

        this.simbolos.push(
            new Simbolo(
                tipo,
                lexema,
                literal,
                this.linha + 1,
                this.hashArquivo,
                this.inicioSimbolo + 1,
                this.inicioSimbolo + comprimento
            )
        );
    }

    private verificarEAvancar(esperado: string): boolean {
        if (this.eFinalDaLinha() || this.simboloAtual() !== esperado) return false;
        this.avancar();

        return true;
    }

    private analisarBaseNumerica(
        validadorDigito: (c: string) => boolean, tipoErro: string
    ): void {
        this.avancar(); // Pula '0'
        this.avancar(); // Pula 'x', 'b' ou 'o'

        while (validadorDigito.call(this, this.simboloAtual())) {
            this.avancar();
        }

        const texto = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        );

        try {
            this.adicionarSimbolo(tiposDeSimbolos.NUMERO, BigInt(texto));
        } catch (e) {
            this.erros.push({
                linha: this.linha + 1,
                caractere: this.simboloAnterior(),
                mensagem: `Literal ${tipoErro} inválido: ${texto}`
            } as ErroLexador);
        }
    }

    override analisarNumero(): void {
        if (this.simboloAtual() === '0') {
            const prox = this.proximoSimbolo().toLowerCase();

            if (prox === 'x') {
                return this.analisarBaseNumerica(
                    this.eHexDigito,
                    'hexadecimal'
                );
            }

            if (prox === 'b') {
                return this.analisarBaseNumerica(
                    this.eBinarioDigito,
                    'binário'
                );
            }

            if (prox === 'o') {
                return this.analisarBaseNumerica(
                    this.eOctalDigito,
                    'octal'
                );
            }
        }

        while (this.eDigito(this.simboloAtual())) {
            this.avancar();
        }

        if (
            this.simboloAtual() === '.' && this.eDigito(this.proximoSimbolo())
        ) {
            this.avancar();

            while (this.eDigito(this.simboloAtual())) {
                this.avancar();
            }
        }

        const numeroCompleto = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        );

        this.adicionarSimbolo(
            tiposDeSimbolos.NUMERO,
            parseFloat(numeroCompleto)
        );
    }

    override analisarTexto(delimitador = '"'): void {
        let valor = '';

        this.avancar();

        while (!this.eFinalDoCodigo()) {
            const c = this.simboloAtual();

            if (c === delimitador) {
                this.avancar();
                this.adicionarSimbolo(tiposDeSimbolos.TEXTO, valor);
                this.simbolos[this.simbolos.length - 1].delimitadorTexto = delimitador as "'" | '"';
                return;
            }

            if (c === '\0' && this.eUltimaLinha()) break;

            if (c === '\0') {
                valor += '\n';
                this.avancar();
                continue;
            }

            if (c === '\\') {
                this.avancar();

                const prox = this.simboloAtual();
                const escapes: Record<string, string> = {
                    'n': '\n',
                    't': '\t',
                    'r': '\r',
                    'b': '\b',
                    "'": "'",
                    '"': '"',
                    '\\': '\\',
                    'e': '\x1B'
                };

                if (escapes[prox]) {
                    valor += escapes[prox];
                } else if (prox === 'x') {
                    let hex = '';

                    for (let i = 0; i < 2; i++) {
                        const h = this.proximoSimbolo();

                        if (/[0-9a-fA-F]/.test(h)) {
                            this.avancar(); hex += h;
                        } else break;
                    }

                    valor += hex.length === 2
                        ? String.fromCharCode(parseInt(hex, 16))
                        : '\\x' + hex;
                } else if (prox !== '\0') {
                    valor += '\\' + prox;
                }
            } else {
                valor += c;
            }

            this.avancar();
        }

        this.erros.push({
            linha: this.linha + 1,
            caractere: this.simboloAnterior(),
            mensagem: 'Texto não finalizado.'
        } as ErroLexador);
    }

    override identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const codigo = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        );

        this.adicionarSimbolo(
            codigo in palavrasReservadasDelegua
                ? palavrasReservadasDelegua[codigo]
                : tiposDeSimbolos.IDENTIFICADOR
        );
    }

    analisarEmoji(): void {
        this.erros.push({
            linha: this.linha + 1,
            caractere: this.simboloAtual(),
            mensagem: 'Emojis devem estar envoltos por aspas.'
        } as ErroLexador);

        this.avancar();
    }

    comentarioUmaLinha(): void {
        const linhaAtual = this.linha;

        let ultimoAtual = this.atual;

        while (linhaAtual === this.linha && !this.eFinalDoCodigo()) {
            ultimoAtual = this.atual;
            this.avancar();
        }

        const conteudo = this.codigo[linhaAtual].substring(
            this.inicioSimbolo + 2,
            ultimoAtual
        );

        this.adicionarSimbolo(tiposDeSimbolos.COMENTARIO, conteudo.trim());
    }

    comentarioMultilinha(): void {
        let conteudo = '';

        while (!this.eFinalDoCodigo()) {
            if (this.simboloAtual() === '*' && this.proximoSimbolo() === '/') {
                this.avancar(); // pula o '*'
                this.avancar(); // pula o '/'

                conteudo
                    .split('\0')
                    .forEach(
                        l => this.adicionarSimbolo(
                            tiposDeSimbolos.LINHA_COMENTARIO, l.trim()
                        )
                    );

                break;
            }

            conteudo += this.simboloAtual();
            this.avancar();
        }
    }

    comentarioDocumentario(): void {
        let conteudo = '';

        while (!this.eFinalDoCodigo()) {
            if (this.simboloAtual() === '*' && this.proximoSimbolo() === '/') {
                this.avancar(); // pula '*'
                this.avancar(); // pula '/'
                break;
            }

            conteudo += this.simboloAtual();
            this.avancar();
        }

        const conteudoLimpo = conteudo
            .split('\0')
            .map(
                l => l.trim().startsWith('*')
                    ? l.trim().substring(1).trim()
                    : l.trim()
            )
            .filter(l => l.length > 0)
            .join('\n');

        this.adicionarSimbolo(
            tiposDeSimbolos.DOCUMENTARIO,
            conteudoLimpo || ''
        );
    }

    override analisarToken(): void {
        const c = this.simboloAtual();

        if (tokensSimples[c]) {
            this.adicionarSimbolo(tokensSimples[c], c);
            this.avancar();
            return;
        }

        if (c === ' ' || c === '\0' || c === '\r' || c === '\t') {
            this.avancar();
            return;
        }

        this.inicioSimbolo = this.atual;

        if (c === '"' || c === "'") {
            this.analisarTexto(c);
            return;
        }

        switch (c) {
            case '.':
                this.avancar();

                if (this.verificarEAvancar('.')) {
                    if (this.verificarEAvancar('.')) {
                        this.adicionarSimbolo(
                            tiposDeSimbolos.RETICENCIAS,
                            '...'
                        );
                    } else {
                        this.erros.push({
                            linha: this.linha + 1,
                            caractere: this.simboloAtual(),
                            mensagem: 'Esperado ou apenas um ponto, ou três pontos em sequência.'
                        } as ErroLexador);

                        this.adicionarSimbolo(tiposDeSimbolos.PONTO, '.');
                    }
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.PONTO, '.');
                }

                break;
            case '-':
                this.avancar();

                if (this.verificarEAvancar('=')) {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOS_IGUAL, '-=');
                } else if (this.verificarEAvancar('-')) {
                    this.adicionarSimbolo(tiposDeSimbolos.DECREMENTAR, '--');
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.SUBTRACAO);
                }

                break;
            case '+':
                this.avancar();

                if (this.verificarEAvancar('=')) {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIS_IGUAL, '+=');
                } else if (this.verificarEAvancar('+')) {
                    this.adicionarSimbolo(tiposDeSimbolos.INCREMENTAR, '++');
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.ADICAO);
                }

                break;
            case '%':
                this.avancar();

                if (this.verificarEAvancar('=')) {
                    this.adicionarSimbolo(tiposDeSimbolos.MODULO_IGUAL, '%=');
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MODULO);
                }

                break;
            case '*':
                this.avancar();

                if (this.verificarEAvancar('*')) {
                    this.adicionarSimbolo(tiposDeSimbolos.EXPONENCIACAO, '**');
                } else if (this.verificarEAvancar('=')) {
                    this.adicionarSimbolo(
                        tiposDeSimbolos.MULTIPLICACAO_IGUAL,
                        '*='
                    );
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MULTIPLICACAO);
                }

                break;
            case '!':
                this.avancar();

                if (this.verificarEAvancar('=')) {
                    this.adicionarSimbolo(tiposDeSimbolos.DIFERENTE, '!=');
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.NEGACAO);
                }

                break;
            case '=':
                this.avancar();

                if (this.verificarEAvancar('=')) {
                    this.adicionarSimbolo(tiposDeSimbolos.IGUAL_IGUAL, '==');
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.IGUAL);
                }

                break;
            case '|':
                this.avancar();

                if (this.verificarEAvancar('|')) {
                    this.adicionarSimbolo(
                        tiposDeSimbolos.EXPRESSAO_REGULAR,
                        '||'
                    );
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.BIT_OR);
                }

                break;
            case '<':
                this.avancar();

                if (this.verificarEAvancar('=')) {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_IGUAL, '<=');
                } else if (this.verificarEAvancar('<')) {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR_MENOR, '<<');
                } else if (this.verificarEAvancar('-')) {
                    this.adicionarSimbolo(tiposDeSimbolos.SETA_ESQUERDA, '<-');
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MENOR);
                }

                break;
            case '>':
                this.avancar();

                if (this.verificarEAvancar('=')) {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR_IGUAL, '>=');
                } else if (this.verificarEAvancar('>')) {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR_MAIOR, '>>');
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.MAIOR);
                }

                break;
            case '/':
                this.avancar();

                if (this.verificarEAvancar('/')) {
                    this.comentarioUmaLinha();
                } else if (this.verificarEAvancar('*')) {
                    if (this.verificarEAvancar('*')) {
                        this.comentarioDocumentario();
                    } else {
                        this.comentarioMultilinha();
                    }
                } else if (this.verificarEAvancar('=')) {
                    this.adicionarSimbolo(tiposDeSimbolos.DIVISAO_IGUAL, '/=');
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.DIVISAO);
                }

                break;
            case '\\':
                this.avancar();

                if (this.verificarEAvancar('=')) {
                    this.adicionarSimbolo(
                        tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL,
                        '\\='
                    );
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.DIVISAO_INTEIRA);
                }

                break;
            case '?':
                this.avancar();

                if (this.verificarEAvancar(':')) {
                    this.adicionarSimbolo(tiposDeSimbolos.ELVIS, '?:');
                } else {
                    this.adicionarSimbolo(tiposDeSimbolos.INTERROGACAO);
                }

                break;
            default:
                if (this.eDigito(c)) {
                    this.analisarNumero();
                } else if (this.eEmoji(c)) {
                    this.analisarEmoji();
                } else if (this.eAlfabeto(c)) {
                    this.identificarPalavraChave();
                } else {
                    this.erros.push({
                        linha: this.linha + 1,
                        caractere: c,
                        mensagem: 'Caractere inesperado.'
                    } as ErroLexador);

                    this.avancar();
                }
        }
    }

    override mapear(
        codigo: string[],
        hashArquivo: number
    ): RetornoLexadorInterface<SimboloInterface> {
        const inicioMapeamento: [number, number] = hrtime();

        this.erros = [];
        this.simbolos = [];
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
        this.codigo = codigo && codigo.length > 0 ? codigo : [''];
        this.hashArquivo = hashArquivo;

        for (let i = 0; i < this.codigo.length; i++) {
            this.codigo[i] += '\0';
        }

        while (!this.eFinalDoCodigo()) {
            this.analisarToken();
        }

        if (this.performance) {
            const deltaMapeamento: [number, number] = hrtime(inicioMapeamento);
            // eslint-disable-next-line no-undef
            console.log(
                `[Lexador] Tempo para mapeamento: ${deltaMapeamento[0] * 1e9 + deltaMapeamento[1]}ns`
            );
        }

        return {
            simbolos: this.simbolos,
            erros: this.erros
        } as RetornoLexadorInterface<SimboloInterface>;
    }
}