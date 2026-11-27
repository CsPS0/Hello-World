local C = terralib.includecstring [[
   #include <stdio.h>
]]

terra main()
    C.printf("Hello, World!\n")
end

main()
