import * as React from 'react';
import { BitbucketIcon } from '@patternfly/react-icons/dist/js/icons/bitbucket-icon';
import { GitAltIcon } from '@patternfly/react-icons/dist/js/icons/git-alt-icon';
import { GithubIcon } from '@patternfly/react-icons/dist/js/icons/github-icon';
import { GitlabIcon } from '@patternfly/react-icons/dist/js/icons/gitlab-icon';
import gitUrlParse from 'git-url-parse';

export type GitUrl = ReturnType<typeof gitUrlParse> & {
  icon: React.ComponentType<React.ComponentProps<typeof GitAltIcon>>;
};

const getGitIcon = (
  gitUrl: gitUrlParse.GitUrl,
): React.ComponentType<React.ComponentProps<typeof GitAltIcon>> | null => {
  switch (gitUrl.source) {
    case '':
      // Not a valid url and thus not safe to use
      return null;
    case 'github.com':
      return GithubIcon;
    case 'bitbucket.org':
      return BitbucketIcon;
    case 'gitlab.com':
      return GitlabIcon;
    default:
      return GitAltIcon;
  }
};

export const parseGitUrl = (url: string): GitUrl => {
  const data = gitUrlParse(url) as GitUrl;

  data.icon = getGitIcon(data);

  return data;
};
