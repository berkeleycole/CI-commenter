const Commenter = require('../commenter.js')
const { Application } = require('probot')
const myProbotApp = require('../index')
const ProjectService = require('../project.js')
const fs = require('fs')

const status_failed = JSON.parse(fs.readFileSync('./test/responses/status_failed.json').toString())
const ci_response = JSON.parse(fs.readFileSync('./test/responses/ci_response.json').toString())
const ci_artifact = JSON.parse(fs.readFileSync('./test/responses/ci_artifact.json').toString())
const pull_request_number = JSON.parse(fs.readFileSync('./test/responses/pull_request_number.json').toString())

describe('commenter program', () => {
	let app, github

	const Project = new ProjectService()

	beforeEach(async () => {
		// Initialize the app based on the code from index.js
		app = new Application()

		// This is an easy way to mock out the GitHub API
		app.load(myProbotApp)

		github = {
			issues: {
				createComment: jest.fn().mockReturnValue(Promise.resolve({}))
			}
		}

		await Project.create("berkeleycole", "portfolio-test", "96aedb942956150287469e07360c91371acc32ca")
		.catch(err => console.log("err creating project:", err))

		app.auth = () => Promise.resolve(github)
	})

	afterEach(async () => {
		await Project.destroyAll()
		.catch(err => {
			if (err.message !== "No data returned from the query.") {
				console.log("err truncating projects", err)
			}
		})
	})

	describe('the whole process', () => {
		fetch
			.once(status_failed)
			.once(ci_response)
			.once(ci_artifact)
			.once(pull_request_number)

		it('works...', async () => {
			await app.receive({
				event: 'status',
				payload: status_failed,
			})

			// await github.issues.createComment()

			expect(github.issues.createComment).toHaveBeenCalled()
		})
	})

	// describe('registerStatusEvent function', () => {
	// 	it('waits for a failure event and runs a callback', => {
	//
	// 	})
	// })
	//
	// describe('handleFailure function', () => {
	// 	it('creates a comment', {
	//
	// 	})
	// })
	//
	// describe('PRs with failing builds', () => {
	// 	it('Creates a comment when a PR build fails', async () => {
	// 		await app.receive({
	// 			event: 'status',
	// 			payload: failedStatusPayload
	// 		})
	//
	// 		expect(github.issues.createComment).toHaveBeenCalled()
	// 	})
	// })
	//
	// describe('PRs with succeeding builds', () => {
	// 	it('Does not create a comment if a build succeeds', async () => {
	// 		await app.receive({
	// 			event: 'status',
	// 			payload: failedStatusPayload
	// 		})
	//
	// 		expect(github.issues.createComment).toNotHaveBeenCalled()
	// 	})
	// })
})
