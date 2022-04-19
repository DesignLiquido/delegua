export interface PilhaInterface<T> {
    pilha: Array<T>;
    empilhar(item: T);
    eVazio(item: T): Boolean;
    topoDaPilha(): Array<T>;
    removerUltimo(): Array<T>;
}