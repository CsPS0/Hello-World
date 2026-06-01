# Limbo
implement Hello;

include "sys.m";

Hello: module
{
    init: fn(nil: ref Sys->FD);
};

init(nil: ref Sys->FD)
{
    Sys->print("Hello, World!\n");
}