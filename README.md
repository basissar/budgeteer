# Budgeteer Finance Tracker

This is a repository for a Budgeteer Finance Tracker web application.

## Running the app
Project is containerized. Upon cloning the repository simply run `docker-compose up`. If it is your first time, run the command with `--build` flag.
Ports on which each of container is being run are specified in the [docker-compose.yml](https://github.com/basissar/budgeteer/blob/main/docker-compose.yml).

By default backend is run on port 8000, frontend on 3000 and database on 5433. 

For the purpose of testing log into the app with these credentials.

username = admin

password = password



## Features
- Expense tracking:
  - User can log expenses for pre-created categories as well as custom categories created by them
  
- Financial analysis:
  -  User will be provided with simple financial analysis in a form of graph and pie chart
  -  Graph will show overview of expenses amount over the last 7 days
  -  Pie chart will provide user with percentage overview of spendings within categories as such over desired period of time

- Budgeting:
  - User is able to set up budget limits for each spending category
  - Such limits can be set to be renewed daily/weekly/monthly/yearly
 
- Savings:
  -  User can see how much money they saved on wanted and/or needed things by setting up savings goals

- Gamification:
  -  Budgeteer is a gamified finance tracker, meaning that user will be rewarded for using this app
  -  Exerience points and credits can be gained by logging expenses, staying within setup budget limits or adding money to their savings goals
  -  Users eventually levels up when enough experience is gained and obtains additional credits
  -  User can choose from 2 avatars which he can later customize with obtained credits

 
- Wallets:
  -  User can create up to 3 wallets so that he can differentiate between his cash flow and bank account status 

## Technologies 

-  Deno:
   -  Secure JavaScript/TypeScript runtime

-  ~~DenoDB~~:
    -  removed due to problems with data model and compatibility

- Sequelize-Typescript:
    - Typescript-friendly ORM library 
    - used instead of DenoDB

-  PostgreSQL database:
   -  Specific database provider is still TBD
   -  Current adepts: Neon Tech, FLy.io, ElephantSQL,

-  Oak
   -  Middleware framework for creating RESTful apis

-  Deno Deploy
   -  Free deployment with GitHub integreation

## Prototype

Low fidelity prototype can be found [here](https://www.figma.com/file/1aMCWOVfEzj4qrMws1AQkg/Budgeteer_LOFI?type=design&node-id=0%3A1&mode=design&t=DpbqEXuPoK9uCUj5-1)

