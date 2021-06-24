// @flow 
import { PropTypes } from '@material-ui/core';
import { Chip } from '@material-ui/core';
import * as React from 'react';

interface MuiChipProps {
    label: string;
    color?: Exclude<PropTypes.Color, 'inherit'>
};
const MuiChip: React.FC<MuiChipProps> = (props) => {
    return (
        <Chip label={props.label} color={props.color}/>
    );
};

export default MuiChip;