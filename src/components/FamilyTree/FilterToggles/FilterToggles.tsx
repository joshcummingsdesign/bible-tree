import {forwardRef, useImperativeHandle, useState} from 'react';
import {Box, Checkbox, FormControlLabel, styled} from '@mui/material';

export type FilterTogglesState = {[key: string]: boolean};

export interface FilterTogglesRef {
    reset: () => void;
}

interface Props {
    options: string[];
    onChange?: (value: FilterTogglesState) => void;
}

const FilterToggles = forwardRef<FilterTogglesRef, Props>(({options, onChange}, ref) => {
    const getInitialState = (value: boolean) =>
        options.reduce<FilterTogglesState>((acc, option) => {
            acc[option] = value;
            return acc;
        }, {});

    const [state, setState] = useState<FilterTogglesState>(getInitialState(true));

    const handleAllToggle = (value: boolean) => {
        let newState = getInitialState(false);
        if (value) {
            newState = getInitialState(true);
        }
        setState(newState);
        onChange?.(newState);
    };

    const handleOptionToggle = (option: string, value: boolean) => {
        const newState = {
            ...state,
            [option]: value,
        };
        setState(newState);
        onChange?.(newState);
    };

    // Define the reset method
    const reset = () => {
        setState(getInitialState(true));
    };

    // Use useImperativeHandle to expose the reset method
    useImperativeHandle(ref, () => ({
        reset,
    }));

    const isAllChecked = Object.values(state).every((o) => o === true);
    const isAllIndeterminate = !isAllChecked && Object.values(state).some((o) => o === true);

    return (
        <div>
            <FormControlLabel
                label="All"
                control={
                    <Checkbox
                        checked={isAllChecked}
                        indeterminate={isAllIndeterminate}
                        onChange={(_, v) => handleAllToggle(v)}
                    />
                }
            />
            <CheckboxGroup>
                {options.map((option) => (
                    <FormControlLabel
                        key={option}
                        label={option.charAt(0).toUpperCase() + option.slice(1)}
                        control={
                            <Checkbox checked={state[option]} onChange={(_, v) => handleOptionToggle(option, v)} />
                        }
                    />
                ))}
            </CheckboxGroup>
        </div>
    );
});

const CheckboxGroup = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

FilterToggles.displayName = 'FilterToggles';
export default FilterToggles;
