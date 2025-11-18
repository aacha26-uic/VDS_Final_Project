import React, { useState } from 'react';
import { Knob } from 'primereact/knob';

export default function KnobSlider() {
    const [value, setValue] = useState(60);

    return (
        <div className="card flex justify-content-center">
            <Knob value={value} onChange={(e) => setValue(e.value)} size={275} min={0} max={50} rangeColor="#708090" valueColor="#d75f4c" />
        </div>
    )
}
        