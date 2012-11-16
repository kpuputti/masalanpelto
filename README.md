# Masalanpelto

[Express](http://expressjs.com/) app for Masalanpelto housing association.

The app is running on Heroku at http://masalanpelto.herokuapp.com/

## Getting started

Install required tools:

* [heroku toolbelt](https://toolbelt.heroku.com/)
* [Node.js (along with npm)](http://nodejs.org/)

Install [Grunt](http://gruntjs.com/):

    npm install -g grunt

Install [Compass](http://compass-style.org/)

    gem install compass

Install dependencies:

    npm install

## Running locally

Build static assets (public JavaScript + SCSS files):

    grunt

Build as files change:

    grunt watch

Start app:

    foreman start

Now the app is running at `localhost:5000`.

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
