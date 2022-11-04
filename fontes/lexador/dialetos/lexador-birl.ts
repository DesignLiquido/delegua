import { LexadorInterface, SimboloInterface } from '../../interfaces';
import { RetornoLexador } from '../../interfaces/retornos';
import { ErroLexador } from '../erro-lexador';
import tiposDeSimbolos from '../../tipos-de-simbolos/birl';

export class LexadorBirl implements LexadorInterface {
    simbolos: SimboloInterface[];
    codigo: string | string[];
    inicioSimbolo: number;
    atual: number;
    linha: number;
    erros: ErroLexador[];

    eDigito(caractere: string): boolean {
        throw new Error('Method not implemented.');
    }
    eAlfabeto(caractere: string): boolean {
        throw new Error('Method not implemented.');
    }
    eAlfabetoOuDigito(caractere: string): boolean {
        throw new Error('Method not implemented.');
    }
    eFinalDoCodigo(): boolean {
        throw new Error('Method not implemented.');
    }
    avancar(): string | void {
        throw new Error('Method not implemented.');
    }
    adicionarSimbolo(tipo: string, literal?: any): void {
        throw new Error('Method not implemented.');
    }
    simboloAtual(): string {
        throw new Error('Method not implemented.');
    }
    proximoSimbolo(): string {
        throw new Error('Method not implemented.');
    }
    simboloAnterior(): string {
        throw new Error('Method not implemented.');
    }
    analisarTexto(delimitador: string): void {
        throw new Error('Method not implemented.');
    }
    analisarNumero(): void {
        throw new Error('Method not implemented.');
    }
    identificarPalavraChave(): void {
        throw new Error('Method not implemented.');
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
            default:
                if (this.eDigito(caractere as string)) this.analisarNumero();
                else if (this.eAlfabeto(caractere as string))
                    this.identificarPalavraChave();
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
