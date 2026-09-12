import React from 'react';
import { Timeline as BaseTimeline } from '../visuals/Timeline';
import type { TimelineProps } from '../visuals/types';

export const Timeline: React.FC<TimelineProps> = (props) => {
  return <BaseTimeline {...props} />;
};
export default Timeline;
