const ProjectService = require('../project.js')
const { Application } = require('probot')

describe('project service', () => {
	let Project

	beforeEach(() => {
		// Initialize the app based on the code from index.js
		let probot = new Application()
		Project = new ProjectService(probot, 'user', '123123')
		Project.destroyAll()
		.catch(err => console.log(err))
	})

	afterEach(() => {
		Project.destroyAll()
		.catch(err => console.log(err))
	})

	describe('List', () => {
		it('returns an empty array if there are no projects', () => {
			Project.list()
			.then(projects => {
				expect(projects).toEq([])
			})
			.catch(err => console.log(err))
		})
		it('returns an array of one if there is one project', () => {
			Project.create({
				"username": "berkeleycole",
				"project": "test",
				"token": "1cc94c91b04e237e0d675351ff"
			})
			.then(res => {
				Project.list()
				.then(projects => {
					expect(projects).length.toBe(1)
					expect(projects[0].username).toBe("berkeleycole")
					expect(projects[0].project).toBe("test")
					expect(projects[0].token).toBe("1cc94c91b04e237e0d675351ff")
				})
				.catch(err => console.log(err))
			})
			.catch(err => console.log(err))
		})
	})

	describe('Create', () => {
		it('creates a new project', () => {
			let project = {
				username: "berkeleycole",
				project: "test",
				token: "1cc94c91b04e237e0d675351ff"
			}

			Project.create(project)
			.then(created => {
				expect(created.id).toExist()
				expect(created.username).toBe("berkeleycole")
				expect(created.project).toBe("test")
				expect(created.token).toBe("1cc94c91b04e237e0d675351ff")
			})
			.catch(err => console.log(err))
		})
	})

	describe('Destroy', () => {
		it('destroys a project', () => {
			let project = {
				username: "berkeleycole",
				project: "test",
				token: "1cc94c91b04e237e0d675351ff"
			}

			Project.create(project)
			.then(created => {
				Project.destroy(created.id)
				.then(res => {
					Project.list()
					.then(res => {
						expect(res).toEq([])
					})
					.catch(err => console.log(err))
				})
				.catch(err => console.log(err))
			})
			.catch(err => console.log(err))
		})
	})
})
