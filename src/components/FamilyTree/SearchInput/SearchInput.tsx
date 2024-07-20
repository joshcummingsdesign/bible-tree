import {FC} from 'react';
import {FamilyNode} from '@/lib/types';
import {Autocomplete, TextField} from '@mui/material';

interface Props {
    className?: string;
    data: FamilyNode[];
    value: FamilyNode | null;
    inputValue: string;
    onSearchChange: (node: FamilyNode) => void;
    onSearchInputChange: (value: string) => void;
    onClearSearchInput: () => void;
}

export const SearchInput: FC<Props> = ({
    className,
    data,
    value,
    inputValue,
    onSearchChange,
    onSearchInputChange,
    onClearSearchInput,
}) => {
    return (
        <Autocomplete
            id="btr-search"
            className={className}
            value={value}
            inputValue={inputValue}
            onInputChange={(_, v) => onSearchInputChange(v)}
            getOptionLabel={(d) => d.name}
            onChange={(_, v, reason) => {
                if (v) {
                    const d: any = {...v};
                    delete d.label;
                    onSearchChange(d);
                }
                if (reason === 'clear') {
                    onClearSearchInput();
                }
            }}
            renderOption={({key, ...props}, d) => (
                <li key={d.id} {...props}>
                    {d.name}
                </li>
            )}
            filterOptions={(options, {inputValue}) =>
                options.filter(
                    (option) =>
                        option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                        option.alt_names?.some((altName) => altName.toLowerCase().includes(inputValue.toLowerCase()))
                )
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            options={data.map((d) => ({...d, label: `${d.id}: ${d.name}`}))}
            sx={{width: 300}}
            renderInput={(params: any) => <TextField {...params} label="Search" />}
        />
    );
};
