# Authentication with http-only cookies and CORS

Example application that uses http-only cookies to send an authentication token which each request, in contrast to manually enriching each request with a token header.

When you need  to log in on a web application, the server will validate your credentials and sends a response if you are authenticated. You would not want to repeat this process for each subsequent request to the server. To prevent this, the server can send a token along with the response (e.g. in a cookie or a header) that you can send with each subsequent request to prove you are (still) authenticated. But where would you store this token? A lot of people seem to store it in memory or in browser storage (e.g. with the sessionStorage API). This has two drawbacks:

* the token can be accessed with JavaScript and is as such vulnerable to XSRF attacks 
* the token must be appended to each request by the developer, which is "prone to errors"...


What are http-only cookies?
https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Security

Using http-only cookies does not work with CORS (e.g. if the front end domain differs from the back end domain), because httponly cookies are not automatically send cross domain. It is possible to get the initial cookie with CORS, if the fetch option { credentials: "include" } is set, and the back-end is configured to send the header Access-Control-Allow-Origin with a valid, non-wildcard domain and the header Access-Control-Allow-Credentials to true.

https://javascript.info/fetch-crossorigin

This was implemented in barebones node + express for the backend, and "vanilla js" in the front-end, but the concepts are portable to all kinds of servers node (e.g. NestJS) or otherwise and all kinds of front-ends (e.g. React), becauses it concerns standards on the browser level. 

I do wonder if it will work with my Elm component, because I have to check if it uses XHR or Fetch and I don't know if and how I can set the withCredentials/credentials option.

Make a flow chart of when you need what part, e.g.:

* when the "secure" flag is set on a cookie (the authentication cookie), the browser will block it, unless the connection over which the cookie has been received is secured with SSL (HTTPS).
* when the endpoint (API) server is HTTPS, the front-end (static) server needs to be HTTPS too, to prevent "mixed content" warning (check this)
* httponly can't go over CORS? it needs SameSite:None and Secure:True flags on the cookie, otherwise it is blocked by the browser (expand this)

This does not cover how to update the token! If the token expires e.g. every 5 minutes, you would need to use keepalive ... same as token in session storage ... just call "refresh" endpoint that is like "login" endpoint on a setInterval e.g. every 4.5 minutes.

## Todo

* create certificates: openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem - from node https docs 

openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
    -keyout localhost-privkey.pem -out localhost-cert.pem // see https://nodejs.org/api/http2.html

HTTP/2 | Node.js v15.2.0 Documentation
Extends: <EventEmitter> Instances of the http2.Http2Session class represent an active communications session between an HTTP/2 client and server. Instances of this class are not intended to be constructed directly by user code.. Each Http2Session instance will exhibit slightly different behaviors depending on whether it is operating as a server or a client.
nodejs.org

* cookie can become to big for the browser, more than 4k? reason not to use httponly cookies e.g. combine with keycloak-like solutions
* document why the logout endpoint is needed
* create a readme
* conditional credentials:true in all spots in index.html
* show how to do CORS with and without https (also to show XHR works without https and fetch only with https) - also update the instructions with a step 5 to show how to enable https server and make fetch work again (over cors)
* use res.clearCookie('name', { path: '/admin' }) for logout endpoint
* make example with http2/spdy instead of https, and document why and what the alternative/old way is: https://stackoverflow.com/questions/59534717/how-to-integrate-http2-with-expressjs-using-nodejs-module-http2

## Run the example application

nvm use 15
yarn
yarn start