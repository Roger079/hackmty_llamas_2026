import React from 'react';
import { GeoMap as BaseGeoMap } from '../visuals/GeoMap';
import type { GeoMapProps } from '../visuals/types';

export const GeoMap: React.FC<GeoMapProps> = (props) => {
  return <BaseGeoMap {...props} />;
};
export default GeoMap;
