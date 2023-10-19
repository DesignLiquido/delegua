;------------------------------------------------------------
; Nome: delegua_para_minusculo
; Criador: ItaloCobains
; Data: 2023-10-19
; Argumentos: nulo
; Parametro: pegar um char da stack
; Modificador: eax
; Retorno: Devolve versão menor de um char
; Descrição: Converte um char em modo maior para modo menor (maiusculo para minusculo)
;------------------------------------------------------------


section .data

section .bss

section .text
    global delegua_para_minusculo

delegua_para_minusculo:
    nop
    push ebp
    mov ebp, esp

    mov eax, [ebp + 8]

    cmp eax, 0x41
    jb end
    cmp eax, 0x5A
    ja end
    add eax, 0x20

end:
    mov esp, ebp
    pop ebp
    ret