# Tiny<sup><sup>App</sup></sup>

Tiny<sup><sup>App</sup></sup> is a full stack web application build with Node and Express that allows users to shorten long URLs (like bit.ly)

## Final Product

!["Main Page"](https://github.com/lukehorak/tinyApp/blob/master/docs/Main%20Page.png?raw=true)
!["Link Page"](https://github.com/lukehorak/tinyApp/blob/master/docs/Link%20Page.png?raw=true)
!["Login Page"](https://github.com/lukehorak/tinyApp/blob/master/docs/Login%20Page.png?raw=true)

## Dependencies

- bcrypt 2.0.0
- body-parser ^1.19.0
- cookie-session ^1.3.3
- dotenv ^8.0.0
- ejs ^2.6.1
- express ^4.17.1
- method-override ^3.0.0
- nodemon ^1.19.1

## Getting Started

- Install all dependencies (using `npm install` after cloning this repo)
- Create a file called .env, and store a variable called `COOKIESALT`. This can be whatever you want it to be, but must exist
- Run the development server using `npm start` (assuming you don't edit the start script in package.json)