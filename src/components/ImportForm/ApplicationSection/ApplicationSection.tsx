import * as React from 'react';
import { TextContent, Text, HelperText, FormSection } from '@patternfly/react-core';
import { useField } from 'formik';
import { InputField } from '../../../shared';
import { HeadTitle } from '../../HeadTitle';
import { useValidApplicationName } from '../utils/useValidApplicationName';

const ApplicationSection: React.FunctionComponent = () => {
  const [validName] = useValidApplicationName();
  const [, { value, touched }, { setValue, setTouched }] = useField<string>('application');

  React.useEffect(() => {
    if (!value && !touched && validName) {
      setValue(validName);
    }
  }, [setValue, touched, validName, value]);

  React.useEffect(() => {
    if (value && !touched) {
      setTouched(true, false);
    }
  }, [setTouched, touched, value]);

  return (
    <>
      <HeadTitle>Import - Name application | CI/CD</HeadTitle>
      <TextContent>
        <Text component="h2">Name your application</Text>
        <HelperText>Enter a name for your application.</HelperText>
      </TextContent>
      <FormSection>
        <InputField name="application" label="Name" placeholder="Enter name" required />
      </FormSection>
    </>
  );
};

export default ApplicationSection;
