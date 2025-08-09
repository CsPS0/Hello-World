:- object(hello_world).

    :- public(message/0).

    message :-
        write('Hello, World!'), nl.

:- end_object.