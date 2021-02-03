import './BorderLayout.css';

function BorderLayout(props) {
    return (
        <div className="border-layout">
            <div className="top">
                {props.top}
            </div>
            <div className="left">
                {props.left}
            </div>
            <div className="center">
                {props.center}
            </div>
            <div className="right">
                {props.right}
            </div>
            <div className="bottom">
                {props.bottom}
            </div>
        </div>
    );
}

export default BorderLayout;
