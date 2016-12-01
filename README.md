# How to run this stuff

Install NodeJS
https://nodejs.org/en/download/current/

Install the dependencies
```bash
npm install
```

Start the dev server that uses webpack (see details in the webpack.config.js)
```
npm start
```

Open the webserver in either Chrome or Firefox and point to
> http://localhost:8081


# Building and installing into DHIS2

Edit src/index.html to make it load bundle.js, see instructions in that file.
Then open src/api.js and make sure serverUrl is set to the correct relative URL.

Make sure webpack is installed, then build:
```
webpack --progress --verbose
```


Zip everything, upload to DHIS. That's it.
