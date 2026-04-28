import { IteravelInterface } from "../../interfaces";

export class Iteravel implements IteravelInterface {
    private valorBruto: any;

    constructor(valorBruto: any) {
        this.valorBruto = valorBruto;
    }

    get elementos(): any[] {
        if (this.valorBruto === null || this.valorBruto === undefined) {
            return [];
        }

        // Se for um array do JS, devolve o valor bruto
        if (Array.isArray(this.valorBruto)) {
            return this.valorBruto;
        }

        // Se for dicionário de Delégua/Pituguês
        if (
            this.valorBruto.chaves !== undefined &&
            this.valorBruto.valores !== undefined
        ) {
            const pares = [];

            for (let i = 0; i < this.valorBruto.chaves.length; i++) {
                pares.push(
                    [this.valorBruto.chaves[i], this.valorBruto.valores[i]]
                );
            }

            return pares;
        }

        // Se for um vetor de Delégua/Pituguês
        if (this.valorBruto.valores !== undefined) {
            return this.valorBruto.valores;
        }

        // Se for uma tupla de Delégua/Pituguês
        if (this.valorBruto.elementos !== undefined) {
            return this.valorBruto.elementos;
        }

        // Se for String/Texto ou iterável nativo do JS
        const ehIteravelNativo = typeof this.valorBruto?.[Symbol.iterator] === 'function';
        if (this.valorBruto && ehIteravelNativo) {
            return Array.from(this.valorBruto);
        }

        // Se por algum motivo for um objeto puro do JS
        if (this.valorBruto && typeof this.valorBruto === 'object') {
            return Object.values(this.valorBruto);
        }

        return [];
    }
}