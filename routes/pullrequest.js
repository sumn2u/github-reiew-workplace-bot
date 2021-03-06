var express = require('express'),
    bot = require('../src/bot'),
    config = require('../config'),
    debug = require('debug')('reviewbot:pullrequest'),
    router = express.Router();

/**
 * Respond using a given Express res object
 * @param {Object} res - Express res object
 * @param {string|string[]} message - Either a message or an array filled with messages
 */
function _respond(res, message) {
    if (res && message) {
        if (message.isArray) {
            return res.json({messages: JSON.stringify(message)});
        } else {
            res.json({message: message});
        }
    }
}

/**
 * Process Pull Request
 * @param {string[]} labelResult - Result as generated by bot.checkForLabels;
 * @param {Object} pr - PR currently handled
 */
function processPullRequest(labelResult, pr) {
    // Check if we're supposed to skip this one
    if (labelResult.labeledExclude) {
        return debug('PR ' + pr.number + ' labeled to be exlcuded from the bot, stopping');
    }
    // Check for filenameFilter
    bot.checkForFiles(pr.number, function (isFilenameMatched) {
        if (!isFilenameMatched) {
            return debug('PR ' + pr.number + ' does not match filenameFilter, stopping');
        }

        // this is needed from workplace
        // Let's get all our comments and check them for approval
        bot.checkForApprovalComments(pr.number, function (approved) {
            var labels, output = [];

            // Check for instructions comment and post if not present
            bot.checkForInstructionsComment(pr.number, function (posted) {
                if (!posted) {
                    debug('No intructions comment found on PR ' + pr.number + '; posting instructions comment');
                    bot.postInstructionsComment(pr.number);
                }
            });

            // Stop if we already marked it as 'needs-review' and it does need more reviews
            if (labelResult.labeledNeedsReview && !approved) {
                return debug('PR ' + pr.number + ' already marked as "needs-review", stopping');
            }

            labels = labelResult.labels.map(function (label) {
                return label.name;
            });

            // Update the labels
            output.push('Updating labels for PR ' + pr.number);
            bot.updateLabels(pr.number, approved, labels, function(result){
            });
            if(isFilenameMatched.sha){
              bot.checkForStatus(isFilenameMatched.sha, function(success) {
                  // If we're supposed to merge, merge
                  if (success && approved && config.mergeOnReview && !pr.merged) {
                      output.push('Merging on review set to true, PR approved, merging');
                      bot.merge(pr.number);
                  }
              })
            }
        });
    });
}

/**
 * POST /pullrequest: Process incoming GitHub payload
 */
router.post('/', function (req, res) {
    if (!req.body) {
        return debug('POST Request received, but no body!');
    }

    // Check if it's a simple PR action
    if (req.body.pull_request && req.body.pull_request.number) {
        bot.checkForLabel(req.body.pull_request.number, req.body.pull_request, processPullRequest);
        return _respond(res, 'Processing PR ' + req.body.pull_request.number);
    }

    // Check if it's an issue action (comment, for instance)
    if (req.body.issue && req.body.issue.pull_request) {
        bot.getPullRequest(req.body.issue.number, function (pullRequests) {
            if (!pullRequests || pullRequests.length < 0) {
                return debug('Error: Tried to process single pull request, but failed');
            }

            bot.checkForLabel(pullRequests[0].number, pullRequests[0], processPullRequest);
        });

        return _respond(res, 'Processing PR ' + req.body.issue.number);
    }
});

/**
 * GET /pullrequest: Process all pull requests
 */
router.get('/', function (req, res) {
    bot.getPullRequests(function (pullRequests) {
        var pr, i;

        // For each PR, check for labels
        for (i = 0; i < pullRequests.data.length; i = i + 1) {
            pr = pullRequests.data[i];
            bot.checkForLabel(pr.number, pr, processPullRequest);
        }

        return _respond(res, 'Processing ' + pullRequests.data.length + ' PRs.');
    });
});

/**
 * GET /pullrequest/:id: Process Single Pull Request
 */
router.get('/:id', function (req, res) {
    debug('Received request to process PR #' + req.params.id);

    bot.getPullRequest(req.params.id, function (pullRequests) {
        if (pullRequests && pullRequests.length > 0) {
            bot.checkForLabel(req.params.id, pullRequests[0], processPullRequest);
        } else {
            return debug('PR ' + req.params.id + ' not found');
        }
    });

    return _respond(res, 'Processing PR #' + req.params.id);
});

module.exports = router;
