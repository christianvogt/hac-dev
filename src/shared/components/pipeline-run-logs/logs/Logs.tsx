import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  commonFetchText,
  getK8sResourceURL,
  QueryOptions,
  WebSocketFactory,
} from '@openshift/dynamic-plugin-sdk-utils';
import { Alert } from '@patternfly/react-core';
import { Base64 } from 'js-base64';
import { PodModel } from '../../../../models/pod';
import { ContainerSpec, PodKind } from '../../types';
import { LOG_SOURCE_TERMINATED } from '../utils';

import './Logs.scss';

type LogsProps = {
  resource: PodKind;
  resourceStatus: string;
  container: ContainerSpec;
  render: boolean;
  autoScroll?: boolean;
  onComplete: (containerName: string) => void;
  errorMessage?: string;
};

const Logs: React.FC<LogsProps> = ({
  resource,
  resourceStatus,
  container,
  onComplete,
  render,
  autoScroll = true,
  errorMessage,
}) => {
  const { t } = useTranslation();
  const { name } = container;
  const { kind, metadata = {} } = resource;
  const { name: resName, namespace: resNamespace } = metadata;
  const scrollToRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<boolean>(false);
  const resourceStatusRef = React.useRef<string>(resourceStatus);
  const onCompleteRef = React.useRef<(name) => void>();
  onCompleteRef.current = onComplete;

  const appendMessage = React.useRef<(blockContent) => void>();

  appendMessage.current = React.useCallback(
    (blockContent: string) => {
      if (contentRef.current && blockContent) {
        contentRef.current.innerText += blockContent;
      }
      if (scrollToRef.current && blockContent && render && autoScroll) {
        scrollToRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [autoScroll, render],
  );

  if (resourceStatusRef.current !== resourceStatus) {
    resourceStatusRef.current = resourceStatus;
  }

  React.useEffect(() => {
    let loaded: boolean = false;
    let ws: WebSocketFactory;
    const urlOpts: QueryOptions = {
      ns: resNamespace,
      name: resName,
      path: 'log',
      queryParams: {
        container: name,
        follow: 'true',
      },
    };
    const watchURL = getK8sResourceURL(PodModel, undefined, urlOpts);
    if (resourceStatusRef.current === LOG_SOURCE_TERMINATED) {
      commonFetchText(watchURL)
        .then((res) => {
          if (loaded) return;
          appendMessage.current(res);
          onCompleteRef.current(name);
        })
        .catch(() => {
          if (loaded) return;
          setError(true);
          onCompleteRef.current(name);
        });
    } else {
      const wsOpts = {
        path: watchURL,
      };
      ws = new WebSocketFactory(watchURL, wsOpts);
      ws.onMessage((msg) => {
        if (loaded) return;
        const message = Base64.decode(msg);
        appendMessage.current(message);
      })
        .onClose(() => {
          onCompleteRef.current(name);
        })
        .onError(() => {
          if (loaded) return;
          setError(true);
          onCompleteRef.current(name);
        });
    }
    return () => {
      loaded = true;
      ws && ws.destroy();
    };
  }, [kind, name, resName, resNamespace]);

  React.useEffect(() => {
    if (scrollToRef.current && render && autoScroll) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScroll, render]);

  return (
    <div className="logs" style={{ display: render ? '' : 'none' }}>
      <p className="logs__name">{name}</p>
      {error ||
        (!resource && errorMessage && (
          <Alert
            variant="danger"
            isInline
            title={
              errorMessage
                ? errorMessage
                : t('An error occurred while retrieving the requested logs.')
            }
          />
        ))}
      <div>
        <div className="logs__content" ref={contentRef} />
        <div ref={scrollToRef} />
      </div>
    </div>
  );
};

export default Logs;
