import React from 'react';
import { ProgressIndicator as BaseProgressIndicator } from '../visuals/ProgressIndicator';
import type { ProgressIndicatorProps } from '../visuals/types';

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = (props) => {
  return <BaseProgressIndicator {...props} />;
};
export default ProgressIndicator;
