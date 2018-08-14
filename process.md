# README

## Initial Instructions

Continuous integration is a valuable way to ensure that all changes to a project’s code are tested, but keeping track of CI builds (especially those that fail) can be challenging in many cases. For example, a contributor to an open source project might open a pull request whose tests fail, but complicated build logs appear out of the context of a pull request, and may turn away new developers.

Your mission, should you choose to accept it, is to use GitHub’s API and webhooks to build a Node.js application that retrieves logs from the continuous integration service and creates a new comment in the relevant pull request, describing (with the error logs) what failed.

You can use Probot, a framework for building GitHub Apps, but you do not have to. You may also use any NPM modules that you find useful.

### Some details:

- [x] The app only needs to work with a single CI provider (ex: CircleCI, TravisCI, etc).
- [x] It only needs to work with public repositories.
- [x] The app can choose to only work with a specific test runner (ex: Jest, Mocha, etc).
- [x] Your application should have integration/unit tests where applicable.

## Details

A repository with well-documented code and a descriptive README, explaining your approach and the challenges you encountered (and how you solved them).

A second repository in which you've demoed your app, showing an open pull request where your app has created a comment.
We are also interested in hearing about friction and pain points building this application, using the GitHub API, Probot and interacting with your CI provider of choice. Keep a list of issues you encounter that could be opportunities to improve the implementation or documentation to share with the teams later.

## How it went

This was overall a neat project that taught me a lot about parts of the github ecosystem I hadn't had reason to explore until now. It turned out that my inexperience to the tools was also the biggest challenge.

### Part 1 - Setting Up

I started off with the intention of simply getting a Probot app set up and running on any old repository. It all went well, a quick read through the docs, a few silly mistakes and I had the app running locally. The first hard part was understanding how each of these things were connected, it took me a few hours of reading and googling to understand how Github Apps, Github Webhooks, Smee, Probot, and my repository were all connected and how information was supposed to flow.

**Suggestion** The time I spent looking up the documentation of each indivual technology was not unexpected, but honestly it seemed like a missed opportunity on the part of Probot. If Probot wants to be the primary framework for building Github Apps, then it would be awesome if they wrote the primer on how all of these technologies come together. It would make them the easy choice for many developers that want to build their first Github App.

The biggest time suck was figuring out that the Github App had to request permission for each action from a repo. For hours I couldn't understand why I could interact with github issues but couldn't see a pull request creation event come through. It immediately made sense when I saw the answer, and it made me feel a bit slow, thankfully after that I learned my lesson and that kind of issue never tripped me up for too long afterward.

### Part 2 - Circle CI

I have worked on projects that already had continuous integration set up - but had never added it to a repo myself. This was the part of the project I actually enjoyed the most, because I've been interested in CI and wanted to know more about it but had never found the time for it. I created a quick repo, looked up the circle ci docs, and tried it out. The initial set up was easier than I expected.

### Part 3 - Putting it all together

I experienced some frustration trying to put it all together, mostly in trying to understand the Circle CI API and how to isolate the failure message I wanted to add as the pulll request comment. Every night after work this week I spent a few hours playing around with Postman and the Circle CI api, most of the time with little to show at the end.

Having come this far with the project, if I were to do this all over again I would use Travis instead of Circle for CI because in my research it sounded as if Travis' API is better integrated with Github. May or may not be true but I would like to try it.

### Part 4 - Cleanup

After creating a rough proof of concept program (you can see that initial program in the file ./index.old.js), I knew that I could use probot to add comments to a pull request if the CI build failed. But I knew the program was messy, and all the functionality was nested into one long action. I wanted to clean it up and make it into something better, but I wasn't quite prepared for how much work I was in for.

I refactored the steps of the original program into functions of a CI-Commenter class, and quickly realized that my original program could never have supported watching multiple repositories. To watch multiple repositories, and also in order to not store everything in memory, I had to create a database. Having a database required adding express to probot, and one thing lead to another until the app was larger than I had anticipated. It is far from perfect, but I think I was able to make a huge improvement.


## Conclusion

In conclusion, the pain points were mostly caused by the Circle CI API and Github API having in some ways too much and too broad of documentation, without very many good articles (that I found) to orient a person who is new to the tools. Especially when it came to generating artifacts from a circle ci build. Testing Probot was also more difficult than I expected. All in all though, it was not a bad experience at all, and I learned a ton.
