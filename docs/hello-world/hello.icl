module hello

import StdEnv

Start :: *World -> *World
Start world = write "Hello, World!" world