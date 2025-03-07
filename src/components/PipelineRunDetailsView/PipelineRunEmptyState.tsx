import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyStateBody, EmptyStateSecondaryActions } from '@patternfly/react-core';
import emptyStateImgUrl from '../../imgs/Pipeline.svg';
import AppEmptyState from '../EmptyState/AppEmptyState';

interface PipelineRunEmptyStateProps {
  applicationName: string;
}

const PipelineRunEmptyState: React.FC<PipelineRunEmptyStateProps> = ({ applicationName }) => {
  return (
    <AppEmptyState emptyStateImg={emptyStateImgUrl} title="Keep tabs on components and activity">
      <EmptyStateBody>
        Monitor your components with pipelines and oversee CI/CD activity.
        <br />
        To get started, add a component and merge its pull request for a build pipeline.
      </EmptyStateBody>
      <EmptyStateSecondaryActions>
        <Button
          component={(props) => (
            <Link {...props} to={`/stonesoup/import?application=${applicationName}`} />
          )}
          variant="secondary"
        >
          Add component
        </Button>
      </EmptyStateSecondaryActions>
    </AppEmptyState>
  );
};

export default PipelineRunEmptyState;
