section .bss
    buffer resb 256

section .data

section .text
    global _start

_start:
    ;escreve no buffer
    mov eax, 3
    mov ebx, 0
    mov ecx, buffer
    mov edx, 0xff
    int 0x80

    ;calcula o tamanho da string
    call calcula_tamanho_string

    mov eax, 1
    int 0x80

calcula_tamanho_string:
    pusha
    mov eax, buffer ; coloca o endereço do buffer em eax
    mov ecx, 0 ; contador
loop_se_nao_nulo:
    mov al, [eax + ecx] ; coloca o primeiro caracter em al
    inc ecx ; incrementa o contador
    cmp al, 0 ; verifica se o caracter é nulo
    jne loop_se_nao_nulo ; se não for, continua
    popa
    ret