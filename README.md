
start express server, from project root:

    nodemon DEBUG=media-analysis:* npm start | bunyan

### Bash: Open Chrome and ignore CORS errors

    open -a Google\ Chrome --args --disable-web-security

start ui server from media-analysis/client

    gulp

then hit the ui on localhost:9000

ffprobe on command line

    ffprobe -of json -show_streams -show_format /path/to/file

### make a rest endpoint

in app.js, add the route, e.g.:

    app.use('/black', black);

    <!-- and in the declaration section (same file): -->

    var black = require('./routes/black');

make a file in the `routes` folder called `black.js`
you'll need to manually restart the server to see the new endpoint

angular version (not working yet b/c of http sending too much data) is in /client
run it with `gulp`

demo hosting on aws http://media-analysis.asburyproto.com/

deployment:
    push to github

    ssh upload-demo
    cd media-analysis
    git fetch --all
    git reset --hard origin/master
    forever -f npm start

    // or to debug, instead of last line:
    nodemon DEBUG=media-analysis:* npm start | bunyan

NOTE: you may have to run gulp on /client in order to compile to js

debug forever failing on prod server
    nodemon DEBUG=media-analysis:* npm start | bunyan &



## ffmpeg

### black detection
this will give you black_duration, but you'll have more text to filter out:

    ffprobe -f lavfi -i "movie=mp4boxjs_issue_69_AitakuteIma_G010001894725Z_ProgramOnly.mov,blackdetect[out0]" -show_entries tags=lavfi.black_start,lavfi.black_end,lavfi.black_duration -of default=nw=1

where d=0.1 expresses the minimum length of black to detect in seconds. Lower this if you want single frames.
pix_th=.1 is the level of black to detect between 0 and 1. a setting of one will flag all frames, a setting of .01 should only grab black. tweak as needed.

### mono detection

first, demux to wav with ffmpeg

    ffmpeg -i my_video.mp4 output_audio.wav

SoX mono detect: If Pk lev dB shows as -inf, channels 1 and 2 are identical.
There's a file in /Volumes/Transcend/media_test_files/wav as below:

    sox dual_mono_from_video.wav -n remix 1,2i stats

### media metadata
a good ffprobe line showing all metadata and suppressing header (single line):

    ffprobe -v quiet -sexagesimal -of json -show_format -show_streams -show_chapters -show_programs -show_private_data -i MVD_000000326734_001.26.mpg

bash extract header from file

    head -c 150000 my_file.mov > header.txt

and concat the header onto a binary slice

    cat header.txt > out.mov

### extract image at around 60 seconds (just for fun)

    ffmpeg -ss 60 -i input.mp4 -qscale:v 2 -vframes 1 output.jpg

### for testing, get first 2 megs of file (use `tail` for tail)

    head -c 2000000 input_file.mov > prores_first_2_megs.mov

then you stick stick header onto the end of the file

    cat file1 file2 file3 file4 file5 file6 > out.txt
