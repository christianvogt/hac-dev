import * as React from 'react';
import { Popover, PopoverProps } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';

const HelpPopover: React.FC<Omit<PopoverProps, 'children'>> = (props) => (
  <Popover {...props}>
    <span aria-label="help" role="button" tabIndex={0}>
      <OutlinedQuestionCircleIcon />
    </span>
  </Popover>
);

export default HelpPopover;
