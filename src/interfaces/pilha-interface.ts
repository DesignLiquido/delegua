export interface PilhaInterface {
    pilha: Array<any>;
    empilhar(item: any);
    eVazio(item: any): Boolean;
    topoDaPilha(): Array<any>;
    removerUltimo(): Array<any>;
}