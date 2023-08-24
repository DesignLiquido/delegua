export interface TradutorInterface<T> {
    traduzir(declaracoes: T[]): string;
}
