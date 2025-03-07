import * as React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceProviderType, SPIAccessCheckAccessibilityStatus } from '../../../../types';
import { formikRenderer } from '../../../../utils/test-utils';
import { useAccessCheck, useAccessTokenBinding } from '../../utils/auth-utils';
import { SourceSection } from '../SourceSection';

import '@testing-library/jest-dom';

jest.mock('../../utils/auth-utils', () => ({
  useAccessTokenBinding: jest.fn(),
  useAccessCheck: jest.fn(),
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    auth: { getToken: () => Promise.resolve('token') },
    helpTopics: { setActiveTopic: jest.fn(), enableTopics: jest.fn(), disableTopics: jest.fn() },
  }),
}));

jest.mock('../../../../shared/hooks', () => ({
  useFormikValidationFix: jest.fn(),
}));

const useAccessCheckMock = useAccessCheck as jest.Mock;
const useBindingMock = useAccessTokenBinding as jest.Mock;

const renderSourceSection = (showSamples = true) => {
  const onClick = jest.fn();

  const utils = formikRenderer(
    <SourceSection onStrategyChange={showSamples ? onClick : undefined} />,
    { source: { git: { url: '' } } },
  );
  const user = userEvent.setup();

  return { input: utils.getByPlaceholderText('Enter your source'), ...utils, onClick, user };
};

afterEach(jest.resetAllMocks);

describe('SourceSection', () => {
  it('renders input field and sample button', () => {
    useAccessCheckMock.mockReturnValue([{}, false]);
    renderSourceSection();

    expect(screen.getByPlaceholderText('Enter your source')).toBeInTheDocument();
    expect(screen.queryByTestId('start-with-sample-button')).toBeInTheDocument();
  });

  it('hides sample button', () => {
    useAccessCheckMock.mockReturnValue([{}, false]);
    renderSourceSection(false);

    expect(screen.queryByTestId('start-with-sample-button')).toBeNull();
  });

  it('fires callback on sample button click', () => {
    useAccessCheckMock.mockReturnValue([{}, false]);

    const { onClick } = renderSourceSection();

    fireEvent.click(screen.getByTestId('start-with-sample-button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('displays error when repo is not accessible', async () => {
    useAccessCheckMock.mockReturnValue([
      { isRepoAccessible: false, serviceProvider: ServiceProviderType.GitHub },
      true,
    ]);
    useBindingMock.mockReturnValue(['', true]);

    renderSourceSection();

    expect(screen.getByPlaceholderText('Enter your source')).toBeInvalid();
    expect(screen.getByText('Unable to access repository')).toBeVisible();
  });

  it('displays error when provider is not supported', async () => {
    useAccessCheckMock.mockReturnValue([{ isRepoAccessible: false, serviceProvider: '' }, true]);

    renderSourceSection();

    expect(screen.getByPlaceholderText('Enter your source')).toBeInvalid();
    expect(screen.getByText('This provider is not supported')).toBeVisible();
  });

  it('validates input field when repo is accessible', async () => {
    useAccessCheckMock.mockReturnValue([
      { isRepoAccessible: true, serviceProvider: ServiceProviderType.GitHub },
      true,
    ]);

    renderSourceSection();

    expect(screen.getByPlaceholderText('Enter your source')).toBeValid();
    expect(screen.getByText('Access validated')).toBeVisible();
  });

  it('should show Authorization when github repo is not accessible', async () => {
    useAccessCheckMock.mockReturnValue([
      { isRepoAccessible: false, serviceProvider: ServiceProviderType.GitHub },
      true,
    ]);
    useBindingMock.mockReturnValue(['', true]);

    renderSourceSection();

    expect(screen.getByPlaceholderText('Enter your source')).toBeInvalid();
    expect(screen.getByText('Unable to access repository')).toBeVisible();
    await waitFor(() => expect(screen.getByText('Authorization')).toBeInTheDocument());
  });

  it('should show Authorization if container image is not accessible', async () => {
    useAccessCheckMock.mockReturnValue([
      { isRepoAccessible: false, isGit: false, serviceProvider: ServiceProviderType.Quay },
      true,
    ]);
    useBindingMock.mockReturnValue(['', true]);

    renderSourceSection();

    await waitFor(() => expect(screen.getByText('Authorization')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('Git options')).toBeNull());
  });

  it('should not show Authorization or Git options if input is invalid', async () => {
    useAccessCheckMock.mockReturnValue([{}, false]);

    const { input, user } = renderSourceSection();

    await user.type(input, 'docker.io/example');

    await waitFor(() => expect(screen.queryByText('Authorization')).toBeNull());
    await waitFor(() => expect(screen.queryByText('Git options')).toBeNull());
  });

  it('should show git options for a valid git url and accessible', async () => {
    useAccessCheckMock.mockReturnValue([
      { isRepoAccessible: true, isGit: true, serviceProvider: ServiceProviderType.GitHub },
      true,
    ]);

    const { input, user } = renderSourceSection();

    await user.type(input, 'https://github.com/example/repo');

    await waitFor(() => expect(screen.queryByText('Git options')).toBeInTheDocument());

    await user.type(input, 'dummy text');

    await waitFor(() => expect(screen.queryByText('Git options')).toBeNull());
  });

  it('should show proper states for valid url based on useAccessCheck Values', async () => {
    useAccessCheckMock.mockReturnValue([{}, false]);

    const { input, user } = renderSourceSection();

    await user.type(input, 'https://github.com/example/repo');

    await waitFor(() => expect(screen.getByPlaceholderText('Enter your source')).toBeValid());
    await waitFor(() => screen.getByText('Checking access...'));

    useAccessCheckMock.mockReturnValue([
      { isRepoAccessible: true, isGit: true, serviceProvider: ServiceProviderType.GitHub },
      true,
    ]);

    await user.type(input, 's');

    await waitFor(() => expect(screen.getByPlaceholderText('Enter your source')).toBeValid());
    await waitFor(() => screen.getByText('Access validated'));
    await waitFor(() => expect(screen.getByText('Git options')).toBeInTheDocument());
  });

  it('should fetch secret if private repository has been previously authenticated', async () => {
    useAccessCheckMock.mockReturnValue([
      {
        isRepoAccessible: true,
        isGit: true,
        serviceProvider: ServiceProviderType.GitHub,
        accessibility: SPIAccessCheckAccessibilityStatus.private,
      },
      true,
    ]);

    const { input, user } = renderSourceSection();

    expect(useBindingMock).toHaveBeenCalledWith('');
    await user.type(input, 'https://github.com/example/repo');
    expect(useBindingMock).toHaveBeenCalledWith('https://github.com/example/repo');
  });

  it('should render git only option', () => {
    useAccessCheckMock.mockReturnValue([{}, false]);
    renderSourceSection(false);
    expect(screen.queryByText(/container/)).toBeNull();
  });

  it('should render the sample info alert', () => {
    useAccessCheckMock.mockReturnValue([{}, false]);
    renderSourceSection();
    screen.getByTestId('samples-info-alert');
  });

  it('should not render the samples info alert', () => {
    useAccessCheckMock.mockReturnValue([{}, false]);
    renderSourceSection(false);
    expect(screen.queryByTestId('samples-info-alert')).toBeNull();
  });
});
