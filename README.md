# Masalanpelto

[![Build Status](https://travis-ci.org/kpuputti/masalanpelto.png)](https://travis-ci.org/kpuputti/masalanpelto)

[Express](http://expressjs.com/) app for Masalanpelto housing association.

The app is running on Heroku at http://masalanpelto.herokuapp.com/

## Getting started

Install required tools:

* [heroku toolbelt](https://toolbelt.heroku.com/)
* [Node.js (along with npm)](http://nodejs.org/)

Install [Grunt](http://gruntjs.com/):

    npm install -g grunt-cli

Install [Compass](http://compass-style.org/)

    gem install compass

Install dependencies:

    npm install

## Environment

Environment can be configured with the following vars:

    PORT (optional)
    NODE_ENV (optional)
    MONGODB_URL (required)
    COOKIE_SECRET (optional)
    SESSION_SECRET (optional)
    GOOGLE_ANALYTICS_TRACKING_ID (optional)
    PASSWORD_HASH_ASUKAS (required)
    PASSWORD_HASH_HALLITUS (required)
    PASSWORD_HASH_ADMIN (required)
    AWS_ACCESS_KEY_ID (required)
    AWS_SECRET_ACCESS_KEY (required)
    S3_BUCKET_NAME (required)

For local development with Foreman, these can be specified in the `.env` file
ignored by Git.

## Running locally

Build static assets (public JavaScript + SCSS files):

    grunt

Build as files change:

    grunt watch

Start MongoDB:

    mongod

Start app:

    npm start

Now the app is running at `localhost:5000`.

## Testing

The test suite uses [Mocha](http://mochajs.org/) and
[Chai](http://chaijs.com/) assertions. The tests can be run with:

    npm test

## Deploying

    git push heroku master

## MIT-Licence

Copyright (c) 2012 Kimmo Puputti

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
