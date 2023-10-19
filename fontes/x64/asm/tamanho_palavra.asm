;------------------------------------------------------------
; Nome:delegua_tamanho_palavra
; Criador: ItaloCobains
; Data: 2023-10-19
;
; [delegua_tamanho_palavra]
; - calcula o tamanho de uma palavra pelo ponteiro dela
; - size_t delegua_tamanho_palavra(const char *s);
; - delegua_tamanho_palavra() calcula o tamanho de uma string que começa no *s e termina em '\0'
; - retorna um size_t do tamanho dessa string (size_t = unsigned int)
;
;
; [Registradores]
; - edi - ponteiro de *s
; - eax - retorno do tamanho size_t
; - caractere atual - byte[edi + eax]
;------------------------------------------------------------

section .data

section .bss

section .text
    global delegua_tamanho_palavra

delegua_tamanho_palavra:
    mov eax, -1

_loop_delegua_tamanho_palavra:
    inc rax
    cmp byte[edi+eax], 0
    jne _loop_delegua_tamanho_palavra

_ret_delegua_tamanho_palavra:
    ret