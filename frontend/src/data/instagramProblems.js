import { 
  TrendingDown, 
  UserX, 
  ShieldAlert, 
  Users, 
  MessageSquare, 
  HelpCircle, 
  MessageCircle, 
  ShieldOff, 
  Flag, 
  DollarSign 
} from 'lucide-react';

export const PROBLEMS = [
  {
    id: 'reach-drop',
    title: 'Reach / Views Suddenly Drop',
    description: 'Reels or posts suddenly receive very low views/reach even though content quality is good.',
    category: 'Content',
    icon: TrendingDown,
    color: 'from-red-500 to-orange-500',
    questions: [
      {
        id: 'normal_reach',
        text: 'What was your normal average reach before the drop?',
        type: 'select',
        options: ['Under 100', '100-500', '500-1,000', '1,000-5,000', '5,000-20,000', '20,000+']
      },
      {
        id: 'current_reach',
        text: 'What is your current average reach?',
        type: 'select',
        options: ['Under 50', '50-100', '100-300', '300-500', '500-1,000', '1,000+']
      },
      {
        id: 'drop_timing',
        text: 'How did the drop happen?',
        type: 'select',
        options: ['Suddenly (overnight)', 'Gradually over a few days', 'After a specific post', 'After a policy update notice', 'I\'m not sure']
      },
      {
        id: 'followers_seeing',
        text: 'Are your followers still seeing your content?',
        type: 'select',
        options: ['Yes, most of them', 'Some of them', 'Very few', 'Almost none', 'I don\'t know']
      },
      {
        id: 'content_change',
        text: 'Did you recently change your content type, niche, or posting style?',
        type: 'select',
        options: ['No, same content', 'Slight changes', 'Major change in niche', 'Started posting reels recently', 'Stopped posting for a while']
      },
      {
        id: 'warnings',
        text: 'Did you receive any account or content warnings recently?',
        type: 'select',
        options: ['No warnings', 'Community guideline warning', 'Copyright claim', 'Account restricted notice', 'Not sure']
      },
      {
        id: 'posting_frequency',
        text: 'How frequently do you post?',
        type: 'select',
        options: ['Multiple times daily', 'Once daily', 'A few times per week', 'Once a week or less', 'Inconsistently']
      }
    ],
    analyze: (answers) => {
      const causes = [];
      const actions = [];
      const checks = [];

      const normalReach = answers.normal_reach;
      const currentReach = answers.current_reach;
      const dropTiming = answers.drop_timing;
      const followersSeeing = answers.followers_seeing;
      const contentChange = answers.content_change;
      const warnings = answers.warnings;
      const postingFreq = answers.posting_frequency;

      if (warnings !== 'No warnings') {
        causes.push('Recent policy or community guideline violation may have triggered reduced distribution.');
        actions.push('Review the specific warning in your account inbox. Do not delete it. Take screenshots for your records.');
        checks.push('Check your "Account Status" in Settings to see active restrictions.');
      }

      if (contentChange === 'Major change in niche' || contentChange === 'Started posting reels recently') {
        causes.push('Algorithm may be recalibrating to your new content signals. Audience mismatch can also temporarily lower reach.');
        actions.push('Maintain consistency for at least 2-3 weeks. Keep your niche clear so the algorithm can re-learn your audience.');
        checks.push('Compare engagement rates (likes + comments / followers) before and after the change.');
      }

      if (followersSeeing === 'Almost none' || followersSeeing === 'Very few') {
        causes.push('Shadowban-like behavior or severe ranking penalty. Your content may not be appearing in feeds or Explore.');
        actions.push('Avoid using banned or heavily restricted hashtags. Do not engage in follow-for-follow or comment pods.');
        checks.push('Ask 3-5 trusted followers to check if they see your latest posts in their feed. Take screenshots.');
      }

      if (dropTiming === 'Suddenly (overnight)') {
        causes.push('Sudden drops are often linked to spam filters, mass reporting, or automated policy checks.');
        actions.push('Do not mass-delete posts. Avoid posting sensitive content. Take a short break from aggressive growth tactics.');
        checks.push('Review your recent posts for any that might have triggered automated review (repetitive content, external links, etc.).');
      }

      if (postingFreq === 'Once a week or less' || postingFreq === 'Inconsistently') {
        causes.push('Inconsistent posting reduces algorithmic trust and audience expectations.');
        actions.push('Aim for a consistent schedule (e.g., 3-5 posts per week). Use reminders or batch-create content.');
        checks.push('Review your last 30 days of posts and note gaps in your schedule.');
      }

      if (!causes.length) {
        causes.push('Normal algorithm fluctuation combined with possible content or audience mismatch.');
        causes.push('Competition for attention in your niche has increased.');
        actions.push('Focus on improving hook quality in the first 3 seconds of Reels. Test different posting times.');
        actions.push('Engage authentically with 10-20 relevant accounts daily for 2 weeks.');
        checks.push('Compare your recent content\'s save rate and share rate to your historical average.');
      }

      return {
        summary: `Your reach appears to have dropped from "${normalReach}" to "${currentReach}". Based on your answers, the most likely factors are identified below.`,
        possibleCauses: causes,
        whatToCheck: checks,
        recommendedActions: actions,
        actionPlan: [
          'Day 1-2: Audit recent posts for policy compliance. Remove any content that violates guidelines.',
          'Day 3-4: Post 1 high-quality Reel with a strong hook and clear value. Avoid controversial topics.',
          'Day 5-6: Engage with 15-20 relevant accounts (meaningful comments, not spam).',
          'Day 7: Review analytics. Note any improvement in reach, saves, or shares.'
        ],
        whenToContactInstagram: 'If reach does not improve after 7-14 days of consistent, policy-compliant activity, and you have verified no warnings in your inbox, consider using the "Help" option in your Account Status settings.',
        canGenerateMessage: true,
        messagePrompt: 'Describe your situation for a support message:'
      };
    }
  },
  {
    id: 'account-disabled',
    title: 'Account Disabled / Suspended',
    description: 'Your Instagram account has been disabled, restricted, or suspended.',
    category: 'Account',
    icon: UserX,
    color: 'from-red-600 to-pink-600',
    questions: [
      {
        id: 'error_message',
        text: 'What exact message or error do you see when you try to log in?',
        type: 'select',
        options: ['"Your account has been disabled"', '"We suspended your account"', '"Your account is restricted"', '"Action required" with a form', 'Cannot log in / no specific message']
      },
      {
        id: 'violation_type',
        text: 'Do you know what type of violation caused this?',
        type: 'select',
        options: ['Spam or fake engagement', 'Copyright or intellectual property', 'Posting inappropriate content', 'Impersonation', 'Not sure / No prior warning']
      },
      {
        id: 'appeal_attempted',
        text: 'Have you already submitted an appeal or support request?',
        type: 'select',
        options: ['Yes, waiting for response', 'Yes, appeal was rejected', 'No, I haven\'t appealed yet', 'I don\'t see an appeal option']
      },
      {
        id: 'account_type',
        text: 'What type of account do you have?',
        type: 'select',
        options: ['Personal account', 'Creator/Business account', 'New account (under 30 days)', 'Account with many followers']
      }
    ],
    analyze: (answers) => {
      const causes = [];
      const actions = [];
      const checks = [];

      const errorMsg = answers.error_message;
      const violationType = answers.violation_type;
      const appealAttempted = answers.appeal_attempted;

      if (violationType !== 'Not sure / No prior warning') {
        causes.push(`The indicated violation type (${violationType}) likely triggered automated enforcement.`);
        actions.push('Gather evidence that your content does not violate the stated policy. Screenshots and context help.');
        checks.push('Review Instagram\'s Community Guidelines and Terms of Service for the specific violation type.');
      } else {
        causes.push('The violation may have been triggered by spam filters, mass reports, or an automated security check.');
        causes.push('Sometimes legitimate accounts are caught in broad enforcement sweeps.');
      }

      if (errorMsg === 'Cannot log in / no specific message') {
        causes.push('You may be experiencing a login issue rather than an account disablement. Check for typos, 2FA issues, or app bugs.');
        actions.push('Try logging in via the web browser instead of the app. Clear cache and app data.');
        checks.push('Confirm the email and phone number associated with the account are still accessible.');
      }

      if (appealAttempted === 'Yes, waiting for response') {
        actions.push('Appeals typically take 24-48 hours. Do not submit duplicate requests as they may delay the process.');
        checks.push('Check your email (including spam) for any follow-up requests from Instagram.');
      } else if (appealAttempted === 'No, I haven\'t appealed yet') {
        actions.push('Submit an appeal as soon as possible. Be concise, polite, and factual.');
        actions.push('If you cannot log in, use the "Learn more" or "Help" links on the disabled-account screen.');
        checks.push('If you have access to the email or phone linked to the account, use those for verification.');
      }

      actions.push('Do not create a new account with the same information, as this may violate Instagram\'s terms and worsen the situation.');
      actions.push('Back up any important content you still have access to (photos, videos, messages).');

      return {
        summary: 'Account disablement or suspension is serious but not always permanent. The right approach depends on the exact message you see and the reason cited.',
        possibleCauses: causes,
        whatToCheck: checks,
        recommendedActions: actions,
        actionPlan: [
          'Day 1: Document the exact error message with a screenshot. Note the email and phone on the account.',
          'Day 1: Submit a single, clear appeal if available. State your username, email, and a brief factual explanation.',
          'Day 2-3: If no response, wait. Do not spam support channels.',
          'Day 4-7: If no resolution, consider reaching out through official Meta support channels with a reference to your appeal.'
        ],
        whenToContactInstagram: 'Use the in-app appeal form first. If unavailable, use the Meta Help Center or your account\'s registered email to submit a review request.',
        canGenerateMessage: true,
        messagePrompt: 'What is your username and what happened before your account was disabled?'
      };
    }
  },
  {
    id: 'account-hacked',
    title: 'Account Hacked / Recovery',
    description: 'Your Instagram account has been hacked or you have lost access.',
    category: 'Account',
    icon: ShieldAlert,
    color: 'from-yellow-500 to-orange-500',
    questions: [
      {
        id: 'access_type',
        text: 'What access do you still have?',
        type: 'select',
        options: ['No access at all', 'Can log in but password was changed', 'Email/phone still accessible', '2FA still works', 'Can receive SMS but not email']
      },
      {
        id: 'hack_signs',
        text: 'What signs of hacking have you noticed?',
        type: 'select',
        options: ['Password changed without my action', 'Unauthorized posts or DMs sent', 'Email or phone changed', 'Suspicious login activity', 'Account details changed']
      },
      {
        id: 'email_access',
        text: 'Do you still have access to the email linked to your Instagram account?',
        type: 'select',
        options: ['Yes, full access', 'Yes, but I changed the password', 'No, email was also compromised', 'Not sure']
      }
    ],
    analyze: (answers) => {
      const causes = [];
      const actions = [];
      const checks = [];

      const accessType = answers.access_type;
      const hackSigns = answers.hack_signs;
      const emailAccess = answers.email_access;

      causes.push('An unauthorized party gained access to your credentials or session.');

      if (accessType === 'Can log in but password was changed') {
        actions.push('Use the "Forgot password" flow on the login screen to regain access via your registered email or phone.');
        actions.push('Once regained, immediately enable 2FA (two-factor authentication).');
      } else if (accessType === 'No access at all') {
        actions.push('Try the "Need more help?" or "Report a login issue" option on the login screen.');
        actions.push('Provide a government-issued ID if requested by Instagram for identity verification.');
      } else if (emailAccess === 'No, email was also compromised') {
        actions.push('Recover your email account first. Then return to Instagram recovery.');
        actions.push('Contact your email provider\'s support for urgent account recovery.');
      }

      if (hackSigns.includes('Email or phone changed')) {
        actions.push('Gather any old screenshots or emails from Instagram that show your previous email or phone number.');
        actions.push('When submitting recovery, mention that your contact details were changed by an unauthorized party.');
      }

      actions.push('Never share your password, OTP, recovery codes, or private information with anyone claiming to help.');
      actions.push('Do not click suspicious links or download unknown apps promising account recovery.');

      return {
        summary: 'A hacked account requires immediate, careful action to regain control and prevent further damage.',
        possibleCauses: causes,
        whatToCheck: checks,
        recommendedActions: actions,
        actionPlan: [
          'Hour 1: Try "Forgot password" if you have email/phone access. Secure the recovery channel first.',
          'Hour 1-2: If password reset fails, use "Report a login issue" or "Need more help?" in the app.',
          'Day 1: Submit identity verification if requested. Have a photo ID ready.',
          'Day 2-3: Once access is restored, audit all account settings: email, phone, 2FA, connected apps.',
          'Day 4-7: Change passwords for all linked accounts. Inform followers if suspicious activity occurred.'
        ],
        whenToContactInstagram: 'Use the in-app "Report a login issue" flow. For severe cases, you may need to submit identity verification through the Meta Help Center.',
        canGenerateMessage: true,
        messagePrompt: 'What is your username and what access do you currently have?'
      };
    }
  },
  {
    id: 'spam-fake',
    title: 'Spam & Fake Accounts',
    description: 'Bots, fake followers, fake profiles, scam accounts, and suspicious DMs.',
    category: 'Safety',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    questions: [
      {
        id: 'spam_type',
        text: 'What type of spam or fake account issue are you facing?',
        type: 'select',
        options: ['Fake followers / bot followers', 'Fake profile impersonating me', 'Scam DMs', 'Suspicious links in comments/DMs', 'Mass follow/unfollow bots']
      },
      {
        id: 'frequency',
        text: 'How often does this happen?',
        type: 'select',
        options: ['Rarely, occasional', 'A few times per week', 'Daily', 'Constantly / Overwhelming']
      },
      {
        id: 'action_taken',
        text: 'Have you already blocked or reported any accounts?',
        type: 'select',
        options: ['No, haven\'t taken action', 'Blocked some accounts', 'Reported some accounts', 'Reported but no action from Instagram']
      }
    ],
    analyze: (answers) => {
      const causes = [];
      const actions = [];
      const checks = [];

      const spamType = answers.spam_type;
      const frequency = answers.frequency;
      const actionTaken = answers.action_taken;

      if (spamType === 'Fake followers / bot followers') {
        causes.push('Bots may have found your account through hashtags, follows, or public contact info.');
        actions.push('Do not buy followers or engagement. Instagram\'s spam filters may flag accounts with sudden bot spikes.');
        actions.push('Use a follower audit tool to identify and remove suspicious accounts (do this gradually to avoid appearing spammy yourself).');
      }

      if (spamType === 'Fake profile impersonating me') {
        causes.push('Impersonators often target accounts with engagement, brand deals, or public recognition.');
        actions.push('Report the impersonating account through the profile: Menu > Report > Impersonation.');
        actions.push('If you have a verified badge or official website, mention this in your report.');
      }

      if (spamType === 'Scam DMs') {
        causes.push('Scammers often target creators, businesses, or anyone with public contact info.');
        actions.push('Never click links in unsolicited DMs. Never send money, gift cards, or personal info.');
        actions.push('Set your DMs to "Followers only" in Privacy Settings if you receive too many spam messages.');
      }

      if (frequency === 'Constantly / Overwhelming') {
        causes.push('Your account may have been exposed to spam networks or listed on bot-targeting lists.');
        actions.push('Switch your account to Private temporarily. This reduces bot discovery.');
        actions.push('Review your comment filters. Add restricted words and enable "Hide offensive comments."');
      }

      if (actionTaken === 'Reported but no action from Instagram') {
        actions.push('Instagram processes millions of reports. Follow-up reports on the same account may not speed things up, but you can try the web form.');
        checks.push('Document the usernames, screenshots, and dates of spam activity for your records.');
      }

      return {
        summary: 'Spam and fake accounts are common on Instagram. Taking systematic steps reduces their impact.',
        possibleCauses: causes,
        whatToCheck: checks,
        recommendedActions: actions,
        actionPlan: [
          'Day 1: Block/report obvious fake accounts. Enable comment filters.',
          'Day 2: Switch DMs to "Followers only" if spam is heavy.',
          'Day 3: Audit follower list for suspicious accounts (new accounts, no posts, random usernames).',
          'Day 4: Post a warning story if impersonation is severe, but do not share personal details.',
          'Day 5-7: Monitor and continue reporting. Avoid engaging with scammers.'
        ],
        whenToContactInstagram: 'For impersonation, use the in-app report. For coordinated spam attacks, use the Meta Help Center web form.',
        canGenerateMessage: true,
        messagePrompt: 'Describe the impersonation or spam situation:'
      };
    }
  },
  {
    id: 'customer-support',
    title: 'Instagram Customer Support Problems',
    description: 'You cannot figure out how to get help from Instagram.',
    category: 'Support',
    icon: HelpCircle,
    color: 'from-green-500 to-teal-500',
    questions: [
      {
        id: 'support_issue',
        text: 'What problem are you trying to get help for?',
        type: 'select',
        options: ['Account access / login', 'Account disabled / suspended', 'Hacked account', 'Copyright / intellectual property', 'Bug or technical issue', 'Policy appeal', 'Other']
      },
      {
        id: 'contact_attempted',
        text: 'Have you tried any official support channels already?',
        type: 'select',
        options: ['In-app Help / Report', 'Meta Help Center website', 'Email support', 'None yet']
      }
    ],
    analyze: (answers) => {
      const causes = [];
      const actions = [];
      const checks = [];

      const supportIssue = answers.support_issue;

      causes.push('Instagram\'s customer support is primarily automated. Direct human support is limited and not available for all issues.');

      if (supportIssue === 'Account access / login') {
        actions.push('Use the "Forgot password" or "Need more help?" options on the login screen.');
        actions.push('If you have the email/phone on file, recovery is usually fastest through the app itself.');
      } else if (supportIssue === 'Account disabled / suspended') {
        actions.push('Look for the "Request Review" or "Appeal" button on the disabled-account screen.');
        actions.push('If no appeal option appears, use the Meta Help Center and navigate to the account status section.');
      } else if (supportIssue === 'Copyright / intellectual property') {
        actions.push('Use the official copyright reporting form on the Meta Help Center. Provide clear ownership evidence.');
      } else {
        actions.push('Browse the Meta Help Center for your specific issue. Many common problems have step-by-step guides.');
      }

      actions.push('Prepare a concise summary of your issue before contacting support. Include username, device, app version, and a clear description.');
      actions.push('Do not expect instant responses. Most automated responses take 24-72 hours.');

      return {
        summary: 'Instagram does not offer 24/7 live chat support for most issues. The right channel depends on your specific problem.',
        possibleCauses: causes,
        whatToCheck: checks,
        recommendedActions: actions,
        actionPlan: [
          'Day 1: Identify the exact problem and locate the most specific help page in the Meta Help Center.',
          'Day 1: If applicable, submit an appeal or report through the in-app flow.',
          'Day 2: If no automated solution, try the web form at help.instagram.com.',
          'Day 3-7: Follow up only if you received a reference number. Do not spam multiple channels with the same issue.'
        ],
        whenToContactInstagram: 'Use the specific in-app or web form for your issue type. For general bugs, try the app\'s Settings > Help > Report a Problem.',
        canGenerateMessage: true,
        messagePrompt: 'What is your issue and what steps have you already tried?'
      };
    }
  },


  {
    id: 'viral-drop',
    title: 'Unpredictable Algorithm / Viral Drop',
    description: 'One Reel becomes viral while the next similar Reel gets very low reach.',
    category: 'Content',
    icon: TrendingDown,
    color: 'from-purple-500 to-indigo-500',
    questions: [
      {
        id: 'viral_post',
        text: 'How many views did your viral post get?',
        type: 'select',
        options: ['1,000-10,000', '10,000-50,000', '50,000-200,000', '200,000-1,000,000', '1,000,000+']
      },
      {
        id: 'next_post',
        text: 'How many views did the next similar post get?',
        type: 'select',
        options: ['Similar to viral post', 'Slightly lower', 'Much lower (50% or less)', 'Almost no reach']
      },
      {
        id: 'content_type',
        text: 'What type of content goes viral for you?',
        type: 'select',
        options: ['Trending audio Reels', 'Educational / how-to', 'Comedy / skits', 'Lifestyle / vlogs', 'Mixed content']
      },
      {
        id: 'posting_pattern',
        text: 'How soon after the viral post did you post the next one?',
        type: 'select',
        options: ['Within a few hours', 'Same day', 'Next day', '2-3 days later', 'A week or more later']
      },
      {
        id: 'engagement',
        text: 'How does your typical engagement rate look?',
        type: 'select',
        options: ['Above 5% (very high)', '2-5% (healthy)', '1-2% (average)', 'Below 1% (low)', 'I don\'t know']
      }
    ],
    analyze: (answers) => {
      const causes = [];
      const actions = [];
      const checks = [];

      const viralViews = answers.viral_post;
      const nextViews = answers.next_post;
      const contentType = answers.content_type;
      const postingPattern = answers.posting_pattern;
      const engagement = answers.engagement;

      causes.push('Viral posts are often boosted by external shares, Explore placement, or lucky timing. The algorithm does not guarantee repeat virality.');
      causes.push('After a viral post, some audience members may not follow you, reducing your baseline reach for the next post.');

      if (postingPattern === 'Within a few hours' || postingPattern === 'Same day') {
        causes.push('Posting too quickly after a viral post may not give your audience enough time to engage, causing the algorithm to deprioritize the next post.');
        actions.push('Space posts at least 12-24 hours apart after a viral hit. Let engagement settle.');
      }

      if (nextViews === 'Much lower (50% or less)' || nextViews === 'Almost no reach') {
        causes.push('Your content may have been flagged for review, or the algorithm detected low early engagement on the new post.');
        actions.push('Ensure every post has a strong hook and clear value in the first 3 seconds.');
        actions.push('Share the post to your Story to boost initial engagement signals.');
      }

      if (engagement === 'Below 1% (low)' || engagement === '1-2% (average)') {
        causes.push('Low baseline engagement makes it harder for the algorithm to push your content consistently.');
        actions.push('Focus on increasing save rate and share rate, not just likes. These signals matter more for reach.');
      }

      if (contentType === 'Trending audio Reels') {
        causes.push('Trending audio can give a temporary boost, but its effectiveness drops as more creators use the same sound.');
        actions.push('Add unique commentary or editing to trending audio. Stand out from the crowd of users with the same sound.');
      }

      actions.push('Run structured experiments: post the same topic in different formats (Reel vs. Carousel vs. single image) at different times.');
      actions.push('Track metrics for 2-4 weeks. Do not judge a single post\'s performance in isolation.');

      return {
        summary: 'Viral drops are common and usually normal algorithm behavior. Consistency and experimentation are more reliable than chasing virality.',
        possibleCauses: causes,
        whatToCheck: checks,
        recommendedActions: actions,
        actionPlan: [
          'Week 1: Post 3-5 high-quality pieces. Vary format, hook, and caption style. Track views, saves, shares, and completion rate.',
          'Week 2: Analyze which posts performed best. Identify patterns (topic, time of day, audio, length).',
          'Week 3: Double down on the winning pattern while testing 1-2 new variations.',
          'Week 4: Review overall trend. If reach is stabilizing upward, you have likely found a working formula.'
        ],
        whenToContactInstagram: 'There is no need to contact Instagram for normal reach fluctuation. Contact support only if you see a policy warning or account restriction.',
        canGenerateMessage: false,
        messagePrompt: null
      };
    }
  },
  {
    id: 'dm-problems',
    title: 'DM Problems',
    description: 'Messages are not sending/loading, message requests are missing, or DMs behave unexpectedly.',
    category: 'Technical',
    icon: MessageCircle,
    color: 'from-pink-500 to-rose-500',
    questions: [
      {
        id: 'dm_issue',
        text: 'What exactly is happening with your DMs?',
        type: 'select',
        options: ['Messages not sending', 'Messages not loading / stuck', 'Message requests missing', 'Can\'t open a specific chat', 'Other']
      },
      {
        id: 'device',
        text: 'Which device and app version are you using?',
        type: 'select',
        options: ['iOS (latest)', 'iOS (outdated)', 'Android (latest)', 'Android (outdated)', 'Web browser']
      },
      {
        id: 'connection',
        text: 'Is your internet connection stable?',
        type: 'select',
        options: ['Yes, WiFi or strong data', 'Sometimes unstable', 'Often slow / spotty']
      },
      {
        id: 'recent_update',
        text: 'Did this start after an app update or account change?',
        type: 'select',
        options: ['Yes, after an app update', 'Yes, after changing account settings', 'No, it started randomly', 'I don\'t remember']
      }
    ],
    analyze: (answers) => {
      const causes = [];
      const actions = [];
      const checks = [];

      const dmIssue = answers.dm_issue;
      const device = answers.device;
      const connection = answers.connection;
      const recentUpdate = answers.recent_update;

      causes.push('DM issues can be caused by app bugs, server outages, account settings, or device-specific problems.');

      if (device.includes('outdated')) {
        causes.push('Outdated app versions may have compatibility issues with Instagram\'s servers.');
        actions.push('Update the Instagram app to the latest version from your app store.');
      }

      if (connection !== 'Yes, WiFi or strong data') {
        causes.push('Unstable internet can cause messages to fail sending or loading.');
        actions.push('Switch to a stronger WiFi or mobile data connection. Try toggling airplane mode on and off.');
      }

      if (recentUpdate === 'Yes, after an app update') {
        causes.push('App updates sometimes introduce temporary bugs.');
        actions.push('Force close the app and reopen it. Clear the app cache if the problem persists.');
        actions.push('Check the App Store or Google Play reviews for the latest version to see if others report the same issue.');
      }

      if (dmIssue === 'Message requests missing') {
        causes.push('Message requests may be filtered, or the sender\'s account may have restrictions.');
        actions.push('Check your Privacy Settings to ensure message requests are not restricted.');
        actions.push('Ask the sender to verify their account is not restricted or disabled.');
      }

      if (dmIssue === 'Can\'t open a specific chat') {
        causes.push('This may be a corrupted chat cache or a restriction on one participant.');
        actions.push('Try searching for the user and starting a new conversation. Old messages may not transfer.');
      }

      actions.push('Clear Instagram cache: Settings > Apps > Instagram > Storage > Clear Cache (Android) or reinstall (iOS).');
      actions.push('Try logging in from a web browser to determine if the issue is device-specific or account-wide.');
      actions.push('If using a VPN, try disabling it temporarily.');

      return {
        summary: 'DM problems are often technical and temporary. The steps below cover the most common fixes.',
        possibleCauses: causes,
        whatToCheck: checks,
        recommendedActions: actions,
        actionPlan: [
          'Day 1: Update the app. Force close and reopen. Switch networks if possible.',
          'Day 1: Try logging in from a web browser to confirm if the issue is device-specific.',
          'Day 2: Clear cache or reinstall the app. Log back in and test.',
          'Day 3-5: If still broken, report the bug via Settings > Help > Report a Problem. Include screenshots.'
        ],
        whenToContactInstagram: 'Use "Report a Problem" in the app if troubleshooting fails. For account-specific message restrictions, check your Privacy Settings first.',
        canGenerateMessage: false,
        messagePrompt: null
      };
    }
  },
  {
    id: 'harassment',
    title: 'Harassment / Unwanted Messages',
    description: 'Bullying, abusive comments, unwanted DMs, or repeated harassment.',
    category: 'Safety',
    icon: ShieldOff,
    color: 'from-red-500 to-rose-600',
    questions: [
      {
        id: 'harassment_type',
        text: 'What type of harassment are you experiencing?',
        type: 'select',
        options: ['Abusive comments on posts', 'Unwanted DMs', 'Bullying in Stories', 'Threats or intimidation', 'Stalking / repeated unwanted contact']
      },
      {
        id: 'known_person',
        text: 'Is this from someone you know in real life?',
        type: 'select',
        options: ['Yes, someone I know', 'No, a stranger', 'A mix of both', 'Anonymous / fake account']
      },
      {
        id: 'danger_level',
        text: 'Do you feel physically unsafe or threatened?',
        type: 'select',
        options: ['No, just annoying', 'Mildly uncomfortable', 'Yes, I feel threatened', 'Yes, there are threats of violence']
      }
    ],
    analyze: (answers) => {
      const causes = [];
      const actions = [];
      const checks = [];

      const harassmentType = answers.harassment_type;
      const knownPerson = answers.known_person;
      const dangerLevel = answers.danger_level;

      causes.push('Harassment on Instagram can come from strangers, acquaintances, or coordinated groups.');

      if (dangerLevel === 'Yes, there are threats of violence' || dangerLevel === 'Yes, I feel threatened') {
        actions.push('Your safety comes first. Block the harasser immediately. Do not engage or respond.');
        actions.push('Document all messages, comments, and profiles. Take screenshots with timestamps.');
        actions.push('Consider reporting to local law enforcement if threats are credible.');
        checks.push('Save evidence before taking any action that might delete content (like blocking).');
      }

      if (harassmentType === 'Abusive comments on posts') {
        actions.push('Use comment controls: Settings > Privacy > Comments. Enable "Hide offensive comments" and add restricted words.');
        actions.push('Delete abusive comments individually. Block the commenter to prevent future comments.');
      }

      if (harassmentType === 'Unwanted DMs') {
        actions.push('Switch your DMs to "Followers only" or "No one" in Privacy Settings.');
        actions.push('Block and report the sender. Instagram may restrict their messaging ability.');
      }

      if (knownPerson === 'Yes, someone I know') {
        actions.push('If safe to do so, ask them to stop. If they do not, escalate by blocking and reporting.');
        actions.push('If the person is a classmate, coworker, or family member, consider seeking support from trusted adults or authorities.');
      }

      if (harassmentType === 'Stalking / repeated unwanted contact') {
        actions.push('Make your account private. Review your follower list and remove unknown followers.');
        actions.push('Do not share your location, daily routine, or personal details publicly.');
      }

      return {
        summary: 'Harassment and unwanted contact are serious issues. Prioritize your safety and use Instagram\'s built-in tools.',
        possibleCauses: causes,
        whatToCheck: checks,
        recommendedActions: actions,
        actionPlan: [
          'Immediate: Block the harasser on all platforms. Do not engage.',
          'Day 1: Take screenshots of all evidence. Save them securely outside the app.',
          'Day 1: Report the account through the app (Profile > Menu > Report).',
          'Day 2: Adjust privacy settings: DMs to "Followers only", comments filtered.',
          'Day 3-7: If threats continue or escalate, report to local authorities. Instagram cannot guarantee physical safety.'
        ],
        whenToContactInstagram: 'Use the in-app report for each abusive account. For coordinated harassment, also submit a report via the Meta Help Center. For physical threats, contact law enforcement immediately.',
        canGenerateMessage: true,
        messagePrompt: 'Describe the harassment briefly (do not share sensitive personal details):'
      };
    }
  },
  {
    id: 'content-removed',
    title: 'Content Removed / Moderation Mistake',
    description: 'Instagram removes or restricts content that you believe follows the rules.',
    category: 'Content',
    icon: Flag,
    color: 'from-orange-500 to-red-500',
    questions: [
      {
        id: 'content_type',
        text: 'What type of content was removed?',
        type: 'select',
        options: ['Photo', 'Video / Reel', 'Story', 'Comment', 'Account or bio']
      },
      {
        id: 'notification',
        text: 'What notification did you receive?',
        type: 'select',
        options: ['Community guideline violation', 'Copyright claim / takedown', 'Nudity or sexual content', 'Hate speech or harassment', 'Spam or misleading', 'No notification given']
      },
      {
        id: 'belief',
        text: 'Do you believe the content actually violated the stated policy?',
        type: 'select',
        options: ['Yes, it was a mistake', 'Maybe, I\'m not sure', 'No, the content is clearly compliant', 'Context was missing from the review']
      }
    ],
    analyze: (answers) => {
      const causes = [];
      const actions = [];
      const checks = [];

      const notification = answers.notification;
      const belief = answers.belief;

      if (notification === 'Copyright claim / takedown') {
        causes.push('Copyright claims are often automated (Content ID or manual reports). Fair use or licensed content may still be flagged.');
        actions.push('Gather proof of ownership, license, or fair use justification.');
        actions.push('Use the copyright appeal form on the Meta Help Center.');
      } else if (notification === 'No notification given') {
        causes.push('Content may have been removed by the account owner, by a third-party report, or by an automated system without a notification.');
        actions.push('Check your "Account Status" and "Support Inbox" for any recent actions or pending reviews.');
      } else {
        causes.push('Automated moderation systems can make errors, especially with context-dependent content like satire, education, or art.');
        causes.push('Human reviewers may not always see the full context of your post.');
      }

      if (belief === 'Yes, it was a mistake') {
        actions.push('Appeals are most effective when they are concise, polite, and provide missing context.');
        actions.push('Do not appeal aggressively. Hostile appeals are less likely to be reviewed fairly.');
      }

      if (belief === 'Context was missing from the review') {
        actions.push('In your appeal, clearly explain the context. For example: "This is educational content about medical treatment, not promotion."');
        actions.push('Link to credible sources if your content references factual information.');
      }

      actions.push('Do not repost the exact same content immediately. If it was flagged once, reposting may trigger another removal.');
      actions.push('Review Instagram\'s Community Guidelines for the specific policy cited. Understanding the exact wording helps you avoid future issues.');

      return {
        summary: 'Content moderation errors happen. A clear, well-documented appeal gives you the best chance of restoration.',
        possibleCauses: causes,
        whatToCheck: checks,
        recommendedActions: actions,
        actionPlan: [
          'Day 1: Read the specific policy cited in the notification carefully.',
          'Day 1: Draft a concise appeal explaining the context. Keep it under 300 words.',
          'Day 2: Submit the appeal through the in-app notification or Meta Help Center.',
          'Day 3-7: Do not repost the same content. If approved, consider a slight edit before reposting.'
        ],
        whenToContactInstagram: 'Use the appeal button attached to the notification. If no appeal button exists, use the Meta Help Center form for content appeals.',
        canGenerateMessage: true,
        messagePrompt: 'What was the content about and what policy was cited?'
      };
    }
  },
  {
    id: 'creator-growth',
    title: 'Creator Growth / Monetization Problems',
    description: 'You receive views but struggle to gain followers, leads, or income.',
    category: 'Growth',
    icon: DollarSign,
    color: 'from-emerald-500 to-green-500',
    questions: [
      {
        id: 'niche',
        text: 'What is your content niche?',
        type: 'select',
        options: ['Lifestyle / Fashion', 'Fitness / Health', 'Education / Business', 'Entertainment / Comedy', 'Tech / Gaming', 'Food / Travel', 'Other']
      },
      {
        id: 'follower_goal',
        text: 'What is your primary goal?',
        type: 'select',
        options: ['Gain followers', 'Get more website/app clicks', 'Sell products or services', 'Brand partnerships / sponsorships', 'Build a community']
      },
      {
        id: 'content_type',
        text: 'What content formats do you use?',
        type: 'select',
        options: ['Reels only', 'Posts and Reels', 'Stories and Reels', 'Carousels and Posts', 'All formats']
      },
      {
        id: 'metrics',
        text: 'How would you describe your current metrics?',
        type: 'select',
        options: ['High views, low followers', 'Low views and low followers', 'Decent followers, low engagement', 'Good engagement, no conversions', 'I don\'t track metrics']
      }
    ],
    analyze: (answers) => {
      const causes = [];
      const actions = [];
      const checks = [];

      const niche = answers.niche;
      const metrics = answers.metrics;
      const followerGoal = answers.follower_goal;

      if (metrics === 'High views, low followers') {
        causes.push('Your content reaches people but does not convince them to follow. This is usually a profile or CTA problem.');
        actions.push('Audit your profile bio, profile picture, and highlight covers. Does your profile clearly say what value a follower gets?');
        actions.push('Add a clear call-to-action in your Reels and captions: "Follow for more tips on [topic]."');
        checks.push('Review your last 10 posts. Do they all point back to your profile\'s core value?');
      }

      if (metrics === 'Low views and low followers') {
        causes.push('Low reach limits growth. Focus on discoverability before monetization.');
        actions.push('Research trending topics in your niche. Create content that answers specific, searchable questions.');
        actions.push('Use relevant hashtags (5-10) and optimize captions for search keywords.');
      }

      if (metrics === 'Decent followers, low engagement') {
        causes.push('Your audience may be inactive, or your content may not spark interaction.');
        actions.push('Ask questions in captions and Stories. Polls and quizzes boost engagement signals.');
        actions.push('Remove inactive followers gradually. Engagement rate matters more than follower count for algorithm ranking.');
      }

      if (metrics === 'Good engagement, no conversions') {
        causes.push('Your audience likes your content but does not take the next step (click link, buy product, etc.).');
        actions.push('Make your CTA specific and urgent. "Link in bio" is weak. Try "Grab my free checklist via the link in bio before midnight."');
        actions.push('Use Instagram\'s native tools: product tags, story links (if eligible), and highlights to guide buyers.');
      }

      if (followerGoal === 'Brand partnerships / sponsorships') {
        actions.push('Create a media kit PDF with your niche, audience demographics, engagement rate, and past collaboration examples.');
        actions.push('Tag relevant brands naturally in content. Use industry hashtags so brand scouts can find you.');
      }

      actions.push('Define a clear content pillar strategy: 3-5 topics you will repeatedly cover. This builds audience expectation and authority.');
      actions.push('Engage with 10-20 accounts in your niche daily for 30 days. Relationships often convert to collaborations.');

      return {
        summary: 'Growth and monetization problems are rarely about one fix. They usually involve profile positioning, content consistency, and conversion mechanics.',
        possibleCauses: causes,
        whatToCheck: checks,
        recommendedActions: actions,
        actionPlan: [
          'Week 1: Audit your profile, bio, and top 10 posts. Fix weak CTAs and unclear positioning.',
          'Week 2: Create 3 pieces of content for each of your 3 main content pillars.',
          'Week 3: Engage with 15 niche accounts daily. Track profile visits and follows.',
          'Week 4: Review analytics. Identify what drove the most follows or clicks, and do more of that.'
        ],
        whenToContactInstagram: 'There is no direct Instagram support for growth or monetization. Focus on improving content and funnel. If you are eligible for monetization features, check the Instagram monetization dashboard for eligibility requirements.',
        canGenerateMessage: false,
        messagePrompt: null
      };
    }
  }
];
