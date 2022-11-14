import { LexadorInterface, SimboloInterface } from '../../interfaces';
import { RetornoLexador } from '../../interfaces/retornos';
import { ErroLexador } from '../erro-lexador';
import tiposDeSimbolos from '../../tipos-de-simbolos/birl';
import { Simbolo } from '../simbolo';
import { parse } from 'path';
import palavrasReservadas from '../palavras-reservadas';
import { LexadorBaseLinhaUnica } from '../lexador-base-linha-unica';

export class LexadorBirl extends LexadorBaseLinhaUnica {
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
        this.adicionarSimbolo(tiposDeSimbolos.FR, valor);
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
        this.adicionarSimbolo(tiposDeSimbolos.T, parseFloat(numeroCompleto));
    }

    identificarPalavraChave(): void {
        while (this.simboloAtual() !== '\n' && this.simboloAtual() !== '?') {
            console.log(this.simboloAtual());
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
            default:
                this.avancar();
                break;
        }
    }

    analisarToken(): void {
        const caractere = this.simboloAtual();

        switch (caractere) {
            case '(':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_ESQUERDO);
                break;
            case ')':
                this.adicionarSimbolo(tiposDeSimbolos.PARENTESE_DIREITO);
                break;
            case '=':
                this.adicionarSimbolo(this.proximoIgualA('=') ? tiposDeSimbolos.IGUAL_IGUAL : tiposDeSimbolos.IGUAL);
                break;
            case "'":
                this.analisarTexto("'");
                break;
            case '"':
                this.analisarTexto('"');
                break;
            case ';':
                this.adicionarSimbolo(tiposDeSimbolos.PONTO_E_VIRGULA);
                break;
            case '\0':
            case '\r':
            case '\t':
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
            // this.analisaPalavraChave();
        }
    }

    analisaPalavraChave(): void {
        while (this.simboloAtual() !== '\n') {
            this.avancar();
        }

        const valor = this.codigo.substring(this.inicioSimbolo, this.atual - 1).trimStart();

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
                this.adicionarSimbolo(tiposDeSimbolos.CE_QUER_VER_ESSA_PORRA, valor);
                this.avancar();
                break;
            default:
                this.avancar();
                break;
        }
    }

    // essa funcao não esta sendo usanda por enquanto
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
