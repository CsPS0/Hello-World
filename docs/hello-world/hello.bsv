(* synthesize *)
module sysHello();
    rule hello;
        $display("Hello, World!");
        $finish(0);
    endrule
endmodule
