import React from "react";

function Backdrop(props: any) {
    return (
        <div className="backdrop" onClick={props.onClick} />
    );
}

export default Backdrop;