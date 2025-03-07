import * as React from 'react';
import { Link } from 'react-router-dom';
import { GithubIcon } from '@patternfly/react-icons/dist/js/icons/github-icon';
import { pipelineRunFilterReducer } from '../../shared';
import ActionMenu from '../../shared/components/action-menu/ActionMenu';
import ExternalLink from '../../shared/components/links/ExternalLink';
import { StatusIconWithText } from '../../shared/components/pipeline-run-logs/StatusIcon';
import { RowFunctionArgs, TableData } from '../../shared/components/table';
import { Timestamp } from '../../shared/components/timestamp/Timestamp';
import { Commit } from '../../types';
import { createRepoBranchURL, statuses } from '../../utils/commits-utils';
import { useCommitActions } from './commit-actions';
import { CommitIcon } from './CommitIcon';
import { commitsTableColumnClasses } from './CommitsListHeader';

import './CommitsListRow.scss';

const CommitsListRow: React.FC<RowFunctionArgs<Commit>> = ({ obj }) => {
  const actions = useCommitActions(obj);

  const status = pipelineRunFilterReducer(obj.pipelineRuns[0]);

  const prNumber = obj.isPullRequest ? `#${obj.pullRequestNumber}` : '';
  return (
    <>
      <TableData className={commitsTableColumnClasses.name}>
        <CommitIcon isPR={obj.isPullRequest} className="sha-title-icon" />
        <Link to={`/stonesoup/${obj.application}/commit/${obj.sha}`}>
          {prNumber} {obj.shaTitle}
        </Link>

        {obj.shaURL && (
          <ExternalLink href={obj.shaURL}>
            {' '}
            <GithubIcon />
          </ExternalLink>
        )}
      </TableData>
      <TableData className={commitsTableColumnClasses.branch}>
        {createRepoBranchURL(obj) ? (
          <ExternalLink href={createRepoBranchURL(obj)} text={`${obj.branch}`} />
        ) : (
          `${obj.branch}`
        )}
      </TableData>
      <TableData className={commitsTableColumnClasses.component}>
        {obj.components.length > 0 ? obj.components.map((c) => c.trim()).join(', ') : '-'}
      </TableData>
      <TableData className={commitsTableColumnClasses.byUser}>{obj.user ?? '-'}</TableData>
      <TableData className={commitsTableColumnClasses.committedAt}>
        <Timestamp timestamp={obj.creationTime} />
      </TableData>
      <TableData className={commitsTableColumnClasses.status}>
        {statuses.includes(status) ? <StatusIconWithText status={status} /> : '-'}
      </TableData>
      <TableData className={commitsTableColumnClasses.kebab}>
        <ActionMenu actions={actions} />
      </TableData>
    </>
  );
};

export default CommitsListRow;
