/* istanbul ignore file */
import { parseScript } from 'esprima';
import { LexadorInterface, SimboloInterface } from '../../interfaces';
import { RetornoLexador } from '../../interfaces/retornos';
import { Directive, ModuleDeclaration, Statement } from 'estree';

/**
 * Este lexador existe apenas para abstrair o Esprima em
 * outras dependências, como `delegua-node`.
 */
export class LexadorJavaScript implements LexadorInterface<Statement | Directive | ModuleDeclaration> {
    simbolos: SimboloInterface[];
    codigo: string | string[];
    inicioSimbolo: number;
    atual: number;
    linha: number;

    eDigito(caractere: string): boolean {
        throw new Error('Método não implementado.');
    }

    eAlfabeto(caractere: string): boolean {
        throw new Error('Método não implementado.');
    }

    eAlfabetoOuDigito(caractere: string): boolean {
        throw new Error('Método não implementado.');
    }

    eFinalDoCodigo(): boolean {
        throw new Error('Método não implementado.');
    }

    avancar(): string | void {
        throw new Error('Método não implementado.');
    }

    adicionarSimbolo(tipo: any, literal: any): void {
        throw new Error('Método não implementado.');
    }

    simboloAtual(): string {
        throw new Error('Método não implementado.');
    }

    proximoSimbolo(): string {
        throw new Error('Método não implementado.');
    }

    simboloAnterior(): string {
        throw new Error('Método não implementado.');
    }

    analisarTexto(delimitador: string): void {
        throw new Error('Método não implementado.');
    }

    analisarNumero(): void {
        throw new Error('Método não implementado.');
    }

    identificarPalavraChave(): void {
        throw new Error('Método não implementado.');
    }

    analisarToken(): void {
        throw new Error('Método não implementado.');
    }

    mapear(codigo: string[], hashArquivo: number): RetornoLexador<Statement | Directive | ModuleDeclaration> {
        const programaEsprima = parseScript(codigo.join('\n'));
        return {
            simbolos: programaEsprima.body,
            erros: [],
        } as RetornoLexador<Statement | Directive | ModuleDeclaration>;
    }
}
