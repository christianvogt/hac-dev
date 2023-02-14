import * as React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@patternfly/react-core';
import { useAllApplicationEnvironmentsWithHealthStatus } from '../../hooks/useAllApplicationEnvironmentsWithHealthStatus';
import { useComponents } from '../../hooks/useComponents';
import ActionMenu from '../../shared/components/action-menu/ActionMenu';
import { RowFunctionArgs, TableData } from '../../shared/components/table';
import { Timestamp } from '../../shared/components/timestamp/Timestamp';
import { ApplicationKind } from '../../types';
import GitLink from '../GitLink/GitLink';
import { useApplicationActions } from './application-actions';
import { applicationTableColumnClasses } from './ApplicationListHeader';

const ApplicationListRow: React.FC<RowFunctionArgs<ApplicationKind>> = ({ obj }) => {
  const [components, loaded] = useComponents(obj.metadata.namespace, obj.metadata.name);

  const [allEnvironments, environmentsLoaded] = useAllApplicationEnvironmentsWithHealthStatus(
    obj.metadata.name,
  );
  const lastDeployedTimestamp = React.useMemo(
    () =>
      environmentsLoaded
        ? allEnvironments?.sort?.(
            (a, b) => new Date(b.lastDeploy).getTime() - new Date(a.lastDeploy).getTime(),
          )?.[0].lastDeploy
        : '-',
    [environmentsLoaded, allEnvironments],
  );

  const actions = useApplicationActions(obj);

  const displayName = obj.spec.displayName || obj.metadata.name;

  return (
    <>
      <TableData className={applicationTableColumnClasses.name}>
        <Link to={`/stonesoup/applications/${obj.metadata.name}`} title={displayName}>
          {displayName}
        </Link>
      </TableData>
      <TableData className={applicationTableColumnClasses.components}>
        {loaded ? (
          <>
            <ul>
              {components
                .sort((a, b) => a.metadata.name.localeCompare(b.metadata.name))
                .map((c) => (
                  <li key={c.metadata.name}>
                    {c.metadata.name}{' '}
                    {c.spec.source?.git?.url && <GitLink url={c.spec.source.git.url} />}
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <Skeleton width="50%" screenreaderText="Loading component count" />
        )}
      </TableData>
      <TableData className={applicationTableColumnClasses.lastDeploy}>
        <Timestamp timestamp={lastDeployedTimestamp} />
      </TableData>
      <TableData className={applicationTableColumnClasses.kebab}>
        <ActionMenu actions={actions} />
      </TableData>
    </>
  );
};

export default ApplicationListRow;
