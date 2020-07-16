this example uses no framework (angular, extjs, etc.), and relies only on the tus client library for javascript in the browser, and the reference tusd binary on the server

client:

   https://github.com/tus/tus-js-client

server (tusd):

   https://github.com/tus/tusd
    

to avoid CORS errror, from root:

 python -m SimpleHTTPServer

app will be on localhost at port 8000. you will need to refresh the browser manually, you spoiled angular brat.


## server config - ec2 t3 small
ip 

    18.213.229.220

tusd dir

   /usr/bin/tusd 

export en vars for tusd

  $ export AWS_ACCESS_KEY_ID=xxxxx
  $ export AWS_SECRET_ACCESS_KEY=xxxxx
  $ export AWS_REGION=us-east-1

run tusd from it's directory, specifying bucket

  tusd -s3-bucket=tus-upload-demo

//  .s3-website-us-east-1.amazonaws.com