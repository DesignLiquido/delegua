import { LexadorInterface, SimboloInterface } from '../../interfaces';
import { RetornoLexador } from '../../interfaces/retornos';
import { ErroLexador } from '../erro-lexador';
import tiposDeSimbolos from '../../tipos-de-simbolos/birl';
import { Simbolo } from '../simbolo';
import { parse } from 'path';
import palavrasReservadas from '../palavras-reservadas';

export class LexadorBirl implements LexadorInterface {
    simbolos: SimboloInterface[];
    codigo: string | string[];
    inicioSimbolo: number;
    atual: number;
    linha: number;
    erros: ErroLexador[];

    proximoIgualA(esperado: string) {
        if (this.eFinalDoCodigo()) {
            return false;
        }

        if (this.codigo[this.atual] !== esperado) {
            return false;
        }

        this.atual += 1;
        return true;
    }

    eDigito(caractere: string): boolean {
        return caractere >= '0' && caractere <= '9';
    }
    eAlfabeto(caractere: string): boolean {
        const acentuacoes = [
            'á',
            'Á',
            'ã',
            'Ã',
            'â',
            'Â',
            'à',
            'À',
            'é',
            'É',
            'ê',
            'Ê',
            'í',
            'Í',
            'ó',
            'Ó',
            'õ',
            'Õ',
            'ô',
            'Ô',
            'ú',
            'Ú',
            'ç',
            'Ç',
            '_',
        ];
        return (
            (caractere >= 'a' && caractere <= 'z') ||
            (caractere >= 'A' && caractere <= 'Z') ||
            acentuacoes.includes(caractere)
        );
    }
    eAlfabetoOuDigito(caractere: string): boolean {
        return this.eDigito(caractere) || this.eAlfabeto(caractere);
    }
    eFinalDoCodigo(): boolean {
        return this.atual >= this.codigo.length;
    }
    avancar(): string | void {
        this.atual += 1;
        return this.codigo[this.atual - 1];
    }
    adicionarSimbolo(tipo: string, literal?: any): void {
        const texto = (this.codigo as string).substring(this.inicioSimbolo, this.atual);
        this.simbolos.push(new Simbolo(tipo, texto, literal, this.linha, -1));
    }
    simboloAtual(): string {
        if (this.eFinalDoCodigo()) return '\0';
        return (this.codigo as string).charAt(this.atual);
    }
    proximoSimbolo(): string {
        if (this.atual + 1 >= this.codigo.length) return '\0';
        return (this.codigo as string).charAt(this.atual + 1);
    }
    simboloAnterior(): string {
        return (this.codigo as string).charAt(this.atual - 1);
    }
    analisarTexto(texto: string): void {
        while (this.simboloAtual() !== texto && !this.eFinalDoCodigo()) {
            if (this.simboloAtual() === '\n') this.linha = +1;
            this.avancar();
        }

        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: this.linha,
                caractere: this.simboloAnterior(),
                mensagem: 'Texto não finalizado',
            } as ErroLexador);
            return;
        }

        this.avancar();

        const valor = (this.codigo as string).substring(this.inicioSimbolo + 1, this.atual - 1);
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

        const numeroCompleto = (this.codigo as string).substring(this.inicioSimbolo, this.atual);

        this.adicionarSimbolo(tiposDeSimbolos.M2, parseInt(numeroCompleto));
    }
    identificarPalavraChave(): void {
        throw new Error('Not Implementation');
    }
    analisarToken(): void {
        const caractere = this.avancar();

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
            case ' ':
            case '\0':
            case '\r':
            case '\t':
                break;
            default:
                if (this.eDigito(caractere as string)) this.analisarNumero();
                else if (this.eAlfabeto(caractere as string)) this.identificarPalavraChave();
                else
                    this.erros.push({
                        linha: this.linha,
                        caractere: caractere,
                        mensagem: 'Caractere inesperado.',
                    } as ErroLexador);
        }
    }
    mapear(codigo: string[], hashArquivo: number): RetornoLexador {
        throw new Error('Method not implemented.');
    }
}
