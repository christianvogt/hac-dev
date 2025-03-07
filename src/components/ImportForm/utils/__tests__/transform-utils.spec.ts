import { mockDetectedComponent } from '../__data__/mock-cdq';
import { createResourceData, transformComponentValues } from '../transform-utils';

const mockResourceRequests = {
  requests: {
    cpu: '2',
    memory: '1Gi',
  },
};

const mockResourceLimits = {
  limits: {
    cpu: '48m',
    memory: '516Mi',
  },
};

describe('Transform Utils', () => {
  it('should create resource data from resource requests', () => {
    const result = createResourceData(mockResourceRequests);
    expect(result).toEqual({
      cpu: '2',
      cpuUnit: 'cores',
      memory: '1',
      memoryUnit: 'Gi',
    });
  });

  it('should create resource data from resource limits', () => {
    const result = createResourceData(mockResourceLimits);
    expect(result).toEqual({
      cpu: '48',
      cpuUnit: 'millicores',
      memory: '516',
      memoryUnit: 'Mi',
    });
  });

  it('should create default resource data', () => {
    const result = createResourceData({});
    expect(result).toEqual({
      cpu: '10',
      cpuUnit: 'millicores',
      memory: '50',
      memoryUnit: 'Mi',
    });
  });

  it('should transform component values for submit utils', () => {
    const transformedComponentValues = transformComponentValues(mockDetectedComponent);
    expect(transformedComponentValues).toEqual([
      {
        componentStub: {
          application: 'insert-application-name',
          componentName: 'nodejs',
          source: {
            git: {
              context: './',
              url: 'https://github.com/nodeshift-starters/devfile-sample.git',
            },
          },
          resources: { cpu: '10', cpuUnit: 'millicores', memory: '50', memoryUnit: 'Mi' },
          replicas: 1,
          targetPort: 8080,
          route: undefined,
          env: undefined,
        },
        devfileFound: true,
        language: 'nodejs',
        projectType: 'nodejs',
      },
    ]);
  });
});
