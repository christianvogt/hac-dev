import * as React from 'react';
import { Badge } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import ExternalLink from '../../shared/components/links/ExternalLink';
import { parseGitUrl } from '../../utils/git-utils';

type Props = {
  url: string;
  badge?: boolean;
};

const GitLink: React.FC<Props> = ({ url }) => {
  const data = React.useMemo(() => parseGitUrl(url), [url]);
  const Icon = data.icon || ExternalLinkAltIcon;
  return (
    <Badge isRead>
      <ExternalLink href={data.href}>
        {data.owner}/{data.name} <Icon />
      </ExternalLink>
    </Badge>
  );
};

export default GitLink;
