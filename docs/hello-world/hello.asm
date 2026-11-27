section .data
    hello db 'Hello, World!', 0x0A

section .text
    global _start

_start:
    mov eax, 4
    mov ebx, 1
    mov ecx, hello
    mov edx, 14
    int 0x80

    mov eax, 1
    xor ebx, ebx
    int 0x80
