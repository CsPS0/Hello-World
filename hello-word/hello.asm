section .data
    hello db 'Hello, World!', 0x0A ; The string to print followed by a newline

section .text
    global _start                    ; Entry point for the linker

_start:
    ; Write the string to stdout
    mov eax, 4                      ; System call number for sys_write
    mov ebx, 1                      ; File descriptor 1 is stdout
    mov ecx, hello                  ; Address of the string
    mov edx, 14                     ; Number of bytes to write (13 characters + newline)
    int 0x80                        ; Call the kernel

    ; Exit the program
    mov eax, 1                      ; System call number for sys_exit
    xor ebx, ebx                    ; Exit code 0
    int 0x80                        ; Call the kernel