const Commenter = require('./commenter.js')
const PG = require('./postgres')
/*
PROJECT SERVICE

This file handles all db calls, separating them from the commenter logic. All db queries should be made here

*/

class ProjectService {
	constructor(probot) {
		this.db = PG

		if (probot) this.probot = probot

		// watchers are the projects -- each with their own instance of Commenter
		this.watchers = {}

		this.initDB()
		.then(() => this.loadData())
		.catch(err => console.log("error initializing project service", err))
	}

	list() {
		return this.db.any(`SELECT * FROM projects`)
	}

	create(username, project, token) {
		return this.db.one(`INSERT INTO projects (username, project, token) VALUES($1, $2, $3) RETURNING id`, [username, project, token])
		.then((res) => {
			const id = res.id

			console.log(`creating commenter instance for ${id} : ${username}/${project}`);

			this.watchers[id] = new Commenter({
				probot: this.probot,
				user: username,
				project: project,
				token: token,
			})

			return res
		})
	}

	destroy(id) {
		return this.db.one(`DELETE FROM projects WHERE id=$1`, [id])
		.then((data) => {
			delete this.watchers[id]

			return data
		})
	}

	destroyAll() {
		return this.db.one(`TRUNCATE projects`)
		.then((data) => {
			this.watchers = {} // reset in-memory value

			return data
		})
	}

	initDB() {
		// load the uuid extension
		return this.db.any(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
		.then(data => {
			// create tables after the extension is loaded
			return this.db.any(`CREATE TABLE IF NOT EXISTS projects (
				id UUID DEFAULT uuid_generate_v1(),
				project VARCHAR(255) NOT NULL,
				username VARCHAR(255) NOT NULL,
				token VARCHAR(255) NOT NULL,
				UNIQUE (project, username, token),
				CONSTRAINT project_pkey_ PRIMARY KEY (id)
			)`)
			.catch(err => console.log(err))
		})
		.catch(err => console.log(err))
	}

	loadData() {
		return this.list().then(projects => {
			projects.map(p => {
				console.log(`creating commenter instance for ${p.id} : ${p.username}/${p.project}`);

				this.watchers[p.id] = new Commenter({
					probot: this.probot,
					project: p.project,
					user: p.username,
					token: p.token,
				})
			})
		})
	}
}

module.exports = ProjectService
