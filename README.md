#run 

-npm install

# configure Database

- create database and make table name blogs
- you can find schema in utils and also database.js file for configure database connection by changing credentials.

# after creating database 

import utils/blogs.sql file in your database

# make change in utils/database.js

const connection_config = {
  user: 'your db  username',
  host: 'your db host',
  password: 'your db password',
  database: 'your db name'
}


# run command

- npm start

# open browser

- hit the url => http://localhost:3000/
