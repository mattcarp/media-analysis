start express server, from project root:

    DEBUG=media-analysis:* npm start

 ffprobe on command lne

    ffprobe -of json -show_streams -show_format /path/to/file

angular version (not working yet b/c of http sending too much data) is in /client
run it with `gulp`

demo hosting on aws `52.0.119.124:3000`

deployment:

    ssh upload-demo
    cd media-analysis
    git pull origin master
    nodemon DEBUG=media-analysis:* npm start
