;; WebAssembly Text
(module
  (func (export "_start")
    (call $print_hello_world)
  )
  (func $print_hello_world
    (global.get $hello_world_ptr)
    (global.get $hello_world_len)
    (call $host_print)
  )
  (global $hello_world_ptr (mut i32) (i32.const 0))
  (global $hello_world_len (mut i32) (i32.const 13))
  (data (i32.const 0) "Hello, World!")
  (import "host" "print" (func $host_print (param i32 i32)))
)