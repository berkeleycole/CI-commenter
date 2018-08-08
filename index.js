require('dotenv').config()
const json = require('express-json')
const bodyParser = require('body-parser')
const ProjectService = require('./project.js')

module.exports = probot => {
	console.log("SETTING UP APP");
	// uses Probot built in express to create routes for projects
	const app = probot.route('/projects')
	app.use(json())
	app.use(bodyParser.json())

	// creates a new service to handle sending messages to multiple repos
	console.log("Creating new project service");
	const Project = new ProjectService(probot, 'user', '123123')

	// BASIC CRUD

	// CREATE new projects
	app.post('/', (req, res) => {
		const { username, project, token } = req.body

		Project.create(username, project, token)
		.then(data => {
			res.json({
				...data,
				...req.body,
			})
		})
		.catch(err => handleErr(res, err.detail))
	})

	// GET all projects
	app.get('/', (req, res) => {
		Project.list()
		.then(data => {
			res.json(data)
		})
		.catch(err => handleErr(res, err.detail))
	})

	// DELETE a project
	app.delete('/:id', (req, res) => {
		const id = req.params.id

		Project.destroy(id)
		.then(data => res.json({}))
		.catch(err => handleErr(res, err.detail))
	})

	return Project
}

// error handler logs to console and creates a response
const handleErr = (res, err) => {
	console.log(err);

	res.json({error: err})
}
