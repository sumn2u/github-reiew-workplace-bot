var pe = process.env,
    config = {};

/**
 * To configure the bot, either set the values here directly -
 * or set environment variables.
 * SEE README.MD FOR DETAILS
 */
// GHE user may need to setup this
config.github = pe.github || '',
config.user = pe.targetUser || 'sumn2u',
config.repo = pe.targetRepo || 'jquery-for-web-demo',
config.botUser = pe.botUser || 'YOUR_BOT_NAME',
config.botPassword = pe.botPassword || 'YOUR_BOT_PASSWORD',
config.labelReviewed = pe.labelReviewed || 'peer-reviewed',
config.labelNeedsReview = pe.labelNeedsReview || 'needs-peer-review',
config.reviewsNeeded = pe.reviewsNeeded || 3;
config.instructionsComment = pe.instructionsComment || '';
config.pullRequestsStatus = pe.pullRequestsStatus || 'open';
config.mergeOnReview = pe.mergeOnReview || true;
config.oauth2token = pe.oauth2token || '';
config.excludeLabels = pe.excludeLabels || 'no-review';
config.filenameFilter = pe.filenameFilter || '["README.md"]';
config.owner = pe.owner || 'sumn2u';
// Setup Instructions Comment
if (config.instructionsComment === '') {
    var comment = 'Hi! I\'m your friendly/stabby Case Study Bot. For this case study to be labeled as "peer-reviewed", ' +
                  'you\'ll need at least ' + config.reviewsNeeded + ' comments containing the magic phrase "LGTM" ' +
                  '("Looks good to me" also works, for those of us that are really verbose).';

    config.instructionsComment = comment;
}

if (config.instructionsComment.indexOf('{reviewsNeeded}')) {
    config.instructionsComment = config.instructionsComment.replace('{reviewsNeeded}', config.reviewsNeeded);
}

module.exports = config;
