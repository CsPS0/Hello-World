.global _start

.text
_start:
    mov r0, #1      @ stdout
    ldr r1, =msg    @ address of string
    ldr r2, =len    @ length of string
    mov r7, #4      @ write system call
    svc #0          @ invoke syscall

    mov r0, #0      @ exit code
    mov r7, #1      @ exit system call
    svc #0          @ invoke syscall

.data
msg:    .ascii "Hello, World!\n"
.equ len, . - msg
