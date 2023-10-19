extern exit, exit0, strlen, itoa, atoi, endl, printstr, printint, readstr, readint

%ifidn __OUTPUT_FORMAT__, macho64
    default rel
    %define _start _main
%endif