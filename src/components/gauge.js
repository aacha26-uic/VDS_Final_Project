// Note: UI Component Source: https://primereact.org/knob/

import { Knob } from 'primereact/knob';

export default function KnobSlider({value, onChange}) {
    // The above makes this component expect 2 variable values: - value, and onChange
    return (
        <div className="card flex justify-content-center">
            {/* Update the value of the blob whatever has been passed in*/}
            <Knob value={value} onChange={(e) => onChange(e.value)} size={275} min={0} max={1875} rangeColor="#708090" valueColor="#d75f4c" />
        </div>
    )
}
        