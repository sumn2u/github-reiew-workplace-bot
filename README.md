# Github Review Workplace Bot
A little Node.js bot made for workplace, checking GitHub Pull Requests for peer reviews, automatically labeling and merging PRs appropriately.

The bot responds to GitHub web hooks and labels pull requests either as 'needs-peer-review' or as 'peer-reviewed', depending on how many people have commented with a reassuring 'LGTM!' and post it to the group.

#### Configuration
To configure this little bot, go check out `config.js` and either change the file or set environment variables. Here are the properties:

* `github` (default: empty)The github hostname, if you are using the Enterprise Github
* `user` User/organization owning the repository
* `repo` Repository to watch (case-studies)
* `botUser` Bot's GitHub username
* `botPassword` Bot's Github password
* `labelReviewed` Name of the label indicating enough peer reviews
* `labelNeedsreview` Name of the label indicating missing peer reviews
* `reviewsNeeded` Number of reviews needed
* `instructionsComment` Comment posted by the bot when a new PR is opened - if you use `{reviewsNeeded}` in your comment, it'll automatically be replaced with the number of reviews needed
* `mergeOnReview` (default: false) If set to true, the bot will automatically merge a PR as soon as it consideres it revieweed
* `pullRequestsStatus` (default: open) Status of the pull requests to consider. Options are: all|open|closed
* `oauth2token` If set, we'll use an OAuth token instead of the username/password combination to authenticate the bot
* `excludeLabels` If set, the bot will automatically ignore PRs with those labels (format: `no-review i-hate-reviews`)
* `filenameFilter` If set, the bot will only act on PRs that impact files with filenames matching this filter, tested using `indexOf` (format: `["_posts", ".md"]`)
* `owner` Owner of the repository

#### Installation
A small number of things is needed to get the bot started:

* Create a GitHub user for your bot (or use an already existing account)
* Create the two labels used by the bot using GitHub's label feature (go to your repo's issues and select 'Labels' in the top navigation bar)
* Give your bot a home in the public Internet
* Create a web hook for all relevant events pointing to http://{your-bot}/pullrequest

Then, simply copy the files to your server and start the both with `npm start`.

#### License
(C) Copyright 2017 Suman Kunwar. Licensed as MIT - please check LICENSE for details.
