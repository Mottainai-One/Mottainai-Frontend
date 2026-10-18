import { Children, isValidElement, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import type { DropdownSelectProps } from '@/types/dropdown-select.types';

interface OptionItem {
    value: string;
    label: string;
    disabled: boolean;
}

function textFromNode(node: ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(textFromNode).join('');
    return '';
}

function DropdownSelect({ id, value, onChange, children, className = '', labelledBy, ariaInvalid, ariaDescribedBy, disabled = false, required = false, name }: DropdownSelectProps) {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const options = Children.toArray(children).flatMap((child) => {
        if (!isValidElement<{ value?: string; disabled?: boolean; children?: ReactNode }>(child) || child.type !== 'option') return [];
        const label = textFromNode(child.props.children).trim();
        return [{ value: child.props.value ?? label, label, disabled: Boolean(child.props.disabled) }];
    });
    const selectedLabel = options.find((option) => option.value === value)?.label ?? '';

    useEffect(() => {
        function closeOutside(event: PointerEvent) {
            if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
        }
        document.addEventListener('pointerdown', closeOutside);
        return () => document.removeEventListener('pointerdown', closeOutside);
    }, []);

    useEffect(() => {
        if (open) {
            const selected = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]:not([aria-disabled="true"])');
            const firstEnabled = listRef.current?.querySelector<HTMLElement>('[role="option"]:not([aria-disabled="true"])');
            (selected ?? firstEnabled)?.focus();
        }
    }, [open]);

    function focusEnabledOption(start: number, direction: 1 | -1) {
        const enabled = options.map((option, index) => ({ option, index })).filter(({ option }) => !option.disabled);
        if (!enabled.length) return;
        const current = enabled.findIndex(({ index }) => index === start);
        const nextIndex = current < 0 ? 0 : (current + direction + enabled.length) % enabled.length;
        listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[enabled[nextIndex].index]?.focus();
    }

    function selectOption(option: OptionItem) {
        if (option.disabled) return;
        onChange({ target: { value: option.value } });
        setOpen(false);
        rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }

    function handleOptionKeyDown(event: KeyboardEvent<HTMLLIElement>, option: OptionItem, index: number) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            focusEnabledOption(index, event.key === 'ArrowDown' ? 1 : -1);
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            const enabledItems = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])');
            (event.key === 'Home' ? enabledItems?.[0] : enabledItems?.[enabledItems.length - 1])?.focus();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectOption(option);
        } else if (event.key === 'Tab') {
            setOpen(false);
        }
    }

    return (
        <div className={`motta-dropdown ${className}`} ref={rootRef}>
            {name && <input name={name} type="hidden" value={value} />}
            <button
                aria-controls={`${controlId}-listbox`}
                aria-describedby={ariaDescribedBy}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-invalid={ariaInvalid || undefined}
                aria-labelledby={labelledBy}
                className="motta-dropdown__trigger"
                disabled={disabled}
                id={controlId}
                onClick={() => setOpen((current) => !current)}
                onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        setOpen(true);
                    }
                }}
                role="combobox"
                aria-required={required || undefined}
                type="button"
            >
                <span>{selectedLabel}</span>
                <span aria-hidden="true" className={`motta-dropdown__arrow${open ? ' motta-dropdown__arrow--open' : ''}`} />
            </button>
            {open && (
                <ul aria-labelledby={controlId} className="motta-dropdown__list" id={`${controlId}-listbox`} ref={listRef} role="listbox">
                    {options.map((option, index) => (
                        <li
                            aria-disabled={option.disabled || undefined}
                            aria-selected={option.value === value}
                            className="motta-dropdown__option"
                            key={option.value}
                            onClick={() => selectOption(option)}
                            onKeyDown={(event) => handleOptionKeyDown(event, option, index)}
                            onMouseDown={(event) => event.preventDefault()}
                            role="option"
                            tabIndex={-1}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default DropdownSelect;
