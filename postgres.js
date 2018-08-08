const pgp = require('pg-promise')()

const createConn = (username, password, host = "127.0.0.1", port = "5432", db = "ci_commenter") => {
	return pgp(`postgres://${username}:${password}@${host}:${port}/${db}`)
}

const { PG_USER, PG_PASSWORD } = process.env

const DB = createConn(PG_USER || 'user', PG_PASSWORD || '123123')

module.exports = DB
