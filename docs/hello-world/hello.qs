namespace HelloWorld {
    open Microsoft.Quantum.Diagnostics;

    @EntryPoint()
    operation SayHello() : Unit {
        Message("Hello, World!");
    }
}
