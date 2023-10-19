;------------------------------------------------------------
; Nome: delegua_para_maiusculo
; Criador: ItaloCobains
; Data: 2023-10-19
; Argumentos: nulo
; Parametro: pegar um char da stack
; Modificador: eax
; Retorno: Devolve versão maior de um char
; Descrição: Converte um char em modo menor para modo maior (minusculo para maiusculo)
;------------------------------------------------------------

section .data

section .bss

section. text
    global delegua_para_maiusculo

delegua_para_maiusculo:
    nop
    push ebp ; move valor original de ebp para stack
    mov ebp, esp ; mov esp para ebp

    mov eax, [ebp + 8] ; lendo char da stack

    cmp eax, 0x61
    jb end
    cmp eax, 0x7A
    ja end
    sub eax, 0x20

end:
    mov esp, ebp
    pop ebp
    ret