import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useK8sWatchResource } from '@openshift/dynamic-plugin-sdk-utils';
import { Bullseye, Spinner, Text, TextVariants } from '@patternfly/react-core';
import { IntegrationTestScenarioGroupVersionKind } from '../../models';
import { HttpError } from '../../shared/utils/error/http-error';
import { IntegrationTestScenarioKind } from '../../types/coreBuildService';
import { useNamespace } from '../../utils/namespace-context-utils';
import DetailsPage from '../ApplicationDetails/DetailsPage';
import ErrorEmptyState from '../EmptyState/ErrorEmptyState';
import { useModalLauncher } from '../modal/ModalProvider';
import { integrationTestDeleteModalAndNavigate } from './IntegrationTestsListView/useIntegrationTestActions';
import IntegrationTestOverviewTab from './tabs/IntegrationTestOverviewTab';
import IntegrationTestPipelineRunTab from './tabs/IntegrationTestPipelineRunTab';

type IntegrationTestDetailsViewProps = {
  applicationName: string;
  testName: string;
};

const IntegrationTestDetailsView: React.FC<IntegrationTestDetailsViewProps> = ({
  testName,
  applicationName,
}) => {
  const namespace = useNamespace();
  const showModal = useModalLauncher();
  const navigate = useNavigate();

  const [integrationTest, loaded, loadErr] = useK8sWatchResource<IntegrationTestScenarioKind>({
    groupVersionKind: IntegrationTestScenarioGroupVersionKind,
    isList: false,
    name: testName,
    namespace,
  });

  if (loadErr || (loaded && !integrationTest)) {
    return (
      <ErrorEmptyState
        httpError={HttpError.fromCode(loadErr ? (loadErr as any).code : 404)}
        title="Integration test not found"
        body="No such Integration test"
      />
    );
  }

  if (integrationTest?.metadata) {
    return (
      <DetailsPage
        headTitle={integrationTest.metadata.name}
        breadcrumbs={[
          { path: '/stonesoup/applications', name: 'Applications' },
          {
            path: `/stonesoup/applications/${applicationName}`,
            name: applicationName,
          },
          {
            path: `/stonesoup/applications/${applicationName}/integrationtests`,
            name: 'Integration tests',
          },
          {
            path: `/stonesoup/${applicationName}/integrationtests/${testName}`,
            name: integrationTest.metadata.name,
          },
        ]}
        title={
          <Text component={TextVariants.h2}>
            <b data-test="test-name">{integrationTest.metadata.name}</b>
          </Text>
        }
        actions={[
          {
            key: 'edit',
            label: 'Edit',
            component: <Link to={`/stonesoup/integration-test/${testName}/edit`}>Edit</Link>,
          },
          {
            onClick: () =>
              showModal<{ submitClicked: boolean }>(
                integrationTestDeleteModalAndNavigate(integrationTest),
              ).closed.then(({ submitClicked }) => {
                if (submitClicked)
                  navigate(`/stonesoup/applications/${applicationName}/integrationtests`);
              }),
            key: `delete-${integrationTest.metadata.name.toLowerCase()}`,
            label: 'Delete',
          },
        ]}
        baseURL={`/stonesoup/${applicationName}/integrationtests/${testName}`}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            isFilled: true,
            component: <IntegrationTestOverviewTab integrationTest={integrationTest} />,
          },
          {
            key: 'pipelineruns',
            label: 'Pipeline runs',
            component: (
              <IntegrationTestPipelineRunTab
                applicationName={integrationTest.spec.application}
                testName={integrationTest.metadata.name}
              />
            ),
          },
        ]}
      />
    );
  }

  return (
    <Bullseye>
      <Spinner data-test="spinner" />
    </Bullseye>
  );
};

export default IntegrationTestDetailsView;
