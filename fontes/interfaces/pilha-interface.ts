export interface PilhaInterface<T> {
    pilha: Array<T>;

    empilhar(item: T): void;
    eVazio(): boolean;
    topoDaPilha(): T;
    removerUltimo(): T;
}
