import { RetornoLexador } from '../../interfaces/retornos';
import { ErroLexador } from '../erro-lexador';
import tiposDeSimbolos from '../../tipos-de-simbolos/birl';
import { LexadorBaseLinhaUnica } from '../lexador-base-linha-unica';
import { Simbolo } from '../simbolo';

export class LexadorBirl extends LexadorBaseLinhaUnica {
    adicionarSimbolo(tipo: string, lexema: string = '', literal: any = null): void {
        this.simbolos.push(new Simbolo(tipo, lexema, literal, this.linha, -1));
    }

    proximoIgualA(esperado: string): boolean {
        if (this.eFinalDoCodigo()) {
            return false;
        }

        if (this.codigo[this.atual] !== esperado) {
            return false;
        }

        this.atual += 1;
        return true;
    }

    analisarTexto(delimitador: string): void {
        while (this.simboloAtual() !== delimitador && !this.eFinalDoCodigo()) {
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: this.linha + 1,
                caractere: this.simboloAnterior(),
                mensagem: 'Caractere não finalizado',
            } as ErroLexador);
            return;
        }

        const valor = this.codigo.substring(this.inicioSimbolo + 1, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.TEXTO, valor, valor);
    }

    analisarNumero(): void {
        while (this.eDigito(this.simboloAtual())) {
            this.avancar();
        }
        if (this.simboloAtual() == '.' && this.eDigito(this.proximoSimbolo())) {
            this.avancar();

            while (this.eDigito(this.simboloAtual())) {
                this.avancar();
            }
        }
        const numeroCompleto = this.codigo.substring(this.inicioSimbolo, this.atual);
        this.adicionarSimbolo(tiposDeSimbolos.NUMERO, numeroCompleto, parseFloat(numeroCompleto));
    }

    identificarPalavraChave(): void {
        while (this.simboloAtual() !== '\n' && this.simboloAtual() !== '?') {
            this.avancar();
        }

        const proximo = this.simboloAtual();

        const valor =
            proximo !== '?'
                ? this.codigo.substring(this.inicioSimbolo, this.atual - 1).trim()
                : this.codigo.substring(this.inicioSimbolo, this.atual + 1).trim();

        switch (valor) {
            case 'HORA DO SHOW':
                this.adicionarSimbolo(tiposDeSimbolos.HORA_DO_SHOW);
                this.avancar();
                break;
            case 'BIRL':
                this.adicionarSimbolo(tiposDeSimbolos.BIRL);
                this.avancar();
                break;
            case 'CE QUER VER ESSA PORRA?':
                this.adicionarSimbolo(tiposDeSimbolos.CE_QUER_VER_ESSA_PORRA);
                this.avancar();
                break;
            case 'BORA CUMPADE?':
                this.adicionarSimbolo(tiposDeSimbolos.BORA_CUMPADE);
                this.avancar();
                break;
            case 'QUE QUE CE QUER MONSTRAO?':
                this.adicionarSimbolo(tiposDeSimbolos.QUE_QUE_CE_QUER_MONSTRAO);
                this.avancar();
                break;
            case 'ELE QUE A GENTE QUER?':
                this.adicionarSimbolo(tiposDeSimbolos.ELE_QUE_A_GENTE_QUER);
                this.avancar();
                break;
            case 'NAO VAI DAR NAO':
                this.adicionarSimbolo(tiposDeSimbolos.NAO_VAI_DAR_NAO);
                this.avancar();
                break;
            default:
                this.avancar();
                break;
        }
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            case '(':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO, '(', null);
                this.avancar();
                break;
            case ')':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO, ')', null);
                this.avancar();
                break;
            case '=':
                const bool = this.proximoIgualA('=') ? true : false;
                this.adicionarSimbolo(
                    bool ? tiposDeSimbolos.IGUAL_IGUAL : tiposDeSimbolos.IGUAL,
                    bool ? '==' : '=',
                    null
                );
                this.avancar();
                break;
            case "'":
                this.analisarTexto("'");
                this.avancar();
                break;
            case '"':
                this.avancar();
                this.analisarTexto('"');
                this.avancar();
                break;
            case ';':
                this.adicionarSimbolo(tiposDeSimbolos.PONTO_E_VIRGULA, ';', null);
                this.avancar();
                break;
            case '\0':
                this.adicionarSimbolo(tiposDeSimbolos.QUEBRA_LINHA, '\0', null);
                this.avancar();
                break;
            case ' ':
            case '\r':
            case '\t':
            case '\n':
            case '':
                this.avancar();
                break;
            default:
                if (this.eDigito(caractere)) this.analisarNumero();
                else if (this.eAlfabeto(caractere)) this.identificarPalavraChave();
                else
                    this.erros.push({
                        linha: this.linha,
                        caractere: caractere,
                        mensagem: 'Caractere inesperado.',
                    } as ErroLexador);
                this.avancar();
        }
    }

    InjetaUmItemDentroDaLista(item: string, posicao: number): string[] {
        let codigoComeco: string[];
        let codigoPosPosição: string[];

        for (let i in this.codigo as any) {
            if (Number(i) === posicao) {
                let iterador: number = Number(i);
                while (iterador <= this.codigo.length) {
                    codigoPosPosição.push(this.codigo[iterador]);
                    iterador += 1;
                }
                break;
            }
            codigoComeco.push(this.codigo[i]);
        }

        return [...codigoComeco, ...codigoPosPosição];
    }

    mapear(codigo: string[], hashArquivo: number = -1): RetornoLexador {
        this.erros = [];
        this.simbolos = [];
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 1;

        this.codigo = codigo.join('\n') || '';

        this.codigo += '\n';

        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }

        return {
            simbolos: this.simbolos,
            erros: this.erros,
        } as RetornoLexador;
    }
}
