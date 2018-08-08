# CI-COMMENTER

## Setup

CI-Commenter monitors a registered Github project for pull requests with failing builds from Circle CI. If a build fails, it will add a comment to the pull request thread containing the Jest messages about which tests are failing.

## Support

Right now, CI-Commenter only works with Circle CI. It can monitor multiple repos, as long as those repos are public.
