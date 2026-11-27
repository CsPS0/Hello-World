.assembly extern mscorlib {}
.assembly hello {}
.method static void Main() cil managed
{
    .entrypoint
    ldstr "Hello, World!"
    call void [mscorlib]System.Console::WriteLine(string)
    ret
}