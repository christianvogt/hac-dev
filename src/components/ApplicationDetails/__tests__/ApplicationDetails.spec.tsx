import * as React from 'react';
import '@testing-library/jest-dom';
import { useParams } from 'react-router-dom';
import { useFeatureFlag } from '@openshift/dynamic-plugin-sdk';
import { useK8sWatchResource } from '@openshift/dynamic-plugin-sdk-utils';
import { screen, configure, fireEvent, act, waitFor } from '@testing-library/react';
import { WatchK8sResource } from '../../../dynamic-plugin-sdk';
import { useApplications } from '../../../hooks/useApplications';
import { useGitOpsDeploymentCR } from '../../../hooks/useGitOpsDeploymentCR';
import { ApplicationGroupVersionKind, ComponentGroupVersionKind } from '../../../models';
import { PipelineRunGroupVersionKind } from '../../../shared';
import { routerRenderer } from '../../../utils/test-utils';
import { componentCRMocks } from '../../Components/__data__/mock-data';
import { mockPipelineRuns } from '../../Components/__data__/mock-pipeline-run';
import { mockApplication } from '../__data__/mock-data';
import { getMockWorkflows } from '../__data__/WorkflowTestUtils';
import ApplicationDetails from '../ApplicationDetails';
import { HACBS_APPLICATION_MODAL_HIDE_KEY } from '../ApplicationModal';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    Link: (props) => (
      <a href={props.to} data-test={props.to}>
        {props.children}
      </a>
    ),
    useNavigate: () => jest.fn(),
    useSearchParams: () => React.useState(() => new URLSearchParams()),
    useParams: jest.fn(),
  };
});

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    quickStarts: { set: jest.fn(), toggle: jest.fn() },
    helpTopics: { setActiveTopic: jest.fn(), enableTopics: jest.fn(), disableTopics: jest.fn() },
  }),
}));

jest.mock('@openshift/dynamic-plugin-sdk-utils', () => ({
  useK8sWatchResource: jest.fn(),
}));

jest.mock('../../../hooks/useGitOpsDeploymentCR', () => ({
  useGitOpsDeploymentCR: jest.fn(),
}));
jest.mock('../../../hooks/useApplications', () => ({
  useApplications: jest.fn(),
}));

jest.mock('@openshift/dynamic-plugin-sdk', () => ({
  useFeatureFlag: jest.fn(),
}));

const useFeatureFlagMock = useFeatureFlag as jest.Mock;
const useParamsMock = useParams as jest.Mock;
const useApplicationsMock = useApplications as jest.Mock;

configure({ testIdAttribute: 'data-test' });

const watchResourceMock = useK8sWatchResource as jest.Mock;
const mockGitOpsDeploymentCR = useGitOpsDeploymentCR as jest.Mock;

const { workflowMocks, applyWorkflowMocks } = getMockWorkflows();

const getMockedResources = (kind: WatchK8sResource) => {
  if (kind.groupVersionKind === ComponentGroupVersionKind) {
    return [componentCRMocks, true];
  }
  if (kind.groupVersionKind === PipelineRunGroupVersionKind) {
    return [mockPipelineRuns, true];
  }
  if (kind.groupVersionKind === ApplicationGroupVersionKind) {
    return [mockApplication, true];
  }
  return [[], true];
};

describe('ApplicationDetails', () => {
  beforeEach(() => {
    localStorage.removeItem(HACBS_APPLICATION_MODAL_HIDE_KEY);
    useFeatureFlagMock.mockReturnValue([false]);
    mockGitOpsDeploymentCR.mockReturnValue([[], false]);
    useParamsMock.mockReturnValue({});
    useApplicationsMock.mockReturnValue([[mockApplication], true]);

    applyWorkflowMocks(workflowMocks);

    watchResourceMock.mockImplementation(getMockedResources);

    (window.SVGElement as any).prototype.getBBox = () => ({
      x: 100,
      y: 100,
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
    (window.SVGElement as any).prototype.getBBox = undefined;
  });
  it('should render spinner if application data is not loaded', () => {
    watchResourceMock.mockReturnValue([[], false]);
    routerRenderer(<ApplicationDetails applicationName="test" />);
    expect(screen.queryByTestId('spinner')).toBeInTheDocument();
  });

  it('should render the error state if the application is not found', () => {
    watchResourceMock.mockReturnValue([[], false, { code: 404 }]);
    routerRenderer(<ApplicationDetails applicationName="test" />);
    screen.getByText('404: Page not found');
    screen.getByText('Go to applications list');
  });

  it('should render application display name if application data is loaded', () => {
    watchResourceMock.mockReturnValueOnce([mockApplication, true]);
    routerRenderer(<ApplicationDetails applicationName="test" />);
    expect(screen.queryByTestId('details__title')).toBeInTheDocument();
    expect(screen.queryByTestId('details__title').innerHTML).toBe('Test Application');
  });

  it('should display overview modal on first run', async () => {
    routerRenderer(<ApplicationDetails applicationName="test" />);
    expect(screen.getByTestId('application-modal-content')).toBeVisible();

    act(() => {
      const dismissButton = screen.getByTestId('application-modal-dismiss-btn');
      fireEvent.click(dismissButton);
    });

    waitFor(() => {
      expect(localStorage[HACBS_APPLICATION_MODAL_HIDE_KEY]).toBe('true');
      expect(screen.getByTestId('application-modal-content')).not.toBeVisible();
    });
  });

  it('should not display integration test tab if the mvp flag is set to true', async () => {
    useFeatureFlagMock.mockReturnValue([true]);
    routerRenderer(<ApplicationDetails applicationName="test" />);
    expect(screen.queryByTestId('details__tabItem integrationtests')).not.toBeInTheDocument();
  });

  it('should display the overview tab by default', async () => {
    routerRenderer(<ApplicationDetails applicationName="test" />);
    const appDetails = screen.getByTestId('details');
    const activeTab = appDetails.querySelector(
      '.pf-c-tabs__item.pf-m-current .pf-c-tabs__item-text',
    );
    expect(activeTab).toHaveTextContent('Overview');
  });
  it('should display the correct tab', async () => {
    useParamsMock.mockReturnValue({ activeTab: 'overview' });
    let detailsPage = routerRenderer(<ApplicationDetails applicationName="test" />);
    let appDetails = screen.getByTestId('details');
    let activeTab = appDetails.querySelector('.pf-c-tabs__item.pf-m-current .pf-c-tabs__item-text');
    expect(activeTab).toHaveTextContent('Overview');
    detailsPage.unmount();

    useParamsMock.mockReturnValue({ activeTab: 'activity' });
    detailsPage = routerRenderer(<ApplicationDetails applicationName="test" />);
    appDetails = detailsPage.getByTestId('details');
    activeTab = appDetails.querySelector('.pf-c-tabs__item.pf-m-current .pf-c-tabs__item-text');
    expect(activeTab).toHaveTextContent('Activity');
    detailsPage.unmount();

    useParamsMock.mockReturnValue({ activeTab: 'components' });
    detailsPage = routerRenderer(<ApplicationDetails applicationName="test" />);
    appDetails = screen.getByTestId('details');
    activeTab = appDetails.querySelector('.pf-c-tabs__item.pf-m-current .pf-c-tabs__item-text');
    expect(activeTab).toHaveTextContent('Components');
    detailsPage.unmount();

    useParamsMock.mockReturnValue({ activeTab: 'environments' });
    routerRenderer(<ApplicationDetails applicationName="test" />);
    appDetails = screen.getByTestId('details');
    activeTab = appDetails.querySelector('.pf-c-tabs__item.pf-m-current .pf-c-tabs__item-text');
    expect(activeTab).toHaveTextContent('Environments');
  });
});
