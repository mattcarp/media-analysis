start express server, from project root:

    nodemon DEBUG=media-analysis:* npm start

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

demo hosting on aws `52.0.119.124:3000` (API is on :9000)

deployment:

    ssh upload-demo
    cd media-analysis
    git pull origin master
    nodemon DEBUG=media-analysis:* npm start

## black detection
try

    ffmpeg -i inputfile.mp4 -vf blackdetect=d=0.1:pix_th=.1 -f rawvideo -y /dev/null

where d=0.1 expresses the minimum length of black to detect in seconds. Lower this if you want single frames.
pix_th=.1 is the level of black to detect between 0 and 1. a setting of one will flag all frames, a setting of .01 should only grab black. tweak as needed.
