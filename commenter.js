const { Application } = require('probot')
const { findPrivateKey } = require('probot/lib/private-key')
const fetch = require("node-fetch")
const fs = require('fs')

/*

If the ci build of a new pull request fails, add a comment to the correct pull request thread with information about the failure:

	1. A pull-request is opened or re-opened
	2. Listening for a 'status' event with state of 'failure'
	3. A 'failure' state requies fetching the artifact to determine what failed.
	4. A request to github to find the matching pull request.
	5. Create a comment on the pull-request with the information about the failure.

*/

class Commenter {
	constructor({probot, vcs_type = 'github', user, project, token}) {
		this.user = user
		this.project = project
		this.ci_url = `https://circleci.com/api/v1.1/project/${vcs_type}/${user}/${project}/latest/artifacts?circle-token=${token}&filter=failed`

		// begin commenter watching for a failed build
		if (probot) {
			this.registerStatusEvent(probot, 'status', 'failure', this.handleFailure.bind(this))
		} else {
			console.log("::: COMMENTER CREATED WITHOUT PROBOT :::");
		}
	}

	// watches for a failing status event from probot
	registerStatusEvent(probot, event, status, fn) {
		probot.on(event, (context) => {
			if (context.payload.state === status) {
				// check for the full_name and user/project to match
				// this logic allows the handling of multiple repositories
				if (`${this.user}/${this.project}` === context.payload.repository.full_name) {
					console.log(`got ${event}/${status} for ${this.user}/${this.project}`);

					fn(context)
				}
			}
		})
	}

	// If a failing event is found, triggers the fetchCIResponse and fetchArtifact promises
	handleFailure(context) {
		return this.fetchCIResponse()
		// if the artifact is found, run createComment, passing in the messages retrieved by fetchArtifact
		.then(messages => this.createComment(context, messages))
		.catch(err => console.log('Failed to create comment: ', err))
	}

	// Calls to circleci for the failure
	fetchCIResponse() {
		return fetch(this.ci_url, {headers: {"Accept": "application/json"}})
		.then(res => res.json()) // find url of the artifact file
		.then(res => res[0].url)
		.then(url => this.fetchArtifact(url)) // run the fetchArtifact function
		.catch(err => {
			console.log(`Failed to reach ci_url: ${ci_url}`, err)
		})
	}

	// Gets the contents of the artifact file (a text file of failure messages from Jest) from the circleci failed build
	fetchArtifact(url) {
		return fetch(url)
		.then(artifact => artifact.json()) // turn the file to json
		.then(artifact => { // save only the messages of failing tests
			return artifact.testResults
			.filter(test => test.status === 'failed') // filter failing tests
			.map(test => test.message) // save failing test messages for use in the comment
		})
		.catch(err => console.log("failed to find artifact:", err))
	}

	// assemble and send the comment
	createComment(context, messages) {
		const { commit } = context.payload

		// the pull request number is a required piece of information for creating a comment, must fetch it
		this.fetchPRNumber(commit.parents[0].sha)
		.then(number => {
			// assemble comment info
			const commit_id = commit.sha
			const body = `Oh no! A test failed, this was the error message recieved:\n\n${messages.join('\n\n')}\n\n\n`

			// build comment
			const comment = {commit_id, number, body}

			// create comment
			return context.github.issues.createComment(context.issue(comment))
		})
		.catch(err => console.log("create comment:", err))
	}

	// find the pull request number
	// NOTE: Here I am assuming that the pull request with the failing build is the most recent pull request -- which is why I find res[0].number
	fetchPRNumber(sha) {
		return fetch(`https://api.github.com/repos/${this.user}/${this.project}/pulls`)
		.then(res => res.json())
		.then(res => {
			console.log("::: RESPONSE IN FETCH_PR :::");
			console.log(res);

			return res[0].number
		})
		.catch(err => console.log("failed to find pull request number:", err))
	}
}

module.exports = Commenter
