import {FC} from 'react';
import Downshift from 'downshift';
import {FamilyNode} from '@/lib/types';

interface Props {
    data: FamilyNode[];
    inputValue: string;
    selectedItem: FamilyNode | null;
    onSearchChange: (node: FamilyNode) => void;
    onSearchInputChange: (value: string) => void;
    onClearSearchInput: () => void;
}

export const SearchInput: FC<Props> = ({
    data,
    inputValue,
    selectedItem,
    onSearchChange,
    onSearchInputChange,
    onClearSearchInput,
}) => {
    return (
        <Downshift
            id="family-tree-search"
            onChange={(item) => item && onSearchChange(item)}
            itemToString={(item) => (item ? item.name : '')}
            inputValue={inputValue}
            onInputValueChange={onSearchInputChange}
            selectedItem={selectedItem}
        >
            {({
                getInputProps,
                getItemProps,
                getMenuProps,
                getToggleButtonProps,
                inputValue,
                highlightedIndex,
                selectedItem,
                isOpen,
            }) => (
                <div>
                    <input placeholder="Search" {...getInputProps()} />
                    <button {...getToggleButtonProps()} aria-label="toggle menu">
                        &#8595;
                    </button>
                    <button onClick={onClearSearchInput}>Clear</button>
                    <ul {...getMenuProps()}>
                        {isOpen &&
                            data
                                .filter(
                                    (item) =>
                                        !inputValue ||
                                        item.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                                        item.alt_names?.some((altName) =>
                                            altName.toLowerCase().includes(inputValue.toLowerCase())
                                        )
                                )
                                .map((item, index) => (
                                    <li
                                        key={`${item.name}${index}`}
                                        {...getItemProps({
                                            item,
                                            index,
                                            style: {
                                                backgroundColor: highlightedIndex === index ? 'lightgray' : 'white',
                                                fontWeight: selectedItem === item ? 'bold' : 'normal',
                                            },
                                        })}
                                    >
                                        {[item.name, ...(item.alt_names || [])].join(', ')}
                                    </li>
                                ))}
                    </ul>
                </div>
            )}
        </Downshift>
    );
};
