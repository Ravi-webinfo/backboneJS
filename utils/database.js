const mysql2 = require('mysql2')
const knex = require('knex')




const connection_config = {
  user: 'root',
  host: 'localhost',
  password: '',
  database: 'wp_blogs'
}

const database = knex({
  client: 'mysql2',
  connection: {
    ...connection_config
  }
})

database.raw("SELECT 1").then(function(data) {
  console.log('database connection has been established.')
}).catch(function(error) {
  console.log('Database connection failed' + error.message);
})

exports.database = database;