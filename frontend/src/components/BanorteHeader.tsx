import React from 'react';
import { BanortePortalHeader, BanortePortalHeaderProps } from './BanortePortalHeader';

export type BanorteHeaderProps = BanortePortalHeaderProps;
export const BanorteHeader: React.FC<BanorteHeaderProps> = (props) => <BanortePortalHeader {...props} />;
