# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (ähnlich wie bit.ly).

## Final Product

!["User Registration"](https://github.com/JoshuaRully/tinyapp/blob/master/screenshots/UserRegistration.png?raw=true)
!["User Login"](https://github.com/JoshuaRully/tinyapp/blob/master/screenshots/UserLogin.png?raw=true)
!["Create a short URL"](https://github.com/JoshuaRully/tinyapp/blob/master/screenshots/urlCreation.png?raw=true)
!["Keep track of your URLs easily"](https://github.com/JoshuaRully/tinyapp/blob/master/screenshots/userUrlsList.png?raw=true)
!["Edit you URLs"](https://github.com/JoshuaRully/tinyapp/blob/master/screenshots/urlEdit.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node expressServer.js` command.
- Open your browser of choice and navigate to localhost:8080 where you'll be redirected to localhost:8080/register

## Usage

- Make an account to start creating short URLs
- You may edit/delete your created links with the labeled buttons
- You may share the shortURLS you've created with the following format http://localhost:8080/u/'shortURL' where 'shortURL represents the randomly generated link