import * as React from 'react';
import { Link } from 'react-router-dom';
import { useFeatureFlag } from '@openshift/dynamic-plugin-sdk';
import {
  Card,
  CardTitle,
  CardBody,
  Alert,
  Grid,
  GridItem,
  Button,
  Title,
  Text,
} from '@patternfly/react-core';
import ExternalLink from '../../shared/components/links/ExternalLink';
import { SIGNUP_FLAG, SIGNUP_PENDING_FLAG } from '../../utils/flag-utils';
import SignupButton from './SignupButton';

import './IntroBanner.scss';

const IntroBanner: React.FC = () => {
  const [signupFlag] = useFeatureFlag(SIGNUP_FLAG);
  const [signupPendingFlag] = useFeatureFlag(SIGNUP_PENDING_FLAG);

  return (
    <Grid>
      <GridItem span={8}>
        <Card className="intro-banner__content" isLarge>
          <CardTitle>
            <Title headingLevel="h1" size="2xl">
              Get started with CI/CD
            </Title>
          </CardTitle>
          <CardBody>
            <Text>
              Import, containerize and deploy to a development environment. With just a few clicks,
              you can interact with your application running in OpenShift and Kubernetes. Build
              here, go anywhere.
            </Text>
          </CardBody>
          <CardBody>
            {!signupFlag ? (
              signupPendingFlag ? (
                <Alert
                  variant="info"
                  isInline
                  title="We have received your request. While you are waiting, please join our Slack channel."
                >
                  <p>
                    We are working hard to get you early access. After we approve your request, we
                    will send you an email notification with information about how you can access
                    and start using the service.
                  </p>
                  <p>
                    Join the{' '}
                    <ExternalLink href="https://dn.dev/slack">
                      #software-supply-chain-security
                    </ExternalLink>{' '}
                    channel on Slack
                  </p>
                </Alert>
              ) : (
                <SignupButton />
              )
            ) : (
              <Button
                component={(props) => <Link {...props} to="/stonesoup/applications" />}
                variant="primary"
                style={{ width: 'fit-content' }}
                data-test="go-to-applications-page"
                isLarge
              >
                + Create an application
              </Button>
            )}
          </CardBody>
        </Card>
      </GridItem>
      <GridItem className="intro-banner__image" span={4} />
    </Grid>
  );
};

export default IntroBanner;
