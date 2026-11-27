.global _start

.text
_start:
    mov r0, #1
    ldr r1, =msg
    ldr r2, =len
    mov r7, #4
    svc #0

    mov r0, #0
    mov r7, #1
    svc #0

.data
msg:    .ascii "Hello, World!\n"
.equ len, . - msg