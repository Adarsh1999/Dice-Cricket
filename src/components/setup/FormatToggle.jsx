import React from 'react';
import Icon from '../ui/Icon';

const FORMATS = [
    {
        id: 'oneday',
        label: 'One Day',
        description: 'Two innings · fast chase',
        icon: 'zap',
    },
    {
        id: 'test',
        label: 'Test Match',
        description: 'Four innings · lead & trail',
        icon: 'shield',
    },
];

function FormatToggle({ value, onChange }) {
    return (
        <div className="format-toggle" role="radiogroup" aria-label="Match format">
            {FORMATS.map((format) => {
                const isSelected = value === format.id;

                return (
                    <button
                        aria-checked={isSelected}
                        className={`format-option ${isSelected ? 'format-option--active' : ''}`}
                        key={format.id}
                        onClick={() => onChange(format.id)}
                        role="radio"
                        type="button"
                    >
                        <span className="format-option__icon">
                            <Icon name={format.icon} size={20} />
                        </span>
                        <span>
                            <strong>{format.label}</strong>
                            <small>{format.description}</small>
                        </span>
                        <span className="format-option__check">
                            {isSelected && <Icon name="check" size={14} />}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default FormatToggle;
